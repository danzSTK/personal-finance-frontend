import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { ErrorMessage } from '../atoms/ErrorMessage'
import { Input, Label } from '../atoms'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  prefixIcon?: ReactNode
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, id, prefixIcon, className, ...inputProps }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="space-y-2">
        <Label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-[0.08em] text-app-muted"
        >
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </Label>

        <div className="relative">
          {prefixIcon ? (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted">
              {prefixIcon}
            </div>
          ) : null}

          <Input
            ref={ref}
            id={inputId}
            className={cn(
              prefixIcon ? 'pl-10' : '',
              error ? 'border-destructive focus-visible:ring-destructive' : '',
              className
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...inputProps}
          />
        </div>

        {error ? <ErrorMessage id={`${inputId}-error`}>{error}</ErrorMessage> : null}

        {helperText && !error ? (
          <p id={`${inputId}-helper`} className="text-xs text-app-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
