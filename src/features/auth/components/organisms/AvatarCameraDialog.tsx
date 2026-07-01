import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, ImagePlus, RefreshCw, Video, X } from 'lucide-react'
import { Button } from '@/shared/lib/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface AvatarCameraDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCapture: (file: File) => void
  onChooseFile: () => void
}

type CameraState = 'idle' | 'requesting' | 'ready' | 'error'

const CAMERA_WAITING_MESSAGE =
  'Aguardando permissão da câmera. Você pode cancelar ou enviar uma imagem da galeria.'

export const AvatarCameraDialog = ({
  isOpen,
  onOpenChange,
  onCapture,
  onChooseFile,
}: AvatarCameraDialogProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const isCameraActive = cameraState === 'ready' || cameraState === 'requesting'

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const closeCamera = useCallback(() => {
    stopCamera()
    setCameraState('idle')
    setMessage(null)
    onOpenChange(false)
  }, [onOpenChange, stopCamera])

  const startCamera = useCallback(async () => {
    stopCamera()
    setCameraState('requesting')
    setMessage(CAMERA_WAITING_MESSAGE)

    if (
      typeof window === 'undefined' ||
      !window.isSecureContext ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setCameraState('error')
      setMessage(
        'A câmera não está disponível neste navegador. Envie uma imagem da galeria.'
      )
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraState('ready')
      setMessage(null)
    } catch (error) {
      setCameraState('error')
      setMessage(resolveCameraErrorMessage(error))
      stopCamera()
    }
  }, [stopCamera])

  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      return
    }

    void startCamera()

    return () => {
      stopCamera()
    }
  }, [isOpen, startCamera, stopCamera])

  const handleCapture = async () => {
    const video = videoRef.current

    if (!video || cameraState !== 'ready') {
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 1280

    const context = canvas.getContext('2d')

    if (!context) {
      setCameraState('error')
      setMessage('Não foi possível preparar a foto. Tente novamente.')
      return
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.92)
    })

    if (!blob) {
      setCameraState('error')
      setMessage('Não foi possível preparar a foto. Tente novamente.')
      return
    }

    onCapture(
      new File([blob], 'avatar-camera.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })
    )
    closeCamera()
  }

  const handleChooseFile = () => {
    closeCamera()
    onChooseFile()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeCamera()}>
      <DialogContent className="bottom-3 left-3 right-3 top-auto flex max-h-[calc(100dvh_-_24px)] w-auto max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-2xl border-border bg-card p-0 text-foreground data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2 sm:bottom-auto sm:left-[50%] sm:right-auto sm:top-[50%] sm:max-h-[min(90dvh,760px)] sm:max-w-xl sm:translate-x-[-50%] sm:translate-y-[-50%]">
        <DialogHeader className="shrink-0 px-5 pb-3 pl-5 pr-12 pt-5 text-left">
          <DialogTitle>Tirar foto agora</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Use a câmera frontal quando disponível. Depois você poderá ajustar o
            corte antes de salvar.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-4">
          <div
            className={
              isCameraActive
                ? 'relative h-[min(62vw,46dvh)] min-h-64 overflow-hidden rounded-2xl border border-border bg-secondary sm:aspect-square sm:h-auto sm:max-h-[48dvh]'
                : 'relative h-40 overflow-hidden rounded-2xl border border-border bg-secondary sm:h-48'
            }
          >
            {isCameraActive ? (
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                muted
                autoPlay
              />
            ) : (
              <div className="flex h-full items-center gap-3 p-4 text-left">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Video className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Câmera do dispositivo
                  </p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    Se a câmera não abrir, envie uma imagem da galeria.
                  </p>
                </div>
              </div>
            )}
          </div>

          {message ? (
            <div className="rounded-xl border border-border bg-secondary p-3 text-sm leading-5 text-muted-foreground">
              {message}
            </div>
          ) : null}
        </div>

        <DialogFooter className="grid shrink-0 grid-cols-1 gap-2 border-t border-border bg-card px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 sm:flex sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
            onClick={closeCamera}
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
            onClick={handleChooseFile}
          >
            <ImagePlus className="h-4 w-4" />
            Enviar imagem
          </Button>
          {cameraState === 'error' ? (
            <Button
              type="button"
              className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={startCamera}
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          ) : (
            <Button
              type="button"
              className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCapture}
              disabled={cameraState !== 'ready'}
            >
              <Camera className="h-4 w-4" />
              {cameraState === 'requesting' ? 'Abrindo...' : 'Tirar foto'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const resolveCameraErrorMessage = (error: unknown): string => {
  if (!(error instanceof DOMException)) {
    return 'Não foi possível acessar a câmera. Envie uma imagem da galeria.'
  }

  if (error.name === 'NotAllowedError') {
    return 'Não foi possível acessar a câmera. Verifique as permissões do navegador ou envie uma imagem da galeria.'
  }

  if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
    return 'Nenhuma câmera disponível foi encontrada. Envie uma imagem da galeria.'
  }

  if (error.name === 'NotReadableError' || error.name === 'AbortError') {
    return 'A câmera não pôde ser lida agora. Feche outros apps que possam estar usando a câmera ou envie uma imagem da galeria.'
  }

  if (
    error.name === 'InvalidStateError' ||
    error.name === 'SecurityError' ||
    error.name === 'TypeError'
  ) {
    return 'A câmera não está disponível neste contexto. Envie uma imagem da galeria.'
  }

  return 'Não foi possível acessar a câmera. Envie uma imagem da galeria.'
}
