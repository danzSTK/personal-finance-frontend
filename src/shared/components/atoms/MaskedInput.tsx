import { IMaskInput } from 'react-imask'
import { forwardRef } from 'react'
import { cn } from '@/shared/lib/utils'

interface MaskedInputProps {
  mask: any
  value?: string
  onAccept?: (value: string) => void
  placeholder?: string
  className?: string
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onAccept, placeholder, className }, ref) => {
    return (
      <IMaskInput
        mask={mask}
        value={value}
        onAccept={onAccept}
        placeholder={placeholder}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        inputRef={ref as any}
      />
    )
  }
)

MaskedInput.displayName = 'MaskedInput'
