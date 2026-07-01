import type { ReactNode } from 'react'

interface AccountFormFieldProps {
  label: string
  error?: string
  children: ReactNode
}

export function AccountFormField({
  label,
  error,
  children,
}: AccountFormFieldProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </span>
      {children}
      {error ? (
        <span className="block text-xs text-destructive">{error}</span>
      ) : null}
    </div>
  )
}
