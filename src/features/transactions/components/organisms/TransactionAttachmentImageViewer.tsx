import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react'
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/lib/button'
import type { TransactionAttachment } from '../../types/transaction-attachment.types'

interface TransactionAttachmentImageViewerProps {
  attachments: TransactionAttachment[]
  initialAttachmentId: string | null
  isOpen: boolean
  onClose: () => void
}

export function TransactionAttachmentImageViewer({
  attachments,
  initialAttachmentId,
  isOpen,
  onClose,
}: TransactionAttachmentImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoomScale, setZoomScale] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Inicializa índice ativo a partir do attachment clicado
  useEffect(() => {
    if (initialAttachmentId && attachments.length > 0) {
      const foundIdx = attachments.findIndex(
        (att) => att.id === initialAttachmentId
      )
      if (foundIdx !== -1) {
        setCurrentIndex(foundIdx)
      }
    }
  }, [initialAttachmentId, attachments])

  // Reset zoom e pan ao mudar de imagem ou ao fechar
  const resetZoom = useCallback(() => {
    setZoomScale(1)
    setPanOffset({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    resetZoom()
  }, [currentIndex, isOpen, resetZoom])

  const total = attachments.length
  const currentAttachment = attachments[currentIndex]

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [currentIndex, total])

  // Zoom controls
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.5, 1)
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 })
      }
      return next
    })
  }

  const handleToggleZoom = () => {
    if (zoomScale > 1) {
      resetZoom()
    } else {
      setZoomScale(2.2)
    }
  }

  // Teclado: Escape (fecha), Seta Esquerda (anterior), Seta Direita (próxima)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handlePrev, handleNext, onClose])

  // Pan / Arraste quando com zoom
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (zoomScale <= 1) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    panStartRef.current = { ...panOffset }
    const target = e.target as HTMLElement
    target.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || zoomScale <= 1) return
    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y
    setPanOffset({
      x: panStartRef.current.x + deltaX,
      y: panStartRef.current.y + deltaY,
    })
  }

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    try {
      const target = e.target as HTMLElement
      target.releasePointerCapture(e.pointerId)
    } catch {
      // Ignora erro de release se elemento não tiver captura ativa
    }
  }

  if (!currentAttachment) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton
        className="flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col border-none bg-black/95 p-0 text-white backdrop-blur-md"
      >
        <DialogTitle className="sr-only">
          Visualizador de Comprovante {currentIndex + 1} de {total}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Exibição em alta resolução do anexo da transação com suporte a zoom e navegação.
        </DialogDescription>

        {/* Header com controles de zoom e fechar */}
        <header className="absolute top-0 right-0 left-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-xs">
              <span className="numeric">{currentIndex + 1}</span> de{' '}
              <span className="numeric">{total}</span>
            </span>
            <span className="hidden text-xs text-white/60 sm:inline">
              (Dê dois cliques para alternar o zoom)
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoomScale >= 3}
              className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-40"
              title="Aumentar zoom"
              aria-label="Aumentar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoomScale <= 1}
              className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-40"
              title="Diminuir zoom"
              aria-label="Diminuir zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            {zoomScale > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={resetZoom}
                className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20"
                title="Redefinir zoom"
                aria-label="Redefinir zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-white/15 text-white hover:bg-white/25"
              title="Fechar (Esc)"
              aria-label="Fechar visualizador"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Área Central da Imagem com Zoom e Pan */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={handleToggleZoom}
          className="relative flex flex-1 touch-none items-center justify-center overflow-hidden p-4 sm:p-12"
          style={{
            cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
        >
          <img
            key={currentAttachment.id}
            src={currentAttachment.url}
            alt={`Comprovante ${currentIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] select-none rounded-lg object-contain transition-transform duration-150 will-change-transform"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
            }}
            draggable={false}
          />
        </div>

        {/* Botão Anterior */}
        {currentIndex > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="absolute top-1/2 left-4 z-40 h-11 w-11 -translate-y-1/2 rounded-full bg-black/60 text-white shadow-lg backdrop-blur-xs hover:bg-black/80 hover:text-white"
            aria-label="Comprovante anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        ) : null}

        {/* Botão Próximo */}
        {currentIndex < total - 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute top-1/2 right-4 z-40 h-11 w-11 -translate-y-1/2 rounded-full bg-black/60 text-white shadow-lg backdrop-blur-xs hover:bg-black/80 hover:text-white"
            aria-label="Próximo comprovante"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
