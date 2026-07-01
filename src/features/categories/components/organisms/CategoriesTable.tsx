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
    <>
      <div className="hidden max-w-full overflow-hidden rounded-2xl border border-border bg-card md:block">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Categoria</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground">Relatórios</TableHead>
              <TableHead className="text-muted-foreground">Ordem</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="w-12 text-muted-foreground">
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

      <div className="grid gap-3 md:hidden">
        {categories.map((category) => (
          <CategoryMobileItem
            key={category.id}
            category={category}
            isMutating={isMutating}
            onArchive={onArchive}
            onDelete={onDelete}
            onEdit={onEdit}
            onUnarchive={onUnarchive}
          />
        ))}
      </div>
    </>
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

function CategoryMobileItem({
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
    <article
      className={cn(
        'rounded-2xl border border-border bg-card p-4',
        category.isArchived && 'opacity-75'
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-foreground"
            style={swatchStyle}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {category.displayName}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {category.description?.trim() || 'Sem descrição'}
            </p>
          </div>
        </div>

        <CategoryActionsMenu
          category={category}
          isMutating={isMutating}
          onArchive={() => onArchive(category)}
          onDelete={() => onDelete(category)}
          onEdit={() => onEdit(category)}
          onUnarchive={() => onUnarchive(category)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-1 font-medium',
            categoryTypeTone(category.type)
          )}
        >
          {getCategoryTypeLabel(category.type)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">
          {category.includeInReports ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-state-info" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {category.includeInReports
            ? 'Entra nos relatórios'
            : 'Fora dos relatórios'}
        </span>
        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-1 font-medium',
            category.isArchived
              ? 'bg-state-warning/10 text-state-warning'
              : 'bg-state-income/10 text-state-income'
          )}
        >
          {category.isArchived ? 'Arquivada' : 'Ativa'}
        </span>
        <span className="numeric inline-flex rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">
          Ordem {category.sortOrder}
        </span>
      </div>
    </article>
  )
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
        'border-border hover:bg-secondary',
        category.isArchived && 'opacity-75'
      )}
    >
      <TableCell className="min-w-72">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-foreground"
            style={swatchStyle}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-foreground">
              {category.displayName}
            </span>
            <span className="block max-w-md truncate text-xs text-muted-foreground">
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
        <span className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          {category.includeInReports ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-state-info" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {category.includeInReports
            ? 'Entra nos relatórios'
            : 'Fora dos relatórios'}
        </span>
      </TableCell>
      <TableCell className="numeric text-muted-foreground">
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
          className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label={`Abrir ações de ${category.displayName}`}
          title={`Ações de ${category.displayName}`}
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 rounded-2xl border-border bg-card p-2 text-foreground"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Ações da categoria
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />

        {!category.isArchived ? (
          <DropdownMenuItem
            className="rounded-xl focus:bg-accent focus:text-foreground"
            disabled={editArchiveDisabled}
            onSelect={onEdit}
          >
            <Edit3 className="h-4 w-4" />
            Editar
          </DropdownMenuItem>
        ) : null}

        {category.isArchived ? (
          <DropdownMenuItem
            className="rounded-xl focus:bg-accent focus:text-foreground"
            disabled={restoreDisabled}
            onSelect={onUnarchive}
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="rounded-xl focus:bg-accent focus:text-foreground"
            disabled={editArchiveDisabled}
            onSelect={onArchive}
          >
            <Archive className="h-4 w-4" />
            Arquivar
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-border" />
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
