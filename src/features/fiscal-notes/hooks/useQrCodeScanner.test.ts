import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type QrBarcodeDetectorLike,
  type QrScannerMediaDevices,
  useQrCodeScanner,
} from './useQrCodeScanner'

interface MockTrackOptions {
  deviceId?: string
  torch?: boolean
  applyConstraintsError?: Error
}

const createMockTrack = (options: MockTrackOptions = {}) => {
  const stop = vi.fn()
  const applyConstraints = options.applyConstraintsError
    ? vi.fn().mockRejectedValue(options.applyConstraintsError)
    : vi.fn().mockResolvedValue(undefined)

  const track = {
    stop,
    getSettings: vi.fn(() => ({
      deviceId: options.deviceId ?? 'cam-back',
    })),
    getCapabilities: vi.fn(() =>
      options.torch ? { torch: true } : {}
    ),
    applyConstraints,
  } as unknown as MediaStreamTrack

  return { track, stop, applyConstraints }
}

const createMockStream = (tracks: MediaStreamTrack[]): MediaStream =>
  ({
    getTracks: () => tracks,
    getVideoTracks: () => tracks,
  }) as unknown as MediaStream

const createMockVideoElement = (readyState = 4) =>
  ({
    readyState,
    srcObject: null as MediaStream | null,
    play: vi.fn().mockResolvedValue(undefined),
  }) as unknown as HTMLVideoElement

