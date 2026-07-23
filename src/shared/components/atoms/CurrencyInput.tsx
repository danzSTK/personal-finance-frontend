import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ClipboardEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'

interface CurrencyInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'defaultValue' | 'inputMode' | 'onChange' | 'type' | 'value'
  > {
  valueCents: number | null | undefined
  onValueCentsChange: (value: number | undefined) => void
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      valueCents,
      onValueCentsChange,
      className,
      onFocus,
      onKeyDown,
      onPaste,
      placeholder = 'R$ 0,00',
      ...props
    },
    forwardedRef
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const displayValue =
      valueCents === null || valueCents === undefined
        ? ''
        : formatCurrencyFromCents(valueCents)

    useImperativeHandle(forwardedRef, () => inputRef.current!, [])

    useLayoutEffect(() => {
      const input = inputRef.current

      if (!input || document.activeElement !== input) {
        return
      }

      const end = input.value.length
      input.setSelectionRange(end, end)
    }, [displayValue])

    const emitDigitSequence = (digits: string) => {
      if (digits === '') {
        onValueCentsChange(undefined)
        return
      }

      const nextValue = Number(digits)

      if (Number.isSafeInteger(nextValue)) {
        onValueCentsChange(nextValue)
      }
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)

      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      if (/^\d$/.test(event.key)) {
        event.preventDefault()
        const selectedAll =
          event.currentTarget.selectionStart === 0 &&
          event.currentTarget.selectionEnd === event.currentTarget.value.length
        const currentValue = selectedAll ? 0 : (valueCents ?? 0)
        const nextValue = currentValue * 10 + Number(event.key)

        if (Number.isSafeInteger(nextValue)) {
          onValueCentsChange(nextValue)
        }

        return
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()

        if (valueCents === null || valueCents === undefined || valueCents <= 9) {
          onValueCentsChange(undefined)
          return
        }

        onValueCentsChange(Math.floor(valueCents / 10))
      }
    }

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
      onPaste?.(event)

      if (event.defaultPrevented) {
        return
      }

      event.preventDefault()
      emitDigitSequence(event.clipboardData.getData('text').replace(/\D/g, ''))
    }

    return (
      <input
        {...props}
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        placeholder={placeholder}
        onChange={(event) =>
          emitDigitSequence(event.currentTarget.value.replace(/\D/g, ''))
        }
        onFocus={(event) => {
          const end = event.currentTarget.value.length
          event.currentTarget.setSelectionRange(end, end)
          onFocus?.(event)
        }}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={cn(
          'numeric flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
      />
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'
