import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/shared/components/ui/select'
import { cn } from '@/shared/lib/utils'
import { TRANSACTION_VIEW_OPTIONS } from '../../constants/transaction.constants'
import type { TransactionView } from '../../types/transaction-ui.types'
import {
  getTransactionViewOption,
  getTransactionViewToneClassName,
} from '../../utils/transaction.utils'

interface TransactionTypeSelectProps {
  value: TransactionView
  onChange: (value: TransactionView) => void
  className?: string
}

export function TransactionTypeSelect({
  value,
  onChange,
  className,
}: TransactionTypeSelectProps) {
  const selectedOption = getTransactionViewOption(value)
  const SelectedIcon = selectedOption.icon

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as TransactionView)}
    >
      <SelectTrigger
        className={cn(
          'gap-2 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0',
          className,
          getTransactionViewToneClassName(value, 'border'),
          getTransactionViewToneClassName(value, 'softBg'),
          getTransactionViewToneClassName(value)
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
              getTransactionViewToneClassName(value, 'softBg'),
              getTransactionViewToneClassName(value)
            )}
          >
            <SelectedIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 truncate">{selectedOption.label}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="border-border bg-card text-foreground">
        {TRANSACTION_VIEW_OPTIONS.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            hideIndicator
            className="focus:bg-accent focus:text-foreground"
          >
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-lg',
                  option.tone === 'income' &&
                    'bg-state-income/10 text-state-income',
                  option.tone === 'expense' &&
                    'bg-state-expense/10 text-state-expense',
                  option.tone === 'info' && 'bg-state-info/10 text-state-info'
                )}
              >
                <option.icon className="h-4 w-4" />
              </span>
              <span>{option.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
