import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Check, Ellipsis } from 'lucide-react'
import { Button } from '@/shared/lib/button'
import { Input } from '@/shared/lib/input'
import { cn } from '@/shared/lib/utils'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import {
  useCreateCategory,
  useUpdateCategory,
} from '../../api/mutations'
import { useCategoryMetadata } from '../../api/queries'
import {
  mergeCategoryColorMetadata,
  mergeCategoryIconMetadata,
} from '../../constants/category.constants'
import {
  type CategoryFormValues,
  categoryFormSchema,
} from '../../schemas/category.schema'
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../types/category.types'
import type { CategorySheetState } from '../../types/category-ui.types'
import {
  getCategoryColorOption,
  getCategoryColorToken,
  getCategoryIconKey,
  getCategoryIconOption,
  getDefaultCategoryColor,
  getDefaultCategoryIcon,
} from '../../utils/category.utils'
import { CategoryFormField } from '../molecules/CategoryFormField'

interface CategoryFormSheetProps {
  state: CategorySheetState
  onOpenChange: (isOpen: boolean) => void
}

const inputClassName =
  'h-11 rounded-xl border-app-border bg-app-panel text-app-text placeholder:text-app-muted focus-visible:ring-brand focus-visible:ring-offset-app-panel'

const VISIBLE_METADATA_OPTIONS = 5

