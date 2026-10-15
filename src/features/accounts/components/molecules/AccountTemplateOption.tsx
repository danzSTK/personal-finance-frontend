import { useState } from 'react'
import { Landmark } from 'lucide-react'
import type { AccountTemplate } from '../../types/account.types'
import {
  ACCOUNT_VISUAL_TONES,
  DEFAULT_ACCOUNT_VISUAL_TONE,
} from '../../constants/account.constants'
import { cn } from '@/shared/lib/utils'

interface AccountTemplateOptionProps {
  template: AccountTemplate
  onSelect: (template: AccountTemplate) => void
}

export function AccountTemplateOption({
  template,
  onSelect,
}: AccountTemplateOptionProps) {
  const [logoFailed, setLogoFailed] = useState(false)
  const tone =
    ACCOUNT_VISUAL_TONES[template.colorToken ?? ''] ??
    DEFAULT_ACCOUNT_VISUAL_TONE

  return (
    <button
      type="button"
      className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-app-border bg-app-panel px-3 py-2.5 text-left transition hover:border-brand/45 hover:bg-app-elevated focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
      onClick={() => onSelect(template)}
      aria-label={`Criar conta com ${template.name}`}
    >
      {template.logoUrl && !logoFailed ? (
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-app-text p-1.5">
          <img
            src={template.logoUrl}
            alt=""
            className="h-full w-full object-contain"
            onError={() => setLogoFailed(true)}
          />
        </span>
      ) : (
        <span
          className={cn(
            'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            tone.backgroundClass,
            tone.foregroundClass
          )}
          aria-hidden="true"
        >
          <Landmark className="h-5 w-5" />
        </span>
      )}

      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-app-text">
          {template.name}
        </span>
        <span className="mt-0.5 block text-xs text-app-muted">
          Conta institucional
        </span>
      </span>
    </button>
  )
}
