import { useState, type DragEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Maximize2,
  MoreVertical,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import type { TransactionAttachment } from '../../types/transaction-attachment.types'

interface TransactionAttachmentThumbnailProps {
  attachment: TransactionAttachment
  index: number
  total: number
  isMutating?: boolean
  onView: (attachment: TransactionAttachment) => void
  onDelete: (attachmentId: string) => void
  onMoveEarlier?: () => void
  onMoveLater?: () => void
  onDragStart?: (index: number) => void
  onDragOver?: (e: DragEvent<HTMLDivElement>, index: number) => void
  onDragEnd?: () => void
  onDrop?: (index: number) => void
}

export function TransactionAttachmentThumbnail({
  attachment,
  index,
  total,
  isMutating = false,
  onView,
  onDelete,
  onMoveEarlier,
  onMoveLater,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: TransactionAttachmentThumbnailProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isFirst = index === 0
  const isLast = index === total - 1

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
    onDragStart?.(index)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    onDragOver?.(e, index)
  }

  return (
    <div
      draggable={!isMutating && total > 1}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={onDragEnd}
      onDrop={() => onDrop?.(index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative flex aspect-[4/3] w-36 shrink-0 select-none overflow-hidden rounded-2xl border border-border bg-muted/30 transition-all duration-200 sm:w-44',
        'hover:border-primary/50 hover:shadow-md',
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background',
        isMutating && 'pointer-events-none opacity-60'
      )}
    >
      {/* Imagem clicável para abrir o visualizador */}
      <button
        type="button"
        onClick={() => onView(attachment)}
        className="relative h-full w-full cursor-zoom-in text-left focus:outline-hidden"
        aria-label={`Visualizar comprovante ${index + 1} de ${total}`}
      >
        <img
          src={attachment.url}
          alt={`Comprovante ${index + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay escuro em hover para dar contraste aos controles */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'
          )}
        />

        {/* Ícone de zoom centralizado em hover desktop */}
        <span
          className={cn(
            'absolute inset-0 hidden items-center justify-center text-white/90 drop-shadow-md transition-opacity sm:flex',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden
        >
          <Maximize2 className="h-6 w-6" />
        </span>
      </button>

      {/* Handle de Drag / Posição (Canto superior esquerdo) */}
      <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
        {total > 1 ? (
          <GripVertical
            className="h-3 w-3 cursor-grab text-white/70 active:cursor-grabbing"
            aria-hidden
          />
        ) : null}
        <span className="numeric">{index + 1}</span>
      </div>

      {/* Menu de Ações (Canto superior direito) */}
      <div className="absolute top-1.5 right-1.5 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white"
              aria-label={`Opções do comprovante ${index + 1}`}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              disabled={isFirst || isMutating}
              onClick={onMoveEarlier}
              className="cursor-pointer gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Mover para esquerda</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={isLast || isMutating}
              onClick={onMoveLater}
              className="cursor-pointer gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Mover para direita</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              disabled={isMutating}
              onClick={() => onDelete(attachment.id)}
              className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir comprovante</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
