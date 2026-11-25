import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FocusEvent,
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
  allowNegative?: boolean
}

const hasLeadingNegativeSign = (rawValue: string): boolean =>
  /^\s*(?:R\$\s*)?-/.test(rawValue)

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      valueCents,
      onValueCentsChange,
      allowNegative = false,
      className,
      onBlur,
      onFocus,
      onKeyDown,
      onPaste,
      placeholder = 'R$ 0,00',
      ...props
    },
    forwardedRef
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [pendingNegative, setPendingNegative] = useState(false)
    const isPendingNegative = allowNegative && pendingNegative

    const displayValue =
      valueCents === null || valueCents === undefined
        ? isPendingNegative
          ? '-'
          : ''
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

    const emitDigitSequence = (digits: string, isNegative = false) => {
      if (digits === '') {
        setPendingNegative(false)
        onValueCentsChange(undefined)
        return
      }

      const magnitude = Number(digits)
      const nextValue =
        allowNegative && isNegative && magnitude > 0 ? -magnitude : magnitude

      if (Number.isSafeInteger(nextValue)) {
        if (magnitude > 0) {
          setPendingNegative(false)
        }
        onValueCentsChange(nextValue)
      }
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)

      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      if (allowNegative && event.key === '-') {
        event.preventDefault()

        if (valueCents !== null && valueCents !== undefined && valueCents > 0) {
          setPendingNegative(false)
          onValueCentsChange(-valueCents)
          return
        }

        if (valueCents === null || valueCents === undefined || valueCents === 0) {
          setPendingNegative(true)
        }

        return
      }

      if (allowNegative && event.key === '+') {
        event.preventDefault()
        setPendingNegative(false)

        if (valueCents !== null && valueCents !== undefined && valueCents < 0) {
          onValueCentsChange(Math.abs(valueCents))
        }

        return
      }

      if (/^\d$/.test(event.key)) {
        event.preventDefault()
        const selectedAll =
          event.currentTarget.selectionStart === 0 &&
          event.currentTarget.selectionEnd === event.currentTarget.value.length &&
          event.currentTarget.value.length > 0
        const currentMagnitude = selectedAll ? 0 : Math.abs(valueCents ?? 0)
        const nextMagnitude = currentMagnitude * 10 + Number(event.key)
        const shouldBeNegative =
          allowNegative &&
          !selectedAll &&
          (isPendingNegative || (valueCents ?? 0) < 0)
        const nextValue =
          shouldBeNegative && nextMagnitude > 0 ? -nextMagnitude : nextMagnitude

        if (Number.isSafeInteger(nextValue)) {
          if (nextMagnitude > 0) {
            setPendingNegative(false)
          }
          onValueCentsChange(nextValue)
        }

        return
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()

        if (valueCents === null || valueCents === undefined) {
          setPendingNegative(false)
          onValueCentsChange(undefined)
          return
        }

        const magnitude = Math.abs(valueCents)

        if (magnitude <= 9) {
          setPendingNegative(false)
          onValueCentsChange(undefined)
          return
        }

        const nextMagnitude = Math.floor(magnitude / 10)
        const nextValue =
          allowNegative && valueCents < 0 ? -nextMagnitude : nextMagnitude
        onValueCentsChange(nextValue)
      }
    }

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
      onPaste?.(event)

      if (event.defaultPrevented) {
        return
      }

      event.preventDefault()
      const pastedText = event.clipboardData.getData('text')
      emitDigitSequence(
        pastedText.replace(/\D/g, ''),
        allowNegative && hasLeadingNegativeSign(pastedText)
      )
    }

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (valueCents === null || valueCents === undefined) {
        setPendingNegative(false)
      }
      onBlur?.(event)
    }

    return (
      <input
        {...props}
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        placeholder={placeholder}
        onChange={(event) => {
          const rawValue = event.currentTarget.value
          const digits = rawValue.replace(/\D/g, '')
          const hasMinus = allowNegative && hasLeadingNegativeSign(rawValue)

          if (digits === '' && hasMinus) {
            setPendingNegative(true)
            onValueCentsChange(undefined)
            return
          }

          emitDigitSequence(digits, hasMinus)
        }}
        onBlur={handleBlur}
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
