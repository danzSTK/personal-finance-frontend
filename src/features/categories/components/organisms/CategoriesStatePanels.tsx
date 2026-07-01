import type { ReactNode } from 'react'
import { Archive, FolderOpen, SearchX } from 'lucide-react'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { resolveApiError } from '@/shared/errors'
import { CategoryCreateButton } from '../molecules/CategoryCreateButton'
import type { CategoryArchiveView } from '../../types/category-ui.types'
import type { CategoryManagementType } from '../../types/category.types'

interface CategoriesEmptyStateProps {
  archiveView: CategoryArchiveView
  search: string
  type: CategoryManagementType
  typeLabel: string
  onCreate: () => void
}

export function CategoriesEmptyState({
  archiveView,
  search,
  type,
  typeLabel,
  onCreate,
}: CategoriesEmptyStateProps) {
  const hasSearch = search.trim() !== ''

  if (hasSearch) {
    return (
      <StatePanel
        icon={<SearchX className="h-6 w-6" />}
        title="Nenhuma categoria encontrada"
        description="Tente buscar por outro nome ou limpe a pesquisa para ver a lista completa."
      />
    )
  }

  if (archiveView === 'archived') {
    return (
      <StatePanel
        icon={<Archive className="h-6 w-6" />}
        title={`Sem ${typeLabel.toLowerCase()} arquivadas`}
        description="Categorias arquivadas ficam aqui quando você quiser recuperar ou excluir depois."
      />
    )
  }

  return (
    <StatePanel
      icon={<FolderOpen className="h-6 w-6" />}
      title={`Nenhuma categoria de ${typeLabel.toLowerCase()} ainda`}
      description="Crie a primeira categoria para organizar lançamentos e relatórios."
      action={
        <CategoryCreateButton type={type} className="mt-4" onClick={onCreate} />
      }
    />
  )
}

interface CategoriesErrorStateProps {
  error: unknown
  onRetry: () => void
}

export function CategoriesErrorState({
  error,
  onRetry,
}: CategoriesErrorStateProps) {
  return (
    <div className="min-h-72 rounded-2xl border border-border bg-card p-6">
      <ApiErrorAlert
        error={resolveApiError(error, 'categories.list')}
        onRetry={onRetry}
      />
    </div>
  )
}

interface StatePanelProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

function StatePanel({ icon, title, description, action }: StatePanelProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action}
    </div>
  )
}
