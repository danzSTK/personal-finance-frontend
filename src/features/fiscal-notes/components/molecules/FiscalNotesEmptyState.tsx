import { QrCode, SearchX } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export interface FiscalNotesEmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
  onImportFiscalNote?: () => void
}

/**
 * Empty state differentiating filtered searches with no matches from a fresh account with no imported NFC-e.
 */
export function FiscalNotesEmptyState({
  hasFilters,
  onClearFilters,
  onImportFiscalNote,
}: FiscalNotesEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <span
          className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground"
          aria-hidden="true"
        >
          <SearchX className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-base font-semibold text-foreground">
          Nenhuma nota fiscal encontrada
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Tente ajustar a busca ou remover alguns filtros aplicados.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
            onClick={onClearFilters}
          >
            Limpar filtros
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <span
        className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand"
        aria-hidden="true"
      >
        <QrCode className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-foreground">
        Nenhuma NFC-e importada ainda
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Leia o QR Code ou informe a chave de 44 dígitos de uma nota fiscal do
        Ceará para salvar seus itens e despesas.
      </p>
      {onImportFiscalNote ? (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            className="h-10 rounded-xl bg-brand px-4 text-brand-foreground hover:bg-brand/90"
            onClick={onImportFiscalNote}
          >
            <QrCode className="h-4 w-4" aria-hidden="true" />
            Ler primeira NFC-e
          </Button>
        </div>
      ) : null}
    </div>
  )
}
