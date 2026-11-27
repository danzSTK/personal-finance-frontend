import { useCallback, useEffect, useRef, useState } from 'react'
import { FISCAL_NOTE_QR_SCANNER_THROTTLE_MS } from '../constants/fiscal-notes.constants'
import {
  createQrBarcodeDetector,
  ensureQrBarcodeDetectorReady,
} from '../utils/qrBarcodeDetector.utils'

export type QrScannerStatus =
  | 'idle'
  | 'initializing'
  | 'scanning'
  | 'paused'
  | 'error'

export type QrScannerErrorReason =
  | 'insecure_context'
  | 'camera_unavailable'
  | 'permission_denied'
  | 'camera_not_found'
  | 'camera_in_use'
  | 'overconstrained'
  | 'unknown'

export interface QrScannerError {
  reason: QrScannerErrorReason
  title: string
  description: string
}

export interface QrBarcodeDetectionResult {
  rawValue: string
}

export interface QrBarcodeDetectorLike {
  detect: (
    source: HTMLVideoElement
  ) => Promise<ReadonlyArray<QrBarcodeDetectionResult>>
}

export interface QrScannerMediaDevices {
  getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>
  enumerateDevices?: () => Promise<MediaDeviceInfo[]>
}

export interface UseQrCodeScannerOptions {
  active: boolean
  onDetect: (rawValue: string) => void
  scanIntervalMs?: number
  mediaDevices?: QrScannerMediaDevices
  detectorFactory?: () => QrBarcodeDetectorLike
  ensureDetectorReady?: () => Promise<void>
  isSecureContextOverride?: boolean
}

interface TorchMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean
}

interface TorchMediaTrackConstraintSet extends MediaTrackConstraintSet {
  torch?: boolean
}

const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]'])

const SCANNER_ERRORS: Record<QrScannerErrorReason, QrScannerError> = {
  insecure_context: {
    reason: 'insecure_context',
    title: 'Conexão segura necessária para câmera',
    description:
      'O acesso à câmera exige HTTPS ou localhost. Envie uma foto da galeria ou cole a chave/URL manualmente.',
  },
  camera_unavailable: {
    reason: 'camera_unavailable',
    title: 'Câmera indisponível neste navegador',
    description:
      'Este navegador não oferece suporte ao acesso à câmera. Use uma foto da galeria ou digite a chave/URL.',
  },
  permission_denied: {
    reason: 'permission_denied',
    title: 'Permissão da câmera negada',
    description:
      'Autorize o uso da câmera nas configurações do navegador ou use uma foto da galeria / entrada manual.',
  },
  camera_not_found: {
    reason: 'camera_not_found',
    title: 'Nenhuma câmera encontrada',
    description:
      'Não detectamos câmera neste dispositivo. Você pode enviar uma foto do QR Code ou colar a chave.',
  },
  camera_in_use: {
    reason: 'camera_in_use',
    title: 'Câmera ocupada por outro aplicativo',
    description:
      'Feche outros apps que estejam usando a câmera e tente novamente, ou use foto / entrada manual.',
  },
  overconstrained: {
    reason: 'overconstrained',
    title: 'Configuração de câmera incompatível',
    description:
      'Não foi possível iniciar a câmera selecionada. Tente alternar de câmera ou usar outra forma de leitura.',
  },
  unknown: {
    reason: 'unknown',
    title: 'Não foi possível iniciar a câmera',
    description:
      'Ocorreu uma falha inesperada ao acessar a câmera. Tente novamente ou use foto da galeria / entrada manual.',
  },
}

const getErrorName = (error: unknown): string | null => {
  if (
    error &&
    typeof error === 'object' &&
    'name' in error &&
    typeof error.name === 'string'
  ) {
    return error.name
  }

  return null
}

const mapMediaError = (error: unknown): QrScannerError => {
  switch (getErrorName(error)) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return SCANNER_ERRORS.permission_denied
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return SCANNER_ERRORS.camera_not_found
    case 'NotReadableError':
    case 'TrackStartError':
      return SCANNER_ERRORS.camera_in_use
    case 'OverconstrainedError':
      return SCANNER_ERRORS.overconstrained
    default:
      return SCANNER_ERRORS.unknown
  }
}

const stopMediaStream = (stream: MediaStream | null) => {
  if (!stream) {
    return
  }

  stream.getTracks().forEach((track) => {
    try {
      track.stop()
    } catch {
      // Ignore track teardown errors on partial/mocked streams.
    }
  })
}

const supportsTorch = (track: MediaStreamTrack | undefined): boolean => {
  if (!track || typeof track.getCapabilities !== 'function') {
    return false
  }

  try {
    const capabilities = track.getCapabilities() as TorchMediaTrackCapabilities
    return 'torch' in capabilities && Boolean(capabilities.torch)
  } catch {
    return false
  }
}

