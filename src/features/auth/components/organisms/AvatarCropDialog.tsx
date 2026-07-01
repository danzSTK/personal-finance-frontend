import { useCallback, useMemo, useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { Camera, ZoomIn } from 'lucide-react'
import { Button } from '@/shared/lib/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Slider } from '@/shared/components/ui/slider'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import type { ApiErrorPresentation } from '@/shared/errors'
import { createCroppedAvatarFile } from '../../utils/avatarCrop'

interface AvatarCropDialogProps {
  imageSrc: string | null
  isOpen: boolean
  isSubmitting: boolean
  apiError: ApiErrorPresentation | null
  onCancel: () => void
  onConfirm: (file: File) => void
}

export const AvatarCropDialog = ({
  imageSrc,
  isOpen,
  isSubmitting,
  apiError,
  onCancel,
  onConfirm,
}: AvatarCropDialogProps) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [cropError, setCropError] = useState<string | null>(null)

  const zoomLabel = useMemo(() => `${Math.round(zoom * 100)}%`, [zoom])

  const handleCropComplete = useCallback(
    (_croppedArea: Area, nextCroppedAreaPixels: Area) => {
      setCroppedAreaPixels(nextCroppedAreaPixels)
    },
    []
  )

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen || isSubmitting) {
      return
    }

    onCancel()
  }

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setCropError('Ajuste a imagem antes de salvar.')
      return
    }

    setCropError(null)

    try {
      const file = await createCroppedAvatarFile(imageSrc, croppedAreaPixels)
      onConfirm(file)
    } catch {
      setCropError('Não foi possível preparar esta imagem. Tente outra foto.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="border-border bg-card text-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajustar foto de perfil</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Posicione seu rosto no centro. A prévia será enviada em formato
            quadrado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative h-80 overflow-hidden rounded-2xl border border-border bg-secondary">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Escolha uma imagem para ajustar.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-secondary p-4">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="avatar-zoom"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
                Zoom
              </label>
              <span className="numeric text-sm text-muted-foreground">
                {zoomLabel}
              </span>
            </div>
            <Slider
              id="avatar-zoom"
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              className="mt-4"
              onValueChange={([value]) => setZoom(value ?? 1)}
              disabled={isSubmitting}
              aria-label="Ajustar zoom da foto"
            />
          </div>

          {cropError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {cropError}
            </div>
          ) : null}

          {apiError ? <ApiErrorAlert error={apiError} /> : null}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleConfirm}
            disabled={isSubmitting || !imageSrc}
          >
            <Camera className="h-4 w-4" />
            {isSubmitting ? 'Enviando...' : 'Salvar foto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
