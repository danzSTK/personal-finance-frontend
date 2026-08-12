import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
  (
    {
      label,
      error,
      helperText,
      required,
      id,
      prefixIcon,
      className,
      type,
      disabled,
      ...inputProps
    },
    ref
  ) => {
    const inputId = id || label.toLowerCase().replace(/\s/g, '-')
    const isPasswordField = type === 'password'
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const passwordToggleLabel = isPasswordVisible
      ? 'Ocultar senha'
      : 'Mostrar senha'

    const handlePasswordToggle = () => {
      setIsPasswordVisible((isVisible) => !isVisible)
    }

    const preserveInputFocus = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
    }

    return (
      <div className="space-y-2">
        <Label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
        >
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </Label>

        <div className="relative">
          {prefixIcon ? (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {prefixIcon}
            </div>
          ) : null}

          <Input
            ref={ref}
            id={inputId}
            type={isPasswordField && isPasswordVisible ? 'text' : type}
            disabled={disabled}
            className={cn(
              prefixIcon ? 'pl-10' : '',
              isPasswordField ? 'pr-12' : '',
              error ? 'border-destructive focus-visible:ring-destructive' : '',
              className
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...inputProps}
          />

          {isPasswordField ? (
            <button
              type="button"
              aria-label={passwordToggleLabel}
              aria-pressed={isPasswordVisible}
              title={passwordToggleLabel}
              disabled={disabled}
              onMouseDown={preserveInputFocus}
              onClick={handlePasswordToggle}
              className="absolute right-0 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {isPasswordVisible ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          ) : null}
        </div>

        {error ? (
          <ErrorMessage id={`${inputId}-error`}>{error}</ErrorMessage>
        ) : null}

        {helperText && !error ? (
          <p id={`${inputId}-helper`} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
