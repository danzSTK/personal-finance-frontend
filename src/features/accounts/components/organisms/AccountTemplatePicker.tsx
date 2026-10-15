import { Palette } from 'lucide-react'
import { useAccountTemplates } from '../../api/queries'
import type { AccountTemplate } from '../../types/account.types'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { resolveApiError } from '@/shared/errors'
import { Button } from '@/shared/lib/button'
import { AccountTemplateOption } from '../molecules/AccountTemplateOption'

interface AccountTemplatePickerProps {
  enabled: boolean
  onSelect: (template: AccountTemplate) => void
  onSelectCustom: () => void
}

export function AccountTemplatePicker({
  enabled,
  onSelect,
  onSelectCustom,
}: AccountTemplatePickerProps) {
  const {
    data: templates = [],
    error,
    isError,
    isLoading,
    isFetching,
    refetch,
  } = useAccountTemplates({ enabled })

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <div className="space-y-2 pb-1">
          {isLoading
            ? Array.from({ length: 6 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="h-16 w-full rounded-2xl bg-app-panel"
                />
              ))
            : null}

          {!isLoading && isError ? (
            <ApiErrorAlert
              error={resolveApiError(error, 'accounts.templates')}
              onRetry={() => void refetch()}
            />
          ) : null}

          {!isLoading && !isError && templates.length === 0 ? (
            <div className="rounded-2xl border border-app-border bg-app-panel p-4">
              <p className="text-sm font-semibold text-app-text">
                Nenhuma instituição disponível agora
              </p>
              <p className="mt-1 text-sm leading-5 text-app-muted">
                Você ainda pode criar uma conta personalizada.
              </p>
            </div>
          ) : null}

          {!isLoading && !isError
            ? templates.map((template) => (
                <AccountTemplateOption
                  key={template.id}
                  template={template}
                  onSelect={onSelect}
                />
              ))
            : null}
        </div>
      </div>

      {isFetching && !isLoading ? (
        <span className="text-center text-xs font-medium text-app-muted">
          Atualizando instituições...
        </span>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full shrink-0 rounded-xl border-app-border bg-app-panel text-app-text hover:bg-app-elevated hover:text-app-text"
        onClick={onSelectCustom}
      >
        <Palette className="h-4 w-4" />
        Criar personalizada
      </Button>
    </div>
  )
}
