import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import {
  useAddTransactionAttachments,
  useDeleteTransactionAttachment,
  useReorderTransactionAttachments,
} from '../../api/attachment.mutations'
import { useTransactionAttachments } from '../../api/attachment.queries'
import type {
  TransactionAttachment,
} from '../../types/transaction-attachment.types'
import type { Transaction } from '../../types/transaction.types'
import { TransactionAttachmentThumbnail } from '../molecules/TransactionAttachmentThumbnail'
import { TransactionAttachmentUploadCard } from '../molecules/TransactionAttachmentUploadCard'
import { TransactionAttachmentImageViewer } from './TransactionAttachmentImageViewer'

interface TransactionAttachmentsGalleryProps {
  transaction: Transaction
  className?: string
}

export function TransactionAttachmentsGallery({
  transaction,
  className,
}: TransactionAttachmentsGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<
    string | null
  >(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const isEligible =
    transaction.type === 'INCOME' || transaction.type === 'EXPENSE'

  // Busca anexos sob demanda (Lazy Fetching)
  const { data: attachments = [], isLoading } = useTransactionAttachments(
    transaction.id,
    {
      enabled: isEligible,
    }
  )

  const addMutation = useAddTransactionAttachments(transaction.id)
  const deleteMutation = useDeleteTransactionAttachment(transaction.id)
  const reorderMutation = useReorderTransactionAttachments(transaction.id)

  const isMutating =
    addMutation.isPending ||
    deleteMutation.isPending ||
    reorderMutation.isPending

  // Monitora capacidade de scroll para exibir/ocultar os toggles com fade no desktop
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
  }, [checkScroll, attachments.length])

  const scrollByAmount = (amount: number) => {
    const el = scrollContainerRef.current
    if (!el) return
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  // Ações de Reordenação
  const handleReorder = (newItems: TransactionAttachment[]) => {
    const positions = newItems.map((att, idx) => ({
      id: att.id,
      position: idx,
    }))
    reorderMutation.mutate({ positions })
  }

  const handleMoveEarlier = (index: number) => {
    if (index <= 0 || isMutating) return
    const updated = [...attachments]
    const item = updated.splice(index, 1)[0]
    updated.splice(index - 1, 0, item)
    handleReorder(updated)
  }

  const handleMoveLater = (index: number) => {
    if (index >= attachments.length - 1 || isMutating) return
    const updated = [...attachments]
    const item = updated.splice(index, 1)[0]
    updated.splice(index + 1, 0, item)
    handleReorder(updated)
  }

  // Drag and Drop
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex || isMutating) {
      setDraggedIndex(null)
      return
    }

    const updated = [...attachments]
    const item = updated.splice(draggedIndex, 1)[0]
    updated.splice(dropIndex, 0, item)
    setDraggedIndex(null)
    handleReorder(updated)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  if (!isEligible) {
    return (
      <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 text-xs text-muted-foreground">
        Comprovantes só estão disponíveis para receitas e despesas.
      </div>
    )
  }

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      {/* Indicador de carregamento inicial */}
      {isLoading ? (
        <div className="flex h-28 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-xs">Carregando comprovantes...</span>
        </div>
      ) : (
        <div className="relative group/gallery">
          {/* Toggle de scroll Esquerdo com Fade no Desktop */}
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

          {/* Container Scrollável (Mobile Touch + Desktop Scroll sem Barra) */}
          <div
            ref={scrollContainerRef}
            className="flex w-full snap-x snap-mandatory items-center gap-3 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* Lista de miniaturas */}
            {attachments.map((attachment, index) => (
              <div key={attachment.id} className="snap-start shrink-0">
                <TransactionAttachmentThumbnail
                  attachment={attachment}
                  index={index}
                  total={attachments.length}
                  isMutating={isMutating}
                  onView={() => setSelectedAttachmentId(attachment.id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onMoveEarlier={() => handleMoveEarlier(index)}
                  onMoveLater={() => handleMoveLater(index)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                />
              </div>
            ))}

            {/* Card de Adição/Upload (se < 3) */}
            {attachments.length < 3 ? (
              <div className="snap-start shrink-0">
                <TransactionAttachmentUploadCard
                  currentCount={attachments.length}
                  isUploading={addMutation.isPending}
                  disabled={isMutating}
                  onUpload={(files) => addMutation.mutate(files)}
                />
              </div>
            ) : null}
          </div>

          {/* Toggle de scroll Direito com Fade no Desktop */}
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
      )}

      {/* Visualizador Lightbox Overlaid com Zoom */}
      <TransactionAttachmentImageViewer
        attachments={attachments}
        initialAttachmentId={selectedAttachmentId}
        isOpen={Boolean(selectedAttachmentId)}
        onClose={() => setSelectedAttachmentId(null)}
      />
    </div>
  )
}
