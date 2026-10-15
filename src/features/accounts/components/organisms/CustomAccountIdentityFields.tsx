import { Check, Ellipsis } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import {
  ACCOUNT_COLOR_OPTIONS,
  ACCOUNT_ICON_OPTIONS,
} from '../../constants/account.constants'
import type { AccountFormValues } from '../../schemas/account.schema'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import { AccountFormField } from '../molecules/AccountFormField'

interface CustomAccountIdentityFieldsProps {
  form: UseFormReturn<AccountFormValues>
}

const VISIBLE_METADATA_OPTIONS = 5

export function CustomAccountIdentityFields({
  form,
}: CustomAccountIdentityFieldsProps) {
  const selectedColor = form.watch('colorToken')
  const selectedIcon = form.watch('iconKey')
  const visibleColors = ACCOUNT_COLOR_OPTIONS.slice(0, VISIBLE_METADATA_OPTIONS)
  const extraColors = ACCOUNT_COLOR_OPTIONS.slice(VISIBLE_METADATA_OPTIONS)
  const visibleIcons = ACCOUNT_ICON_OPTIONS.slice(0, VISIBLE_METADATA_OPTIONS)
  const extraIcons = ACCOUNT_ICON_OPTIONS.slice(VISIBLE_METADATA_OPTIONS)

  return (
    <>
      <AccountFormField
        label="Cor"
        error={form.formState.errors.colorToken?.message}
      >
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Cor da conta"
        >
          {visibleColors.map((option) => (
            <ColorOptionButton
              key={option.key}
              option={option}
              isSelected={selectedColor === option.value}
              onSelect={() =>
                form.setValue('colorToken', option.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  'h-11 w-11 rounded-xl border-app-border bg-app-panel text-app-muted hover:bg-app-elevated hover:text-app-text',
                  extraColors.some(
                    (option) => option.value === selectedColor
                  ) && 'border-brand text-brand ring-2 ring-brand/30'
                )}
                aria-label="Outras cores"
              >
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-72 w-64 overflow-y-auto border-app-border bg-app-surface text-app-text">
              <DropdownMenuLabel className="text-xs text-app-muted">
                Outras cores
              </DropdownMenuLabel>
              {extraColors.map((option) => (
                <DropdownMenuItem
                  key={option.key}
                  className="gap-3 focus:bg-app-elevated focus:text-app-text"
                  onSelect={() =>
                    form.setValue('colorToken', option.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <span
                    className={cn(
                      'h-5 w-5 rounded-full',
                      option.backgroundClass
                    )}
                    aria-hidden="true"
                  />
                  <span>{option.label}</span>
                  {selectedColor === option.value ? (
                    <Check className="ml-auto h-4 w-4 text-brand" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </AccountFormField>

      <AccountFormField
        label="Ícone"
        error={form.formState.errors.iconKey?.message}
      >
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Ícone da conta"
        >
          {visibleIcons.map((option) => {
            const Icon = option.icon
            const isSelected = selectedIcon === option.value

            return (
              <Button
                key={option.key}
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  'h-11 w-11 rounded-xl border-app-border bg-app-panel text-app-muted hover:bg-app-elevated hover:text-app-text',
                  isSelected && 'border-brand text-brand ring-2 ring-brand/30'
                )}
                onClick={() =>
                  form.setValue('iconKey', option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                aria-label={option.label}
                aria-pressed={isSelected}
              >
                <Icon className="h-5 w-5" />
              </Button>
            )
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  'h-11 w-11 rounded-xl border-app-border bg-app-panel text-app-muted hover:bg-app-elevated hover:text-app-text',
                  extraIcons.some((option) => option.value === selectedIcon) &&
                    'border-brand text-brand ring-2 ring-brand/30'
                )}
                aria-label="Outros ícones"
              >
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 border-app-border bg-app-surface text-app-text">
              <DropdownMenuLabel className="text-xs text-app-muted">
                Outros ícones
              </DropdownMenuLabel>
              {extraIcons.map((option) => {
                const Icon = option.icon
                return (
                  <DropdownMenuItem
                    key={option.key}
                    className="gap-3 focus:bg-app-elevated focus:text-app-text"
                    onSelect={() =>
                      form.setValue('iconKey', option.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                    {selectedIcon === option.value ? (
                      <Check className="ml-auto h-4 w-4 text-brand" />
                    ) : null}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </AccountFormField>
    </>
  )
}

interface ColorOptionButtonProps {
  option: (typeof ACCOUNT_COLOR_OPTIONS)[number]
  isSelected: boolean
  onSelect: () => void
}

function ColorOptionButton({
  option,
  isSelected,
  onSelect,
}: ColorOptionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-app-border bg-app-panel transition hover:bg-app-elevated focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand',
        isSelected && 'border-brand ring-2 ring-brand/30'
      )}
      onClick={onSelect}
      aria-label={option.label}
      aria-pressed={isSelected}
    >
      <span
        className={cn('h-6 w-6 rounded-full', option.backgroundClass)}
        aria-hidden="true"
      />
    </button>
  )
}
