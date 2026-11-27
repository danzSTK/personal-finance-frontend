import {
  EllipsisVertical,
  ReceiptText,
  ShoppingBag,
  Unlink,
} from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { formatCurrencyFromCents, formatDateTime } from '@/shared/utils/formatters'
import type { FiscalNoteSummaryItem } from '../../types/fiscal-note.types'
import {
  formatCnpj,
  formatFiscalNoteNumberAndSeries,
} from '../../utils/fiscalNoteFormat.utils'

export interface FiscalNotesTableProps {
  notes: FiscalNoteSummaryItem[]
  isMutating?: boolean
  onSelectNote: (note: FiscalNoteSummaryItem) => void
  onOpenTransaction?: (transactionId: string) => void
  onUnlinkNote: (note: FiscalNoteSummaryItem) => void
}

/**
 * Responsive listing of persisted NFC-e summaries (desktop table and mobile cards) with row actions.
 */
export function FiscalNotesTable({
  notes,
  isMutating = false,
  onSelectNote,
  onOpenTransaction,
  onUnlinkNote,
}: FiscalNotesTableProps) {
  return (
    <>
      <div className="hidden max-w-full overflow-hidden rounded-2xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">
                Estabelecimento
              </TableHead>
              <TableHead className="text-muted-foreground">Emissão</TableHead>
              <TableHead className="text-muted-foreground">Itens</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Desconto
              </TableHead>
              <TableHead className="text-right text-muted-foreground">
                Total pago
              </TableHead>
              <TableHead className="w-12 text-muted-foreground">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note) => (
              <TableRow
                key={note.id}
                tabIndex={0}
                className="cursor-pointer border-border hover:bg-secondary/70 focus-visible:bg-secondary/70 focus-visible:outline-hidden"
                onClick={() => onSelectNote(note)}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === 'Enter' || event.key === ' ')
                  ) {
                    event.preventDefault()
                    onSelectNote(note)
                  }
                }}
              >
                <TableCell className="max-w-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {note.issuerName}
                    </p>
                    <p className="numeric mt-0.5 truncate text-xs text-muted-foreground">
                      CNPJ {formatCnpj(note.issuerCnpj)} ·{' '}
                      {formatFiscalNoteNumberAndSeries(
                        note.number,
                        note.series
                      )}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="numeric whitespace-nowrap text-muted-foreground">
                  {formatDateTime(note.issuedAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="numeric border-border bg-secondary text-foreground"
                  >
                    {formatItemsCount(note.itemsCount)}
                  </Badge>
                </TableCell>
                <TableCell className="numeric text-right whitespace-nowrap">
                  {note.discountAmountCents > 0 ? (
                    <span className="text-state-income">
                      -{formatCurrencyFromCents(note.discountAmountCents)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="numeric text-right font-semibold whitespace-nowrap text-foreground">
                  {formatCurrencyFromCents(note.payableAmountCents)}
                </TableCell>
                <TableCell
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <FiscalNoteActionsMenu
                    note={note}
                    isMutating={isMutating}
                    onSelectNote={() => onSelectNote(note)}
                    onOpenTransaction={
                      onOpenTransaction
                        ? () => onOpenTransaction(note.transactionId)
                        : undefined
                    }
                    onUnlinkNote={() => onUnlinkNote(note)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {notes.map((note) => (
          <article
            key={note.id}
            className="relative rounded-2xl border border-border bg-card transition hover:bg-secondary/50"
          >
            <button
              type="button"
              className="flex w-full flex-col gap-3 p-4 pr-14 text-left focus-visible:rounded-2xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => onSelectNote(note)}
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {note.issuerName}
                </p>
                <p className="numeric truncate text-xs text-muted-foreground">
                  CNPJ {formatCnpj(note.issuerCnpj)} ·{' '}
                  {formatFiscalNoteNumberAndSeries(note.number, note.series)}
                </p>
                <p className="numeric text-xs text-muted-foreground">
                  {formatDateTime(note.issuedAt)}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className="numeric border-border bg-secondary text-foreground"
                  >
                    {formatItemsCount(note.itemsCount)}
                  </Badge>
                  {note.discountAmountCents > 0 ? (
                    <Badge
                      variant="secondary"
                      className="numeric border-transparent bg-state-income/10 text-state-income"
                    >
                      Desconto {formatCurrencyFromCents(note.discountAmountCents)}
                    </Badge>
                  ) : null}
                </div>

                <span className="numeric text-base font-semibold text-foreground">
                  {formatCurrencyFromCents(note.payableAmountCents)}
                </span>
              </div>
            </button>

            <div
              className="absolute top-3 right-3"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <FiscalNoteActionsMenu
                note={note}
                isMutating={isMutating}
                onSelectNote={() => onSelectNote(note)}
                onOpenTransaction={
                  onOpenTransaction
                    ? () => onOpenTransaction(note.transactionId)
                    : undefined
                }
                onUnlinkNote={() => onUnlinkNote(note)}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

interface FiscalNoteActionsMenuProps {
  note: FiscalNoteSummaryItem
  isMutating: boolean
  onSelectNote: () => void
  onOpenTransaction?: () => void
  onUnlinkNote: () => void
}

function FiscalNoteActionsMenu({
  note,
  isMutating,
  onSelectNote,
  onOpenTransaction,
  onUnlinkNote,
}: FiscalNoteActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(event) => event.stopPropagation()}
          className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label={`Abrir ações de ${note.issuerName}`}
          title="Ações"
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(event) => event.stopPropagation()}
        className="w-60 rounded-2xl border-border bg-card p-2 text-foreground"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Ações da nota fiscal
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          className="cursor-pointer rounded-xl focus:bg-accent focus:text-foreground"
          onSelect={onSelectNote}
        >
          <ShoppingBag className="h-4 w-4" />
          Ver lista de compras
        </DropdownMenuItem>
        {onOpenTransaction ? (
          <DropdownMenuItem
            className="cursor-pointer rounded-xl focus:bg-accent focus:text-foreground"
            onSelect={onOpenTransaction}
          >
            <ReceiptText className="h-4 w-4" />
            Ver despesa vinculada
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          disabled={isMutating}
          className="cursor-pointer rounded-xl text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={onUnlinkNote}
        >
          <Unlink className="h-4 w-4" />
          Desvincular NFC-e
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const formatItemsCount = (count: number): string =>
  `${count} ${count === 1 ? 'item' : 'itens'}`
