import { useMemo } from 'react'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
import { resolveApiError } from '@/shared/errors'
import { toast } from '@/shared/hooks/use-toast'
import { useUnlinkFiscalNote } from '../../api/mutations'
import type { FiscalNoteDetail } from '../../types/fiscal-note.types'
import { formatFiscalNoteNumberAndSeries } from '../../utils/fiscalNoteFormat.utils'

export interface FiscalNoteUnlinkDialogProps {
  open: boolean
  transactionId: string | null
  fiscalNote?: Pick<FiscalNoteDetail, 'issuerName' | 'number' | 'series'> | null
  onOpenChange: (open: boolean) => void
  onUnlinked?: () => void
}

/**
 * Confirmation dialog for unlinking an NFC-e while preserving the parent expense and account balances.
 */
export function FiscalNoteUnlinkDialog({
  open,
  transactionId,
  fiscalNote,
  onOpenChange,
  onUnlinked,
}: FiscalNoteUnlinkDialogProps) {
  const unlinkMutation = useUnlinkFiscalNote()

  const errorPresentation = useMemo(
    () =>
      unlinkMutation.error
        ? resolveApiError(unlinkMutation.error, 'fiscal-notes.unlink')
        : null,
    [unlinkMutation.error]
  )

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      unlinkMutation.reset()
    }
    onOpenChange(nextOpen)
  }

  const handleConfirmUnlink = async () => {
    if (!transactionId || unlinkMutation.isPending) {
      return
    }

    try {
      await unlinkMutation.mutateAsync(transactionId)
      toast({
        title: 'NFC-e desvinculada',
        description:
          'A despesa foi preservada e a chave da nota ficou liberada.',
      })
      onUnlinked?.()
      handleOpenChange(false)
    } catch {
      // Inline ApiErrorAlert displays the resolved error.
    }
  }

  return (
    <AlertDialog open={open && Boolean(transactionId)} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] rounded-2xl border-border bg-card text-foreground sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            Desvincular NFC-e desta despesa?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {fiscalNote ? (
              <>
                Você está desvinculando a nota de{' '}
                <span className="font-medium text-foreground">
                  {fiscalNote.issuerName}
                </span>{' '}
                ({formatFiscalNoteNumberAndSeries(fiscalNote.number, fiscalNote.series)}).
              </>
            ) : (
              'Você está prestes a remover o vínculo desta nota fiscal.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="space-y-2 rounded-2xl border border-border bg-secondary p-3.5 text-xs leading-5 text-muted-foreground">
          <li>
            • A nota fiscal e a lista de compras serão removidas desta despesa.
          </li>
          <li className="font-medium text-foreground">
            • A despesa e o saldo das contas permanecerão intactos.
          </li>
          <li>
            • A chave de acesso ficará liberada para ser importada ou vinculada novamente no futuro.
          </li>
        </ul>

        {errorPresentation ? <ApiErrorAlert error={errorPresentation} /> : null}

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={unlinkMutation.isPending}
            className="rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
          >
            Cancelar
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={unlinkMutation.isPending}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleConfirmUnlink}
          >
            {unlinkMutation.isPending ? 'Desvinculando...' : 'Desvincular NFC-e'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
