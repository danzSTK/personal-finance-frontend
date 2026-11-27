import { useId, type KeyboardEvent } from 'react'
import { Link2, QrCode, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/lib/utils'
import { FISCAL_NOTE_ACCESS_KEY_LENGTH } from '../../constants/fiscal-notes.constants'
import {
  formatAccessKeyGroups,
  stripNonDigits,
} from '../../utils/fiscalNoteInput.utils'

export interface FiscalNoteAccessKeyFieldProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  error?: string | null
  disabled?: boolean
  id?: string
  placeholder?: string
  className?: string
}

const HTTP_URL_PREFIX_REGEX = /^https?:\/\//i
const DIGIT_KEY_INPUT_REGEX = /^[\d\s.-]*$/

const detectInputKind = (
  value: string
): 'url' | 'payload' | 'digits' | 'empty' => {
  const trimmed = value.trim()
  if (!trimmed) {
    return 'empty'
  }

  if (HTTP_URL_PREFIX_REGEX.test(trimmed)) {
    return 'url'
  }

  if (
    trimmed.includes('|') ||
    /^p=/i.test(trimmed) ||
    /%7c/i.test(trimmed)
  ) {
    return 'payload'
  }

  if (DIGIT_KEY_INPUT_REGEX.test(trimmed)) {
    return 'digits'
  }

  return 'url'
}

/**
 * Input field for pasting an NFC-e QR Code URL, pipe payload, or typing a 44-digit access key.
 */
export function FiscalNoteAccessKeyField({
  value,
  onChange,
  onSubmit,
  error,
  disabled = false,
  id,
  placeholder = 'Cole a URL do QR Code ou digite os 44 dígitos da chave de acesso',
  className,
}: FiscalNoteAccessKeyFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const errorId = `${fieldId}-error`
  const hintId = `${fieldId}-hint`

  const inputKind = detectInputKind(value)
  const digitsCount =
    inputKind === 'digits'
      ? stripNonDigits(value).slice(0, FISCAL_NOTE_ACCESS_KEY_LENGTH).length
      : 0

  const handleValueChange = (rawValue: string) => {
    if (DIGIT_KEY_INPUT_REGEX.test(rawValue)) {
      const hasDigits = stripNonDigits(rawValue).length > 0
      onChange(hasDigits ? formatAccessKeyGroups(rawValue) : '')
      return
    }

    onChange(rawValue)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && onSubmit) {
      event.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-foreground"
        >
          URL do QR Code ou chave de acesso
        </label>

        {inputKind === 'url' && HTTP_URL_PREFIX_REGEX.test(value.trim()) ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
            <QrCode className="h-3 w-3" aria-hidden="true" />
            QR Code detectado
          </span>
        ) : inputKind === 'payload' ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
            <Link2 className="h-3 w-3" aria-hidden="true" />
            Payload detectado
          </span>
        ) : inputKind === 'digits' ? (
          <span className="numeric text-xs font-medium text-muted-foreground">
            {digitsCount}/{FISCAL_NOTE_ACCESS_KEY_LENGTH} dígitos
          </span>
        ) : null}
      </div>

      <div className="relative">
        <Textarea
          id={fieldId}
          rows={3}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          onChange={(event) => handleValueChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            'numeric min-h-24 rounded-xl border-border bg-secondary pr-11 text-sm leading-6 text-foreground placeholder:font-sans placeholder:text-muted-foreground',
            error && 'border-destructive focus-visible:border-destructive'
          )}
        />

        {value.length > 0 && !disabled ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Limpar código da NFC-e"
            title="Limpar"
            className="absolute top-2 right-2 h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <p id={hintId} className="text-xs leading-5 text-muted-foreground">
        Aceita link do QR Code da SEFAZ-CE, payload <code className="numeric">p</code> ou chave de 44 dígitos.
      </p>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
