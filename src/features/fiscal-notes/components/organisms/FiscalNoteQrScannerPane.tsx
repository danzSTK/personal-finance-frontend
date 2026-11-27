import {
  AlertTriangle,
  Flashlight,
  Keyboard,
  ImagePlus,
  RefreshCw,
  SwitchCamera,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import {
  type QrScannerStatus,
  useQrCodeScanner,
} from '../../hooks/useQrCodeScanner'

export interface FiscalNoteQrScannerPaneProps {
  active: boolean
  onDetect: (rawValue: string) => void
  onSwitchToImage: () => void
  onSwitchToManual: () => void
  className?: string
}

const getStatusLabel = (status: QrScannerStatus): string => {
  switch (status) {
    case 'initializing':
    case 'idle':
      return 'Iniciando câmera...'
    case 'scanning':
      return 'Aponte para o QR Code da NFC-e'
    case 'paused':
      return 'QR Code lido'
    case 'error':
      return 'Câmera indisponível'
  }
}

/**
 * Live camera QR Code viewfinder with Danfy Dark framing, camera switch, torch toggle, and error fallbacks.
 */
export function FiscalNoteQrScannerPane({
  active,
  onDetect,
  onSwitchToImage,
  onSwitchToManual,
  className,
}: FiscalNoteQrScannerPaneProps) {
  const {
    videoRef,
    status,
    error,
    torchSupported,
    torchEnabled,
    canSwitchCamera,
    switchCamera,
    toggleTorch,
    retry,
  } = useQrCodeScanner({
    active,
    onDetect,
  })

  if (status === 'error' && error) {
    return (
      <div
        role="alert"
        className={cn(
          'rounded-2xl border border-border bg-secondary p-5 text-left',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-state-warning/15 text-state-warning">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {error.title}
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              {error.description}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-xl border-border bg-card text-foreground hover:bg-accent"
            onClick={retry}
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 rounded-xl border border-border bg-card text-foreground hover:bg-accent"
            onClick={onSwitchToImage}
          >
            <ImagePlus className="h-4 w-4" />
            Enviar foto do QR
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 rounded-xl text-foreground hover:bg-accent"
            onClick={onSwitchToManual}
          >
            <Keyboard className="h-4 w-4" />
            Digitar chave / URL
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-background">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="h-full w-full object-cover"
        />

        {/* Viewfinder corner reticle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center p-8"
        >
          <div className="relative h-44 w-44 max-w-full rounded-2xl sm:h-52 sm:w-52">
            <span className="absolute top-0 left-0 h-7 w-7 rounded-tl-xl border-t-3 border-l-3 border-brand" />
            <span className="absolute top-0 right-0 h-7 w-7 rounded-tr-xl border-t-3 border-r-3 border-brand" />
            <span className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-xl border-b-3 border-l-3 border-brand" />
            <span className="absolute right-0 bottom-0 h-7 w-7 rounded-br-xl border-r-3 border-b-3 border-brand" />
          </div>
        </div>

        {/* Status badge */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center">
          <span
            aria-live="polite"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm"
          >
            <span
              aria-hidden="true"
              className={cn(
                'h-2 w-2 rounded-full',
                status === 'scanning'
                  ? 'animate-pulse bg-brand'
                  : status === 'paused'
                    ? 'bg-state-income'
                    : 'bg-muted-foreground'
              )}
            />
            {getStatusLabel(status)}
          </span>
        </div>
      </div>

      {canSwitchCamera || torchSupported ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {canSwitchCamera ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-xl border-border bg-secondary px-4 text-foreground hover:bg-accent"
              onClick={switchCamera}
            >
              <SwitchCamera className="h-4 w-4" />
              Alternar câmera
            </Button>
          ) : null}

          {torchSupported ? (
            <Button
              type="button"
              variant="outline"
              aria-pressed={torchEnabled}
              className={cn(
                'min-h-11 rounded-xl border-border bg-secondary px-4 text-foreground hover:bg-accent',
                torchEnabled &&
                  'border-brand/50 bg-brand/15 text-brand hover:bg-brand/20'
              )}
              onClick={() => void toggleTorch()}
            >
              <Flashlight className="h-4 w-4" />
              {torchEnabled ? 'Desligar lanterna' : 'Lanterna'}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
