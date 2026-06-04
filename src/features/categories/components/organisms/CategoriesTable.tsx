import type { CSSProperties } from 'react'
import {
  Archive,
  CheckCircle2,
  Edit3,
  EllipsisVertical,
  EyeOff,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import type { Category } from '../../types/category.types'
import {
  canManageCategory,
  canRestoreCategory,
  categoryTypeTone,
  getCategoryColorOption,
  getCategoryColorToken,
  getCategoryIconKey,
  getCategoryIconOption,
  getCategoryTypeLabel,
} from '../../utils/category.utils'

interface CategoriesTableProps {
  categories: Category[]
  isMutating: boolean
  onEdit: (category: Category) => void
  onArchive: (category: Category) => void
  onUnarchive: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoriesTable({
  categories,
  isMutating,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: CategoriesTableProps) {
  return (
    <div className="max-w-full overflow-hidden rounded-2xl border border-app-border bg-app-surface">
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow className="border-app-border hover:bg-transparent">
            <TableHead className="text-app-muted">Categoria</TableHead>
            <TableHead className="text-app-muted">Tipo</TableHead>
            <TableHead className="text-app-muted">Relatórios</TableHead>
            <TableHead className="text-app-muted">Ordem</TableHead>
            <TableHead className="text-app-muted">Status</TableHead>
            <TableHead className="w-12 text-app-muted">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              isMutating={isMutating}
              onArchive={onArchive}
              onDelete={onDelete}
              onEdit={onEdit}
              onUnarchive={onUnarchive}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface CategoryRowProps {
  category: Category
  isMutating: boolean
  onEdit: (category: Category) => void
  onArchive: (category: Category) => void
  onUnarchive: (category: Category) => void
  onDelete: (category: Category) => void
}

function CategoryRow({
  category,
  isMutating,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: CategoryRowProps) {
  const fallbackType = category.type === 'INCOME' ? 'INCOME' : 'EXPENSE'
  const Icon = getCategoryIconOption(getCategoryIconKey(category)).icon
  const colorOption = getCategoryColorOption(
    getCategoryColorToken(category),
    fallbackType
  )
  const swatchStyle: CSSProperties = {
    backgroundColor: colorOption.hex,
  }

  return (
    <TableRow
      className={cn(
        'border-app-border hover:bg-app-panel',
        category.isArchived && 'opacity-75'
      )}
    >
      <TableCell className="min-w-72">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-app-text"
            style={swatchStyle}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-app-text">
              {category.displayName}
            </span>
            <span className="block max-w-md truncate text-xs text-app-muted">
              {category.description?.trim() || 'Sem descrição'}
            </span>
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
            categoryTypeTone(category.type)
          )}
        >
          {getCategoryTypeLabel(category.type)}
        </span>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-2 rounded-lg bg-app-panel px-3 py-2 text-xs text-app-muted">
          {category.includeInReports ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-state-info" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-app-muted" />
          )}
          {category.includeInReports
            ? 'Entra nos relatórios'
            : 'Fora dos relatórios'}
        </span>
      </TableCell>
      <TableCell className="numeric text-app-muted">
        {category.sortOrder}
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
            category.isArchived
              ? 'bg-state-warning/10 text-state-warning'
              : 'bg-state-income/10 text-state-income'
          )}
        >
          {category.isArchived ? 'Arquivada' : 'Ativa'}
        </span>
      </TableCell>
      <TableCell>
        <CategoryActionsMenu
          category={category}
          isMutating={isMutating}
          onArchive={() => onArchive(category)}
          onDelete={() => onDelete(category)}
          onEdit={() => onEdit(category)}
          onUnarchive={() => onUnarchive(category)}
        />
      </TableCell>
    </TableRow>
  )
}

interface CategoryActionsMenuProps {
  category: Category
  isMutating: boolean
  onEdit: () => void
  onArchive: () => void
  onUnarchive: () => void
  onDelete: () => void
}

function CategoryActionsMenu({
  category,
  isMutating,
  onArchive,
  onDelete,
  onEdit,
  onUnarchive,
}: CategoryActionsMenuProps) {
  const canManage = canManageCategory(category)
  const canRestore = canRestoreCategory(category)
  const editArchiveDisabled = isMutating || !canManage
  const restoreDisabled = isMutating || !canRestore
  const deleteDisabled = isMutating || !canManage

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-app-muted hover:bg-app-panel hover:text-app-text"
          aria-label={`Abrir ações de ${category.displayName}`}
          title={`Ações de ${category.displayName}`}
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 rounded-2xl border-app-border bg-app-surface p-2 text-app-text"
      >
        <DropdownMenuLabel className="text-xs text-app-muted">
          Ações da categoria
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-app-border" />

        {!category.isArchived ? (
          <DropdownMenuItem
            className="rounded-xl focus:bg-app-elevated focus:text-app-text"
            disabled={editArchiveDisabled}
            onSelect={onEdit}
          >
            <Edit3 className="h-4 w-4" />
            Editar
          </DropdownMenuItem>
        ) : null}

        {category.isArchived ? (
          <DropdownMenuItem
            className="rounded-xl focus:bg-app-elevated focus:text-app-text"
            disabled={restoreDisabled}
            onSelect={onUnarchive}
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="rounded-xl focus:bg-app-elevated focus:text-app-text"
            disabled={editArchiveDisabled}
            onSelect={onArchive}
          >
            <Archive className="h-4 w-4" />
            Arquivar
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-app-border" />
        <DropdownMenuItem
          className="rounded-xl text-destructive focus:bg-destructive/10 focus:text-destructive"
          disabled={deleteDisabled}
          onSelect={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
