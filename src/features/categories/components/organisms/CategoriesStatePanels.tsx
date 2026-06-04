import type { ReactNode } from 'react'
import { Archive, FolderOpen, SearchX, TriangleAlert } from 'lucide-react'
import { Button } from '@/shared/lib/button'
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
        <CategoryCreateButton
          type={type}
          className="mt-4"
          onClick={onCreate}
        />
      }
    />
  )
}

interface CategoriesErrorStateProps {
  onRetry: () => void
}

export function CategoriesErrorState({ onRetry }: CategoriesErrorStateProps) {
  return (
    <StatePanel
      icon={<TriangleAlert className="h-6 w-6" />}
      title="Não foi possível carregar categorias"
      description="Confira sua conexão e tente novamente. Nada foi alterado."
      action={
        <Button
          type="button"
          className="mt-4 rounded-xl bg-brand text-brand-foreground hover:bg-brand-intense"
          onClick={onRetry}
        >
          Tentar novamente
        </Button>
      }
    />
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
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-app-border bg-app-surface p-6 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-app-panel text-app-muted">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold text-app-text">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-app-muted">
        {description}
      </p>
      {action}
    </div>
  )
}
