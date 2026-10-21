import { Plus } from 'lucide-react'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import { TRANSACTION_VIEW_CREATE_LABELS } from '../../constants/transaction.constants'
import type { TransactionView } from '../../types/transaction-ui.types'

interface TransactionCreateButtonProps {
  view: Extract<TransactionView, 'EXPENSE' | 'INCOME' | 'TRANSFER'>
  onClick: () => void
  className?: string
}

export function TransactionCreateButton({
  view,
  onClick,
  className,
}: TransactionCreateButtonProps) {
  const label = TRANSACTION_VIEW_CREATE_LABELS[view]

  return (
    <Button
      type="button"
      className={cn(
        'group h-11 w-11 justify-center gap-0 overflow-hidden rounded-xl px-0 text-primary-foreground transition-[width,background-color] duration-300 ease-out sm:hover:w-44 sm:focus-visible:w-44',
        view === 'EXPENSE'
          ? 'bg-state-expense hover:bg-state-expense/90'
          : view === 'INCOME'
            ? 'bg-state-income hover:bg-state-income/90'
            : 'bg-state-info hover:bg-state-info/90',
        className
      )}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Plus className="h-4 w-4" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-[max-width,opacity,margin] duration-300 ease-out group-hover:sm:ml-2 group-hover:sm:max-w-32 group-hover:sm:opacity-100 group-focus-visible:sm:ml-2 group-focus-visible:sm:max-w-32 group-focus-visible:sm:opacity-100">
        {label}
      </span>
    </Button>
  )
}