export function CategoryFormSheet({
  state,
  onOpenChange,
}: CategoryFormSheetProps) {
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const { data: categoryMetadata } = useCategoryMetadata()
  const isOpen = state !== null
  const isEditing = state?.mode === 'edit'
  const isPending =
    createCategoryMutation.isPending || updateCategoryMutation.isPending

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: getCategoryFormDefaults(state),
  })

  useEffect(() => {
    if (!state) {
      return
    }

    form.reset(getCategoryFormDefaults(state))
  }, [form, state])

  const selectedColor = form.watch('color')
  const selectedIcon = form.watch('icon')
  const colorOptions = mergeCategoryColorMetadata(categoryMetadata?.colors)
  const iconOptions = mergeCategoryIconMetadata(categoryMetadata?.icons)
  const visibleColorOptions = colorOptions.slice(0, VISIBLE_METADATA_OPTIONS)
  const overflowColorOptions = colorOptions.slice(VISIBLE_METADATA_OPTIONS)
  const visibleIconOptions = iconOptions.slice(0, VISIBLE_METADATA_OPTIONS)
  const overflowIconOptions = iconOptions.slice(VISIBLE_METADATA_OPTIONS)
  const isSelectedColorInOverflow = overflowColorOptions.some(
    (option) => option.value === selectedColor
  )
  const isSelectedIconInOverflow = overflowIconOptions.some(
    (option) => option.value === selectedIcon
  )

  const setColor = (value: string) =>
    form.setValue('color', value, {
      shouldDirty: true,
      shouldValidate: true,
    })

  const setIcon = (value: string) =>
    form.setValue('icon', value, {
      shouldDirty: true,
      shouldValidate: true,
    })

  const handleSubmit = form.handleSubmit((values) => {
    if (state?.mode === 'edit') {
      const dto: UpdateCategoryDto = {
        displayName: values.displayName,
        description: values.description ?? null,
        colorToken: values.color ?? null,
        iconKey: values.icon ?? null,
        includeInReports: values.includeInReports,
        sortOrder: values.sortOrder,
      }

      updateCategoryMutation.mutate(
        { categoryId: state.category.id, dto },
        { onSuccess: () => onOpenChange(false) }
      )
      return
    }

    if (state?.mode === 'create') {
      const dto: CreateCategoryDto = {
        displayName: values.displayName,
        type: state.type,
        description: values.description ?? null,
        colorToken: values.color ?? null,
        iconKey: values.icon ?? null,
        includeInReports: values.includeInReports,
        sortOrder: values.sortOrder,
      }

      createCategoryMutation.mutate(dto, {
        onSuccess: () => onOpenChange(false),
      })
    }
  })

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-app-border bg-app-surface text-app-text sm:max-w-xl">
        <SheetHeader className="pr-8 text-left">
          <SheetTitle className="text-app-text">
            {isEditing ? 'Editar categoria' : 'Nova categoria'}
          </SheetTitle>
          <SheetDescription className="text-app-muted">
            {isEditing
              ? 'Atualize nome, visual e participação nos relatórios.'
              : 'Organize lançamentos com uma categoria clara e fácil de encontrar.'}
          </SheetDescription>
        </SheetHeader>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <CategoryFormField
            label="Nome"
            error={form.formState.errors.displayName?.message}
          >
            <Input
              className={inputClassName}
              placeholder="Ex.: Alimentação, Salário, Mercado"
              {...form.register('displayName')}
            />
          </CategoryFormField>

          <CategoryFormField
            label="Descrição"
            error={form.formState.errors.description?.message}
          >
            <Textarea
              className="min-h-24 rounded-xl border-app-border bg-app-panel text-app-text placeholder:text-app-muted focus-visible:ring-brand focus-visible:ring-offset-app-panel"
              placeholder="Opcional. Use para explicar quando usar esta categoria."
              {...form.register('description')}
            />
          </CategoryFormField>

          <CategoryFormField label="Cor">
            <div className="grid grid-cols-6 gap-2">
              {visibleColorOptions.map((option) => {
                const isSelected = selectedColor === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      'flex h-12 items-center justify-center rounded-2xl border transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-panel',
                      isSelected
                        ? 'border-brand bg-brand/15'
                        : 'border-app-border bg-app-panel hover:border-brand/60 hover:bg-app-elevated'
                    )}
                    onClick={() => setColor(option.value)}
                    aria-label={`Cor ${option.label}`}
                    aria-pressed={isSelected}
                    title={option.label}
                  >
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: option.hex }}
                      aria-hidden
                    >
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 text-app-text" />
                      ) : null}
                    </span>
                  </button>
                )
              })}

              {overflowColorOptions.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn(
                        'h-12 w-full rounded-2xl border-app-border bg-app-panel text-app-muted hover:border-brand/60 hover:bg-app-elevated hover:text-app-text',
                        isSelectedColorInOverflow &&
                          'border-brand bg-brand/15 text-app-text'
                      )}
                      aria-label="Mais cores"
                      title="Mais cores"
                    >
                      <Ellipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 rounded-2xl border-app-border bg-app-surface p-2 text-app-text"
                  >
                    <DropdownMenuLabel className="text-xs text-app-muted">
                      Outras cores
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-app-border" />
                    <div className="grid grid-cols-2 gap-1">
                      {overflowColorOptions.map((option) => {
                        const isSelected = selectedColor === option.value

                        return (
                          <DropdownMenuItem
                            key={option.value}
                            className="rounded-xl focus:bg-app-elevated focus:text-app-text"
                            onSelect={() => setColor(option.value)}
                            title={option.label}
                          >
                            <span
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: option.hex }}
                              aria-hidden
                            />
                            <span className="min-w-0 truncate">
                              {option.label}
                            </span>
                            {isSelected ? (
                              <Check className="ml-auto h-3.5 w-3.5" />
                            ) : null}
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </CategoryFormField>

          <CategoryFormField label="Ícone">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {visibleIconOptions.map((option) => {
                const Icon = option.icon
                const isSelected = selectedIcon === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      'flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-panel',
                      isSelected
                        ? 'border-brand bg-brand/15 text-app-text'
                        : 'border-app-border bg-app-panel text-app-muted hover:border-brand/60 hover:bg-app-elevated hover:text-app-text'
                    )}
                    onClick={() => setIcon(option.value)}
                    aria-pressed={isSelected}
                    title={option.label}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                )
              })}

              {overflowIconOptions.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'flex min-h-11 w-full justify-center rounded-2xl border-app-border bg-app-panel px-3 py-2 text-app-muted hover:border-brand/60 hover:bg-app-elevated hover:text-app-text',
                        isSelectedIconInOverflow &&
                          'border-brand bg-brand/15 text-app-text'
                      )}
                      aria-label="Mais ícones"
                      title="Mais ícones"
                    >
                      <Ellipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-72 rounded-2xl border-app-border bg-app-surface p-2 text-app-text"
                  >
                    <DropdownMenuLabel className="text-xs text-app-muted">
                      Outros ícones
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-app-border" />
                    <div className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
                      {overflowIconOptions.map((option) => {
                        const Icon = option.icon
                        const isSelected = selectedIcon === option.value

                        return (
                          <DropdownMenuItem
                            key={option.value}
                            className="rounded-xl focus:bg-app-elevated focus:text-app-text"
                            onSelect={() => setIcon(option.value)}
                            title={option.label}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="min-w-0 truncate">
                              {option.label}
                            </span>
                            {isSelected ? (
                              <Check className="ml-auto h-3.5 w-3.5" />
                            ) : null}
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </CategoryFormField>

          <CategoryFormField
            label="Ordem"
            error={form.formState.errors.sortOrder?.message}
          >
            <Input
              className={cn(inputClassName, 'numeric')}
              inputMode="numeric"
              placeholder="0"
              {...form.register('sortOrder')}
            />
          </CategoryFormField>

          <label className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-panel p-4 transition hover:border-state-info/50 hover:bg-app-elevated has-[:checked]:border-state-info has-[:checked]:bg-state-info/10">
            <input
              type="checkbox"
              className="peer sr-only"
              {...form.register('includeInReports')}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-app-text">
                Incluir nos relatórios
              </span>
              <span className="block text-xs leading-5 text-app-muted">
                Use esta categoria em análises e resumos financeiros.
              </span>
            </span>
            <span
              className="relative inline-flex h-7 w-12 shrink-0 rounded-full border border-app-border bg-app-surface transition after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-app-muted after:transition peer-checked:border-state-info peer-checked:bg-state-info peer-checked:after:translate-x-5 peer-checked:after:bg-app-text"
              aria-hidden
            />
          </label>

          <SheetFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-app-border bg-app-panel text-app-text hover:bg-app-elevated hover:text-app-text"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-xl bg-brand px-4 text-brand-foreground hover:bg-brand-intense"
              disabled={isPending}
            >
              {isPending ? 'Salvando...' : 'Salvar categoria'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

const getCategoryFormDefaults = (
  state: CategorySheetState
): CategoryFormValues => {
  if (state?.mode === 'edit') {
    const type = state.category.type === 'INCOME' ? 'INCOME' : 'EXPENSE'
    const colorOption = getCategoryColorOption(
      getCategoryColorToken(state.category),
      type
    )
    const iconOption = getCategoryIconOption(getCategoryIconKey(state.category))

    return {
      displayName: state.category.displayName,
      description: state.category.description ?? null,
      color: colorOption.value,
      icon: iconOption.value,
      includeInReports: state.category.includeInReports,
      sortOrder: state.category.sortOrder,
    }
  }

  const type = state?.mode === 'create' ? state.type : 'EXPENSE'

  return {
    displayName: '',
    description: null,
    color: getDefaultCategoryColor(type),
    icon: getDefaultCategoryIcon(type),
    includeInReports: true,
    sortOrder: 0,
  }
}
