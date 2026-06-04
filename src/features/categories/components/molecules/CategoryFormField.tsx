import type { ReactNode } from 'react'

interface CategoryFormFieldProps {
  label: string
  error?: string
  children: ReactNode
}

export function CategoryFormField({
  label,
  error,
  children,
}: CategoryFormFieldProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase text-app-muted">
        {label}
      </span>
      {children}
      {error ? (
        <span className="block text-xs text-destructive">{error}</span>
      ) : null}
    </div>
  )
}
