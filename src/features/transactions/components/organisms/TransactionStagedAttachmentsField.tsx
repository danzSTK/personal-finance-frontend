import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import {
  ATTACHMENT_MAX_FILES,
  type TransactionAttachment,
} from '../../types/transaction-attachment.types'
import { TransactionAttachmentThumbnail } from '../molecules/TransactionAttachmentThumbnail'
import { TransactionAttachmentUploadCard } from '../molecules/TransactionAttachmentUploadCard'
import { TransactionAttachmentImageViewer } from './TransactionAttachmentImageViewer'

export interface StagedTransactionAttachment {
  id: string
  file: File
  previewUrl: string
}

interface TransactionStagedAttachmentsFieldProps {
  items: StagedTransactionAttachment[]
  disabled?: boolean
  isUploading?: boolean
  onAddFiles: (files: File[]) => void
  onRemove: (id: string) => void
  onReorder: (nextItems: StagedTransactionAttachment[]) => void
  className?: string
}

export function TransactionStagedAttachmentsField({
  items,
  disabled = false,
  isUploading = false,
  onAddFiles,
  onRemove,
  onReorder,
  className,
}: TransactionStagedAttachmentsFieldProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<
    string | null
  >(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const mappedAttachments: TransactionAttachment[] = useMemo(
    () =>
      items.map((item, index) => ({
        id: item.id,
        assetId: item.id,
        position: index,
        contentType: item.file.type,
        sizeBytes: item.file.size,
        url: item.previewUrl,
        expiresAt: '',
        cacheMaxAgeSeconds: 0,
      })),
    [items]
  )

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollContainerRef.current
    if (!el) return

    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)

    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll, items.length])

  const scrollByAmount = (amount: number) => {
    const el = scrollContainerRef.current
    if (!el) return
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const handleMoveEarlier = (index: number) => {
    if (index <= 0 || disabled) return
    const updated = [...items]
    const [moved] = updated.splice(index, 1)
    if (!moved) return
    updated.splice(index - 1, 0, moved)
    onReorder(updated)
  }

  const handleMoveLater = (index: number) => {
    if (index >= items.length - 1 || disabled) return
    const updated = [...items]
    const [moved] = updated.splice(index, 1)
    if (!moved) return
    updated.splice(index + 1, 0, moved)
    onReorder(updated)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex || disabled) {
      setDraggedIndex(null)
      return
    }

    const updated = [...items]
    const [moved] = updated.splice(draggedIndex, 1)
    if (!moved) {
      setDraggedIndex(null)
      return
    }
    updated.splice(dropIndex, 0, moved)
    setDraggedIndex(null)
    onReorder(updated)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      <div className="relative group/gallery">
        {canScrollLeft ? (
          <div className="absolute top-0 bottom-0 left-0 z-20 hidden w-14 items-center justify-start bg-gradient-to-r from-card via-card/85 to-transparent sm:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => scrollByAmount(-200)}
              className="ml-1 h-8 w-8 rounded-full border border-border/80 bg-background/90 text-foreground shadow-md backdrop-blur-xs hover:bg-background"
              aria-label="Rolar para a esquerda"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <div
          ref={scrollContainerRef}
          className="flex w-full snap-x snap-mandatory items-center gap-3 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {mappedAttachments.map((attachment, index) => (
            <div key={attachment.id} className="snap-start shrink-0">
              <TransactionAttachmentThumbnail
                attachment={attachment}
                index={index}
                total={mappedAttachments.length}
                isMutating={disabled || isUploading}
                onView={() => setSelectedAttachmentId(attachment.id)}
                onDelete={(id) => onRemove(id)}
                onMoveEarlier={() => handleMoveEarlier(index)}
                onMoveLater={() => handleMoveLater(index)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
              />
            </div>
          ))}

          {items.length < ATTACHMENT_MAX_FILES ? (
            <div className="snap-start shrink-0">
              <TransactionAttachmentUploadCard
                currentCount={items.length}
                isUploading={isUploading}
                disabled={disabled}
                onUpload={onAddFiles}
              />
            </div>
          ) : null}
        </div>

        {canScrollRight ? (
          <div className="absolute top-0 bottom-0 right-0 z-20 hidden w-14 items-center justify-end bg-gradient-to-l from-card via-card/85 to-transparent sm:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => scrollByAmount(200)}
              className="mr-1 h-8 w-8 rounded-full border border-border/80 bg-background/90 text-foreground shadow-md backdrop-blur-xs hover:bg-background"
              aria-label="Rolar para a direita"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>

      <TransactionAttachmentImageViewer
        attachments={mappedAttachments}
        initialAttachmentId={selectedAttachmentId}
        isOpen={Boolean(selectedAttachmentId)}
        onClose={() => setSelectedAttachmentId(null)}
      />
    </div>
  )
}
