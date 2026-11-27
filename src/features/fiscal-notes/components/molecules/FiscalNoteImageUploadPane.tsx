import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { ImagePlus, Loader2, RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { FISCAL_NOTE_MAX_IMAGE_SIZE_BYTES } from '../../constants/fiscal-notes.constants'
import { decodeQrCodeFromImageFile } from '../../utils/qrBarcodeDetector.utils'

export interface FiscalNoteImageUploadPaneProps {
  onDecoded: (rawValue: string) => void
  onSwitchToManual?: () => void
  disabled?: boolean
  className?: string
}

const createSafeObjectUrl = (file: File): string | null => {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return null
  }
  return URL.createObjectURL(file)
}

const revokeSafeObjectUrl = (url: string | null) => {
  if (
    url &&
    typeof URL !== 'undefined' &&
    typeof URL.revokeObjectURL === 'function'
  ) {
    URL.revokeObjectURL(url)
  }
}

/**
 * Image dropzone and picker that decodes an NFC-e QR Code locally from a photo or screenshot.
 */
export function FiscalNoteImageUploadPane({
  onDecoded,
  onSwitchToManual,
  disabled = false,
  className,
}: FiscalNoteImageUploadPaneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isDecoding, setIsDecoding] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      revokeSafeObjectUrl(previewUrlRef.current)
    }
  }, [])

  const updatePreview = (nextUrl: string | null) => {
    revokeSafeObjectUrl(previewUrlRef.current)
    previewUrlRef.current = nextUrl
    setPreviewUrl(nextUrl)
  }

  const processFile = async (file: File | undefined) => {
    if (!file || disabled || isDecoding) {
      return
    }

    setErrorMessage(null)

    if (file.type && !file.type.startsWith('image/')) {
      setErrorMessage(
        'Arquivo inválido. Selecione uma imagem (PNG, JPEG ou WebP) contendo o QR Code da NFC-e.'
      )
      return
    }

    if (file.size > FISCAL_NOTE_MAX_IMAGE_SIZE_BYTES) {
      setErrorMessage(
        'A imagem selecionada excede 10 MB. Tente uma foto menor ou recortada próxima ao QR Code.'
      )
      return
    }

    setSelectedFileName(file.name)
    updatePreview(createSafeObjectUrl(file))
    setIsDecoding(true)

    try {
      const decoded = await decodeQrCodeFromImageFile(file)
      if (!decoded) {
        setErrorMessage(
          'Não encontramos um QR Code legível nessa imagem. Tente uma foto mais nítida, bem iluminada e com o QR Code centralizado.'
        )
        return
      }

      onDecoded(decoded)
    } catch {
      setErrorMessage(
        'Não foi possível ler o QR Code dessa imagem. Tente outra foto ou informe a chave/URL manualmente.'
      )
    } finally {
      setIsDecoding(false)
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    void processFile(file)
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    if (disabled || isDecoding) {
      return
    }
    void processFile(event.dataTransfer.files?.[0])
  }

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!disabled && !isDecoding) {
      setIsDragOver(true)
    }
  }

  const handleSelectClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Selecionar foto ou print do QR Code da NFC-e"
      />

      <button
        type="button"
        disabled={disabled || isDecoding}
        onClick={handleSelectClick}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-5 text-center transition-colors',
          'border-border bg-secondary/40 hover:border-brand/60 hover:bg-secondary/70',
          'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
          isDragOver && 'border-brand bg-brand/10',
          (disabled || isDecoding) && 'cursor-not-allowed opacity-70'
        )}
      >
        {isDecoding ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-brand" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              Lendo QR Code da imagem...
            </p>
            {selectedFileName ? (
              <p className="max-w-xs truncate text-xs text-muted-foreground">
                {selectedFileName}
              </p>
            ) : null}
          </div>
        ) : previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={previewUrl}
              alt="Prévia da imagem selecionada para leitura do QR Code"
              className="max-h-36 rounded-xl border border-border object-contain"
            />
            <span className="text-xs font-medium text-muted-foreground">
              Clique ou arraste para escolher outra foto
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-app-elevated text-brand">
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Escolher foto ou print do QR Code
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                Arraste uma imagem aqui ou toque para abrir a galeria (PNG, JPEG ou WebP).
              </p>
            </div>
          </div>
        )}
      </button>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4"
        >
          <div className="flex items-start gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-semibold text-foreground">
                QR Code não identificado
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                {errorMessage}
              </p>
              <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                <li>Prefira foto com boa iluminação e sem reflexos no papel;</li>
                <li>Recorte a imagem deixando apenas o QR Code em destaque;</li>
                <li>Se o cupom estiver amassado, use a aba Manual com os 44 dígitos.</li>
              </ul>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent"
                  onClick={handleSelectClick}
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar outra foto
                </Button>
                {onSwitchToManual ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 rounded-xl text-foreground hover:bg-accent"
                    onClick={onSwitchToManual}
                  >
                    Digitar chave / URL
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
