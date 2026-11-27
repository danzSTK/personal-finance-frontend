import { useMemo, useState } from 'react'
import { Search, ShoppingBag, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
import type { FiscalNotePreviewItem } from '../../types/fiscal-note.types'
import { FiscalNoteItemRow } from '../atoms/FiscalNoteItemRow'

export interface FiscalNoteItemsListProps {
  items: FiscalNotePreviewItem[]
  searchable?: boolean
  showPositions?: boolean
  className?: string
}

const normalizeSearchText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

/**
 * Reusable read-only shopping list with real-time accent-insensitive filtering by description or store code.
 */
export function FiscalNoteItemsList({
  items,
  searchable = true,
  showPositions = true,
  className,
}: FiscalNoteItemsListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const orderedItems = useMemo(
    () => [...items].sort((a, b) => a.position - b.position),
    [items]
  )

  const normalizedQuery = normalizeSearchText(searchQuery)
  const isFiltered = searchable && normalizedQuery.length > 0

  const filteredItems = useMemo(() => {
    if (!isFiltered) {
      return orderedItems
    }

    return orderedItems.filter((item) => {
      const description = normalizeSearchText(item.rawDescription)
      const storeCode = item.storeCode
        ? normalizeSearchText(item.storeCode)
        : ''

      return (
        description.includes(normalizedQuery) ||
        storeCode.includes(normalizedQuery)
      )
    })
  }, [isFiltered, normalizedQuery, orderedItems])

  return (
    <section aria-label="Lista de compras da NFC-e" className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          Lista de compras ({orderedItems.length}{' '}
          {orderedItems.length === 1 ? 'item' : 'itens'})
        </h4>

        {isFiltered ? (
          <span className="numeric text-xs text-muted-foreground">
            Mostrando {filteredItems.length} de {orderedItems.length}{' '}
            {orderedItems.length === 1 ? 'item' : 'itens'}
          </span>
        ) : null}
      </div>

      {searchable && orderedItems.length > 0 ? (
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar por item ou código na loja"
            aria-label="Buscar item na lista de compras"
            className="h-10 rounded-xl border-border bg-secondary pr-9 pl-9 text-sm text-foreground placeholder:text-muted-foreground"
          />
          {searchQuery ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Limpar busca de itens"
              title="Limpar busca"
              className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : null}

      {orderedItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-secondary/50 px-4 py-6 text-center">
          <ShoppingBag
            className="mx-auto h-6 w-6 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhum item registrado nesta nota fiscal.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-secondary/50 px-4 py-6 text-center">
          <p className="text-sm font-medium text-foreground">
            Nenhum item encontrado para &ldquo;{searchQuery.trim()}&rdquo;.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tente outro termo da descrição ou código na loja.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 h-9 rounded-xl border-border bg-secondary text-foreground hover:bg-accent"
            onClick={() => setSearchQuery('')}
          >
            Limpar busca
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-secondary px-4">
          {filteredItems.map((item) => (
            <FiscalNoteItemRow
              key={`${item.position}-${item.storeCode ?? item.rawDescription}`}
              item={item}
              showPosition={showPositions}
            />
          ))}
        </div>
      )}
    </section>
  )
}
