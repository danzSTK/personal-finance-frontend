import { useMemo, useState } from 'react'
import { ArrowRight, Trash2 } from 'lucide-react'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import {
  API_ERROR_CODES,
  isApiErrorCode,
  resolveApiError,
} from '@/shared/errors'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  useDeleteCategory,
  useDeleteCategoryWithMerge,
} from '../../api/mutations'
import { useCategories } from '../../api/queries'
import { CATEGORY_DEFAULT_PAGE } from '../../constants/category.constants'
import type { ManageableCategoryType } from '../../types/category.types'
import type { CategoryDeleteState } from '../../types/category-ui.types'
import {
  getCategoryIconKey,
  getCategoryIconOption,
  getCategoryTypeLabel,
  isManagementType,
} from '../../utils/category.utils'

interface CategoryDeleteDialogsProps {
  state: CategoryDeleteState
  onStateChange: (state: CategoryDeleteState) => void
}

export function CategoryDeleteDialogs({
  state,
  onStateChange,
}: CategoryDeleteDialogsProps) {
  const deleteCategoryMutation = useDeleteCategory()
  const deleteWithMergeMutation = useDeleteCategoryWithMerge()
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null)

  const category = state?.category ?? null
  const targetType: ManageableCategoryType =
    category && isManagementType(category.type) ? category.type : 'EXPENSE'
  const isMergeOpen = state?.mode === 'merge' && category !== null
  const isConfirmOpen = state?.mode === 'confirm' && category !== null
  const deleteError = deleteCategoryMutation.error
    ? resolveApiError(deleteCategoryMutation.error, 'categories.delete')
    : null
  const mergeError = deleteWithMergeMutation.error
    ? resolveApiError(deleteWithMergeMutation.error, 'categories.merge-delete')
    : null

  const { data: targetCategoriesResponse, isLoading: isLoadingTargets } =
    useCategories({
      page: CATEGORY_DEFAULT_PAGE,
      limit: 100,
      type: targetType,
      search: '',
      includeArchived: false,
    })

  const targetCategories = useMemo(
    () =>
      (targetCategoriesResponse?.data ?? []).filter(
        (target) =>
          target.id !== category?.id &&
          !target.isArchived &&
          target.isEditable &&
          target.isVisibleInManagement &&
          target.type === targetType
      ),
    [category?.id, targetCategoriesResponse?.data, targetType]
  )

  const close = () => {
    setTargetCategoryId(null)
    deleteCategoryMutation.reset()
    deleteWithMergeMutation.reset()
    onStateChange(null)
  }

  const handleDelete = () => {
    if (!category) {
      return
    }

    deleteCategoryMutation.mutate(category.id, {
      onSuccess: close,
      onError: (error) => {
        if (isApiErrorCode(error, API_ERROR_CODES.categoryHasTransactions)) {
          deleteCategoryMutation.reset()
          setTargetCategoryId(null)
          onStateChange({ mode: 'merge', category })
        }
      },
    })
  }

  const handleMergeDelete = () => {
    if (!category || !targetCategoryId) {
      return
    }

    deleteWithMergeMutation.mutate(
      {
        categoryId: category.id,
        dto: { targetCategoryId },
      },
      { onSuccess: close }
    )
  }

  return (
    <>
      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            close()
          }
        }}
      >
        <AlertDialogContent className="border-border bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {category
                ? `${category.displayName} será removida se não houver lançamentos vinculados.`
                : 'A categoria será removida se não houver lançamentos vinculados.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? <ApiErrorAlert error={deleteError} /> : null}
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground">
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCategoryMutation.isPending}
              onClick={handleDelete}
            >
              {deleteCategoryMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isMergeOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            close()
          }
        }}
      >
        <DialogContent className="border-border bg-card text-foreground sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Mover lançamentos antes de excluir</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Escolha uma categoria ativa de {getCategoryTypeLabel(targetType)}
              para receber os lançamentos de {category?.displayName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {mergeError ? <ApiErrorAlert error={mergeError} /> : null}
            {isLoadingTargets ? (
              <div className="rounded-2xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
                Carregando categorias disponíveis...
              </div>
            ) : null}

            {!isLoadingTargets && targetCategories.length === 0 ? (
              <div className="rounded-2xl border border-border bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                Nenhuma categoria ativa do mesmo tipo está disponível. Crie ou
                restaure uma categoria antes de excluir esta.
              </div>
            ) : null}

            {targetCategories.map((target) => {
              const Icon = getCategoryIconOption(
                getCategoryIconKey(target)
              ).icon
              const isSelected = targetCategoryId === target.id

              return (
                <button
                  key={target.id}
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                    isSelected
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border bg-secondary text-muted-foreground hover:border-primary/60 hover:bg-accent hover:text-foreground'
                  )}
                  onClick={() => setTargetCategoryId(target.id)}
                  aria-pressed={isSelected}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {target.displayName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {target.description || 'Sem descrição'}
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              )
            })}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
              onClick={close}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={
                !targetCategoryId ||
                deleteWithMergeMutation.isPending ||
                targetCategories.length === 0
              }
              onClick={handleMergeDelete}
            >
              <Trash2 className="h-4 w-4" />
              {deleteWithMergeMutation.isPending
                ? 'Movendo...'
                : 'Mover e excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