/**
 * Manages rear-camera WebRTC stream lifecycle, throttled QR detection with single-shot lock,
 * camera switching, torch control, and React Strict Mode-safe teardown.
 */
export const useQrCodeScanner = ({
  active,
  onDetect,
  scanIntervalMs = FISCAL_NOTE_QR_SCANNER_THROTTLE_MS,
  mediaDevices,
  detectorFactory = createQrBarcodeDetector,
  ensureDetectorReady = ensureQrBarcodeDetectorReady,
  isSecureContextOverride,
}: UseQrCodeScannerOptions) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<QrBarcodeDetectorLike | null>(null)
  const sessionIdRef = useRef(0)
  const inFlightRef = useRef(false)
  const statusRef = useRef<QrScannerStatus>('idle')
  const onDetectRef = useRef(onDetect)
  const mediaDevicesRef = useRef(mediaDevices)
  const detectorFactoryRef = useRef(detectorFactory)
  const ensureDetectorReadyRef = useRef(ensureDetectorReady)

  const [status, setStatus] = useState<QrScannerStatus>('idle')
  const [error, setError] = useState<QrScannerError | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [requestedDeviceId, setRequestedDeviceId] = useState<string | null>(
    null
  )
  const [currentTrackDeviceId, setCurrentTrackDeviceId] = useState<
    string | null
  >(null)
  const [torchSupported, setTorchSupported] = useState(false)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const activeDeviceId = requestedDeviceId ?? currentTrackDeviceId
  const canSwitchCamera = devices.length > 1

  const updateStatus = useCallback((nextStatus: QrScannerStatus) => {
    statusRef.current = nextStatus
    setStatus(nextStatus)
  }, [])

  useEffect(() => {
    onDetectRef.current = onDetect
  }, [onDetect])

  useEffect(() => {
    mediaDevicesRef.current = mediaDevices
    detectorFactoryRef.current = detectorFactory
    ensureDetectorReadyRef.current = ensureDetectorReady
  }, [detectorFactory, ensureDetectorReady, mediaDevices])

  const cleanupSession = useCallback(() => {
    stopMediaStream(streamRef.current)
    streamRef.current = null
    detectorRef.current = null
    inFlightRef.current = false

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setTorchSupported(false)
    setTorchEnabled(false)
  }, [])

  useEffect(() => {
    const sessionId = ++sessionIdRef.current

    if (!active) {
      cleanupSession()
      setError(null)
      updateStatus('idle')
      return
    }

    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      cleanupSession()
      setError(SCANNER_ERRORS.camera_unavailable)
      updateStatus('error')
      return
    }

    const hostname = window.location?.hostname ?? ''
    const isLocalhost = LOCALHOST_HOSTNAMES.has(hostname)
    const hasSecureContext =
      isSecureContextOverride ??
      (isLocalhost || window.isSecureContext !== false)

    if (!hasSecureContext) {
      cleanupSession()
      setError(SCANNER_ERRORS.insecure_context)
      updateStatus('error')
      return
    }

    const resolvedMediaDevices: QrScannerMediaDevices | undefined =
      mediaDevicesRef.current ?? navigator.mediaDevices

    if (
      !resolvedMediaDevices ||
      typeof resolvedMediaDevices.getUserMedia !== 'function'
    ) {
      cleanupSession()
      setError(SCANNER_ERRORS.camera_unavailable)
      updateStatus('error')
      return
    }

    setError(null)
    updateStatus('initializing')

    const startCamera = async () => {
      const constraints: MediaStreamConstraints = {
        video: requestedDeviceId
          ? { deviceId: { exact: requestedDeviceId } }
          : { facingMode: { ideal: 'environment' } },
        audio: false,
      }

      let stream: MediaStream | null = null

      try {
        stream = await resolvedMediaDevices.getUserMedia(constraints)
        if (sessionId !== sessionIdRef.current) {
          stopMediaStream(stream)
          return
        }

        await ensureDetectorReadyRef.current()
        if (sessionId !== sessionIdRef.current) {
          stopMediaStream(stream)
          return
        }

        const detector = detectorFactoryRef.current()
        streamRef.current = stream
        detectorRef.current = detector

        const videoElement = videoRef.current
        if (videoElement) {
          videoElement.srcObject = stream
          if (typeof videoElement.play === 'function') {
            await videoElement.play().catch(() => undefined)
          }
        }

        if (sessionId !== sessionIdRef.current) {
          cleanupSession()
          return
        }

        const [videoTrack] = stream.getVideoTracks()
        const settingsDeviceId = videoTrack?.getSettings?.().deviceId ?? null
        setCurrentTrackDeviceId(settingsDeviceId)
        setTorchSupported(supportsTorch(videoTrack))
        setTorchEnabled(false)

        if (typeof resolvedMediaDevices.enumerateDevices === 'function') {
          try {
            const allDevices = await resolvedMediaDevices.enumerateDevices()
            if (sessionId !== sessionIdRef.current) {
              return
            }

            const videoDevices = allDevices.filter(
              (device) => device.kind === 'videoinput'
            )
            setDevices(videoDevices)
            if (!settingsDeviceId && videoDevices.length > 0) {
              setCurrentTrackDeviceId(videoDevices[0].deviceId || null)
            }
          } catch {
            // Device enumeration failure should not block an active stream.
          }
        }

        if (sessionId !== sessionIdRef.current) {
          cleanupSession()
          return
        }

        updateStatus('scanning')
      } catch (startError: unknown) {
        stopMediaStream(stream)
        if (sessionId !== sessionIdRef.current) {
          return
        }

        cleanupSession()
        setError(mapMediaError(startError))
        updateStatus('error')
      }
    }

    void startCamera()

    return () => {
      sessionIdRef.current += 1
      cleanupSession()
    }
  }, [
    active,
    cleanupSession,
    isSecureContextOverride,
    requestedDeviceId,
    retryCount,
    updateStatus,
  ])

  useEffect(() => {
    if (status !== 'scanning') {
      return
    }

    let cancelled = false
    let rafId = 0
    let lastScanAt: number | null = null

    const tick = (timestamp: number) => {
      if (cancelled || statusRef.current !== 'scanning') {
        return
      }

      const elapsedSinceLastScan =
        lastScanAt === null ? Infinity : timestamp - lastScanAt

      if (elapsedSinceLastScan >= scanIntervalMs) {
        const video = videoRef.current
        const detector = detectorRef.current

        if (
          video &&
          detector &&
          video.readyState >= 2 &&
          !inFlightRef.current
        ) {
          inFlightRef.current = true
          lastScanAt = timestamp

          void detector
            .detect(video)
            .then((results) => {
              if (cancelled || statusRef.current !== 'scanning') {
                return
              }

              const match = results.find(
                (item) => item.rawValue.trim().length > 0
              )
              if (match) {
                // Single-shot lock prevents duplicate preview requests from subsequent frames.
                updateStatus('paused')
                onDetectRef.current(match.rawValue.trim())
              }
            })
            .catch(() => undefined)
            .finally(() => {
              inFlightRef.current = false
            })
        }
      }

      if (!cancelled && statusRef.current === 'scanning') {
        rafId = window.requestAnimationFrame(tick)
      }
    }

    rafId = window.requestAnimationFrame(tick)

    return () => {
      cancelled = true
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [scanIntervalMs, status, updateStatus])

  const pause = useCallback(() => {
    if (statusRef.current === 'scanning') {
      updateStatus('paused')
    }
  }, [updateStatus])

  const resume = useCallback(() => {
    if (statusRef.current === 'paused' && streamRef.current) {
      updateStatus('scanning')
    }
  }, [updateStatus])

  const retry = useCallback(() => {
    cleanupSession()
    setError(null)
    setRetryCount((prev) => prev + 1)
  }, [cleanupSession])

  const switchCamera = useCallback(() => {
    if (devices.length < 2) {
      return
    }

    const currentIndex = activeDeviceId
      ? devices.findIndex((device) => device.deviceId === activeDeviceId)
      : 0
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0
    const nextDevice = devices[(safeCurrentIndex + 1) % devices.length]

    if (nextDevice?.deviceId) {
      setRequestedDeviceId(nextDevice.deviceId)
    }
  }, [activeDeviceId, devices])

  const toggleTorch = useCallback(async () => {
    const [videoTrack] = streamRef.current?.getVideoTracks() ?? []
    if (!videoTrack || !torchSupported || typeof videoTrack.applyConstraints !== 'function') {
      return
    }

    const nextTorchState = !torchEnabled

    try {
      const constraint: TorchMediaTrackConstraintSet = {
        torch: nextTorchState,
      }
      await videoTrack.applyConstraints({
        advanced: [constraint],
      })
      setTorchEnabled(nextTorchState)
    } catch {
      // Never break scanning if the device rejects torch constraint updates.
    }
  }, [torchEnabled, torchSupported])

  return {
    videoRef,
    status,
    error,
    devices,
    activeDeviceId,
    torchSupported,
    torchEnabled,
    canSwitchCamera,
    switchCamera,
    toggleTorch,
    retry,
    pause,
    resume,
  }
}
