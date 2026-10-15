import type { ReactNode } from 'react'

interface AccountFormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
}

export function AccountFormField({
  label,
  htmlFor,
  error,
  children,
}: AccountFormFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase text-muted-foreground"
      >
        {label}
      </label>
      {children}
      {error ? (
        <span className="block text-xs text-destructive">{error}</span>
      ) : null}
    </div>
  )
}
