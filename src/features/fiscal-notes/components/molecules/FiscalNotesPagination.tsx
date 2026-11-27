import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { FISCAL_NOTE_LIST_PAGE_SIZE_OPTIONS } from '../../constants/fiscal-notes.constants'

export interface FiscalNotesPaginationProps {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

/**
 * Pagination bar with page summary, page-size selector, and previous/next controls.
 */
export function FiscalNotesPagination({
  page,
  limit,
  total,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onLimitChange,
}: FiscalNotesPaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1)

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 rounded-2xl border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="numeric">
          Mostrando página {page} de {safeTotalPages} · {total}{' '}
          {total === 1 ? 'nota' : 'notas'}
        </span>

        <div className="flex items-center gap-2">
          <span id="fiscal-notes-page-size-label">Por página</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger
              aria-labelledby="fiscal-notes-page-size-label"
              className="numeric h-9 w-20 rounded-xl border-border bg-secondary text-foreground focus:ring-ring"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              {FISCAL_NOTE_LIST_PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem
                  key={option}
                  value={String(option)}
                  className="numeric focus:bg-accent focus:text-foreground"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!hasPreviousPage}
          className="h-9 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!hasNextPage}
          className="h-9 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
          onClick={() => onPageChange(Math.min(page + 1, safeTotalPages))}
        >
          Próxima
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
