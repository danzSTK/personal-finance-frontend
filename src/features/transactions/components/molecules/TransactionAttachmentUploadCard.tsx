import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { toast } from '@/shared/hooks/use-toast'
import { cn } from '@/shared/lib/utils'
import {
  ATTACHMENT_ALLOWED_EXTENSIONS,
  ATTACHMENT_ALLOWED_MIME_TYPES,
  ATTACHMENT_MAX_FILES,
  ATTACHMENT_MAX_FILE_SIZE_BYTES,
} from '../../types/transaction-attachment.types'

interface TransactionAttachmentUploadCardProps {
  currentCount: number
  isUploading?: boolean
  disabled?: boolean
  onUpload: (files: File[]) => void
}

export function TransactionAttachmentUploadCard({
  currentCount,
  isUploading = false,
  disabled = false,
  onUpload,
}: TransactionAttachmentUploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const remainingSlots = ATTACHMENT_MAX_FILES - currentCount

  if (remainingSlots <= 0) {
    return null
  }

  const validateAndProcessFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return
    }

    const files = Array.from(fileList)

    if (files.length > remainingSlots) {
      toast({
        title: 'Limite de arquivos excedido',
        description: `Você pode adicionar no máximo mais ${remainingSlots} ${
          remainingSlots === 1 ? 'comprovante' : 'comprovantes'
        }.`,
        variant: 'destructive',
      })
      return
    }

    // Validação de tipo MIME
    const invalidFormat = files.find(
      (file) =>
        !ATTACHMENT_ALLOWED_MIME_TYPES.includes(
          file.type as (typeof ATTACHMENT_ALLOWED_MIME_TYPES)[number]
        )
    )
    if (invalidFormat) {
      toast({
        title: 'Formato não suportado',
        description:
          'Selecione apenas imagens nos formatos PNG, JPEG ou WebP.',
        variant: 'destructive',
      })
      return
    }

    // Validação de tamanho
    const tooLarge = files.find(
      (file) => file.size > ATTACHMENT_MAX_FILE_SIZE_BYTES
    )
    if (tooLarge) {
      toast({
        title: 'Arquivo muito grande',
        description: 'Cada imagem deve ter no máximo 5 MB.',
        variant: 'destructive',
      })
      return
    }

    onUpload(files)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndProcessFiles(e.target.files)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled || isUploading) return
    validateAndProcessFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!disabled && !isUploading) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  return (
    <button
      type="button"
      disabled={disabled || isUploading}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'group relative flex aspect-[4/3] w-36 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-3 text-center transition-all duration-200 sm:w-44',
        'border-border/80 bg-secondary/30 hover:border-primary/60 hover:bg-secondary/60',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isDragOver && 'border-primary bg-primary/10 ring-2 ring-primary/40',
        (disabled || isUploading) && 'cursor-not-allowed opacity-60'
      )}
      aria-label={`Adicionar comprovante. Restam ${remainingSlots} vagas.`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={remainingSlots > 1}
        accept={ATTACHMENT_ALLOWED_EXTENSIONS.join(',')}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs font-medium">Enviando...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 text-muted-foreground transition-colors group-hover:text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary transition-transform group-hover:scale-110">
            <ImagePlus className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">Adicionar</span>
          <span className="text-[10px] text-muted-foreground/80">
            {remainingSlots} {remainingSlots === 1 ? 'vaga' : 'vagas'} restantes
          </span>
        </div>
      )}
    </button>
  )
}
