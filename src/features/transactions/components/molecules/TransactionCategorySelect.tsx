import type { CSSProperties } from 'react'
import { CircleDashed } from 'lucide-react'
import type { Category } from '@/features/categories/types/category.types'
import {
  getCategoryColorOption,
  getCategoryColorToken,
  getCategoryIconKey,
  getCategoryIconOption,
} from '@/features/categories/utils/category.utils'
import { cn } from '@/shared/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/shared/components/ui/select'

const DEFAULT_TRIGGER_CLASS_NAME =
  'h-11 w-full min-w-0 rounded-xl border-border bg-secondary text-foreground focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0'

export interface CategorySelectLabelProps {
  category: Category | null
  fallback?: string
}

/** Displays a category's icon, color badge, and truncated name inside select triggers and options. */
export function CategorySelectLabel({
  category,
  fallback = 'Categoria',
}: CategorySelectLabelProps) {
  if (!category) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-state-info/10 text-state-info">
          <CircleDashed className="h-4 w-4" />
        </span>
        <span className="truncate">{fallback}</span>
      </div>
    )
  }

  const Icon = getCategoryIconOption(getCategoryIconKey(category)).icon
  const color = getCategoryColorOption(
    getCategoryColorToken(category),
    category.type === 'INCOME' ? 'INCOME' : 'EXPENSE'
  )
  const style: CSSProperties = {
    backgroundColor: color.hex,
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground"
        style={style}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{category.displayName}</span>
    </div>
  )
}

export interface TransactionCategorySelectProps {
  categories: Category[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  invalid?: boolean
  disabled?: boolean
  triggerClassName?: string
}

/** Reusable category selector displaying each category's icon and semantic color badge. */
export function TransactionCategorySelect({
  categories,
  value,
  onValueChange,
  placeholder = 'Escolha uma categoria',
  ariaLabel = 'Categoria',
  invalid = false,
  disabled = false,
  triggerClassName,
}: TransactionCategorySelectProps) {
  const selectedCategory =
    categories.find((category) => category.id === value) ?? null

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        aria-label={ariaLabel}
        aria-invalid={invalid}
        className={cn(DEFAULT_TRIGGER_CLASS_NAME, triggerClassName)}
      >
        <CategorySelectLabel
          category={selectedCategory}
          fallback={placeholder}
        />
      </SelectTrigger>
      <SelectContent className="border-border bg-card text-foreground">
        {categories.map((category) => (
          <SelectItem
            key={category.id}
            value={category.id}
            hideIndicator
            className="focus:bg-accent focus:text-foreground"
          >
            <CategorySelectLabel category={category} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