describe('useQrCodeScanner', () => {
  const originalNavigatorMediaDevices = navigator.mediaDevices

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(navigator, 'mediaDevices', {
      value: originalNavigatorMediaDevices,
      configurable: true,
    })
  })

  it('emite camera_unavailable quando navigator.mediaDevices não está disponível', () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
    })

    const onDetect = vi.fn()
    const { result } = renderHook(() =>
      useQrCodeScanner({
        active: true,
        onDetect,
        isSecureContextOverride: true,
      })
    )

    expect(result.current.status).toBe('error')
    expect(result.current.error?.reason).toBe('camera_unavailable')
  })

  it('emite insecure_context quando o contexto não é seguro fora de localhost', () => {
    const mediaDevices: QrScannerMediaDevices = {
      getUserMedia: vi.fn(),
    }

    const { result } = renderHook(() =>
      useQrCodeScanner({
        active: true,
        onDetect: vi.fn(),
        mediaDevices,
        isSecureContextOverride: false,
      })
    )

    expect(result.current.status).toBe('error')
    expect(result.current.error?.reason).toBe('insecure_context')
    expect(mediaDevices.getUserMedia).not.toHaveBeenCalled()
  })

  it('mapeia NotAllowedError e NotFoundError para erros amigáveis em pt-BR', async () => {
    const permissionError = Object.assign(new Error('Denied'), {
      name: 'NotAllowedError',
    })
    const notFoundError = Object.assign(new Error('No camera'), {
      name: 'NotFoundError',
    })

    const getUserMedia = vi
      .fn()
      .mockRejectedValueOnce(permissionError)
      .mockRejectedValueOnce(notFoundError)

    const { result } = renderHook(() =>
      useQrCodeScanner({
        active: true,
        onDetect: vi.fn(),
        mediaDevices: { getUserMedia },
        ensureDetectorReady: vi.fn().mockResolvedValue(undefined),
        detectorFactory: () => ({ detect: vi.fn() }),
        isSecureContextOverride: true,
      })
    )

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error?.reason).toBe('permission_denied')

    act(() => {
      result.current.retry()
    })

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error?.reason).toBe('camera_not_found')
  })

  it('dispara onDetect uma única vez (trava single-shot), pausa o loop e permite resume', async () => {
    vi.useFakeTimers()
    const { track, stop } = createMockTrack({ deviceId: 'cam-back' })
    const stream = createMockStream([track])
    const detectMock = vi
      .fn()
      .mockResolvedValueOnce([{ rawValue: 'https://nfce.sefaz.ce.gov.br/qr1' }])
      .mockResolvedValueOnce([{ rawValue: 'https://nfce.sefaz.ce.gov.br/qr2' }])

    const detector: QrBarcodeDetectorLike = {
      detect: detectMock,
    }
    const mediaDevices: QrScannerMediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue(stream),
      enumerateDevices: vi.fn().mockResolvedValue([]),
    }
    const onDetect = vi.fn()

    const { result, unmount } = renderHook(() =>
      useQrCodeScanner({
        active: true,
        onDetect,
        scanIntervalMs: 250,
        mediaDevices,
        ensureDetectorReady: vi.fn().mockResolvedValue(undefined),
        detectorFactory: () => detector,
        isSecureContextOverride: true,
      })
    )

    result.current.videoRef.current = createMockVideoElement(4)

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.status).toBe('scanning')
    expect(mediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(onDetect).toHaveBeenCalledTimes(1)
    expect(onDetect).toHaveBeenCalledWith('https://nfce.sefaz.ce.gov.br/qr1')
    expect(result.current.status).toBe('paused')
    expect(detectMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(detectMock).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.resume()
    })
    expect(result.current.status).toBe('scanning')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(onDetect).toHaveBeenCalledTimes(2)
    expect(onDetect).toHaveBeenLastCalledWith('https://nfce.sefaz.ce.gov.br/qr2')

    unmount()
    expect(stop).toHaveBeenCalledTimes(1)
  })

  it('interrompe stream que resolve após desmontagem (proteção Strict Mode)', async () => {
    const { track, stop } = createMockTrack({ deviceId: 'cam-back' })
    const lateStream = createMockStream([track])

    let resolveGetUserMedia: ((stream: MediaStream) => void) | null = null
    const getUserMedia = vi.fn(
      () =>
        new Promise<MediaStream>((resolve) => {
          resolveGetUserMedia = resolve
        })
    )

    const { unmount } = renderHook(() =>
      useQrCodeScanner({
        active: true,
        onDetect: vi.fn(),
        mediaDevices: { getUserMedia },
        ensureDetectorReady: vi.fn().mockResolvedValue(undefined),
        detectorFactory: () => ({ detect: vi.fn() }),
        isSecureContextOverride: true,
      })
    )

    expect(getUserMedia).toHaveBeenCalledTimes(1)
    unmount()

    await act(async () => {
      resolveGetUserMedia?.(lateStream)
      await Promise.resolve()
    })

    expect(stop).toHaveBeenCalledTimes(1)
  })

  it('alterna entre múltiplas câmeras e controla lanterna com fallback seguro', async () => {
    const first = createMockTrack({ deviceId: 'cam-back', torch: true })
    const second = createMockTrack({
      deviceId: 'cam-front',
      torch: true,
      applyConstraintsError: new Error('Torch rejected'),
    })

    const getUserMedia = vi
      .fn()
      .mockResolvedValueOnce(createMockStream([first.track]))
      .mockResolvedValueOnce(createMockStream([second.track]))

    const devices = [
      { kind: 'videoinput', deviceId: 'cam-back', label: 'Traseira' },
      { kind: 'videoinput', deviceId: 'cam-front', label: 'Frontal' },
    ] as MediaDeviceInfo[]

    const { result } = renderHook(() =>
      useQrCodeScanner({
        active: true,
        onDetect: vi.fn(),
        mediaDevices: {
          getUserMedia,
          enumerateDevices: vi.fn().mockResolvedValue(devices),
        },
        ensureDetectorReady: vi.fn().mockResolvedValue(undefined),
        detectorFactory: () => ({ detect: vi.fn().mockResolvedValue([]) }),
        isSecureContextOverride: true,
      })
    )

    await waitFor(() => expect(result.current.status).toBe('scanning'))
    expect(result.current.canSwitchCamera).toBe(true)
    expect(result.current.activeDeviceId).toBe('cam-back')
    expect(result.current.torchSupported).toBe(true)

    await act(async () => {
      await result.current.toggleTorch()
    })
    expect(first.applyConstraints).toHaveBeenCalledWith({
      advanced: [{ torch: true }],
    })
    expect(result.current.torchEnabled).toBe(true)

    act(() => {
      result.current.switchCamera()
    })

    await waitFor(() =>
      expect(getUserMedia).toHaveBeenNthCalledWith(2, {
        video: { deviceId: { exact: 'cam-front' } },
        audio: false,
      })
    )
    await waitFor(() => expect(result.current.status).toBe('scanning'))
    expect(first.stop).toHaveBeenCalledTimes(1)
    expect(result.current.activeDeviceId).toBe('cam-front')
    expect(result.current.torchEnabled).toBe(false)

    await act(async () => {
      await result.current.toggleTorch()
    })
    expect(result.current.torchEnabled).toBe(false)
    expect(result.current.status).toBe('scanning')
  })
})
