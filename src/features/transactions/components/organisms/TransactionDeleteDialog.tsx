import { useMemo } from 'react'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { Button } from '@/shared/lib/button'
import { resolveApiError } from '@/shared/errors'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { useDeleteTransaction } from '../../api/mutations'
import type { TransactionDeleteDialogState } from '../../types/transaction-ui.types'
import {
  formatSignedTransactionAmount,
  getTransactionDescription,
  getTransactionTypeLabel,
} from '../../utils/transaction.utils'

interface TransactionDeleteDialogProps {
  state: TransactionDeleteDialogState
  onOpenChange: (isOpen: boolean) => void
}

export function TransactionDeleteDialog({
  state,
  onOpenChange,
}: TransactionDeleteDialogProps) {
  const deleteMutation = useDeleteTransaction()
  const transaction = state?.transaction ?? null
  const errorPresentation = useMemo(
    () =>
      deleteMutation.error
        ? resolveApiError(deleteMutation.error, 'transactions.delete')
        : null,
    [deleteMutation.error]
  )

  const handleDelete = () => {
    if (!transaction || transaction.type === 'TRANSFER') {
      return
    }

    deleteMutation.mutate(transaction.id, {
      onSuccess: () => onOpenChange(false),
    })
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      deleteMutation.reset()
    }

    onOpenChange(isOpen)
  }

  return (
    <AlertDialog open={transaction !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] rounded-2xl border-border bg-card text-foreground sm:max-w-md">
        {transaction ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">
                Excluir {getTransactionTypeLabel(transaction.type).toLowerCase()}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                {transaction.type === 'TRANSFER'
                  ? 'Transferências não podem ser excluídas nesta versão.'
                  : `Você vai excluir "${getTransactionDescription(
                      transaction
                    )}" no valor de ${formatSignedTransactionAmount(
                      transaction,
                      formatCurrencyFromCents
                    )}. Essa ação não pode ser revertida.`}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {errorPresentation ? (
              <ApiErrorAlert error={errorPresentation} />
            ) : null}

            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground">
                Cancelar
              </AlertDialogCancel>
              <Button
                type="button"
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={
                  deleteMutation.isPending || transaction.type === 'TRANSFER'
                }
                onClick={handleDelete}
              >
                {deleteMutation.isPending
                  ? 'Excluindo...'
                  : 'Excluir definitivamente'}
              </Button>
            </AlertDialogFooter>
          </>
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  )
}
