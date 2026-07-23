import { useEffect, useRef, type ReactNode, type Ref } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import {
  ArrowLeftRight,
  HandCoins,
  Plus,
  ReceiptText,
  Tags,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface MobileQuickActionsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateIncome: () => void
  onCreateExpense: () => void
  onCreateTransfer: () => void
  onCreateCategory: () => void
}

type QuickActionTone = 'income' | 'expense' | 'info' | 'brand'

const quickActionToneClasses: Record<QuickActionTone, string> = {
  income:
    'border-state-income/25 bg-app-elevated text-state-income group-hover:bg-state-income/15',
  expense:
    'border-state-expense/25 bg-app-elevated text-state-expense group-hover:bg-state-expense/15',
  info:
    'border-state-info/25 bg-app-elevated text-state-info group-hover:bg-state-info/15',
  brand:
    'border-brand/25 bg-app-elevated text-brand group-hover:bg-brand-soft',
}

export function MobileQuickActions({
  open,
  onOpenChange,
  onCreateIncome,
  onCreateExpense,
  onCreateTransfer,
  onCreateCategory,
}: MobileQuickActionsProps) {
  const incomeActionRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => {
      if (desktopQuery.matches) {
        onOpenChange(false)
      }
    }

    closeOnDesktop()
    desktopQuery.addEventListener('change', closeOnDesktop)

    return () => desktopQuery.removeEventListener('change', closeOnDesktop)
  }, [onOpenChange])

  const selectAction = (action: () => void) => {
    onOpenChange(false)
    action()
  }

  return (
    <PopoverPrimitive.Root modal open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            'relative z-10 mx-auto -mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/25 transition-[transform,background-color,box-shadow] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-brand-intense focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:transition-none',
            open && 'scale-105 bg-brand-intense shadow-xl shadow-brand/40'
          )}
          aria-label={open ? 'Fechar atalhos' : 'Abrir atalhos para adicionar'}
          aria-expanded={open}
        >
          <Plus
            className={cn(
              'h-7 w-7 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
              open && 'rotate-45 scale-95'
            )}
            aria-hidden
          />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Close asChild>
          <button
            type="button"
            tabIndex={-1}
            className="fixed inset-0 z-50 bg-app-bg/85 backdrop-blur-sm duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none lg:hidden"
            aria-label="Fechar atalhos"
          />
        </PopoverPrimitive.Close>
      </PopoverPrimitive.Portal>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          sideOffset={24}
          collisionPadding={16}
          className="z-[70] w-[min(calc(100vw-2rem),22rem)] border-0 bg-transparent p-0 shadow-none outline-hidden duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-3 data-[state=open]:zoom-in-95 motion-reduce:animate-none lg:hidden"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            incomeActionRef.current?.focus()
          }}
          role="menu"
          aria-label="Atalhos para adicionar"
        >
          <div className="grid grid-cols-6 grid-rows-2 gap-y-4">
            <QuickActionButton
              buttonRef={incomeActionRef}
              label="Receita"
              icon={<HandCoins className="h-7 w-7" />}
              tone="income"
              placementClassName="col-span-2 col-start-2 row-start-1"
              onClick={() => selectAction(onCreateIncome)}
            />
            <QuickActionButton
              label="Despesa"
              icon={<ReceiptText className="h-7 w-7" />}
              tone="expense"
              placementClassName="col-span-2 col-start-4 row-start-1"
              onClick={() => selectAction(onCreateExpense)}
            />
            <QuickActionButton
              label="Transferência"
              icon={<ArrowLeftRight className="h-7 w-7" />}
              tone="info"
              placementClassName="col-span-2 col-start-1 row-start-2"
              onClick={() => selectAction(onCreateTransfer)}
            />
            <QuickActionButton
              label="Nova categoria"
              description="de despesa"
              icon={<Tags className="h-7 w-7" />}
              tone="brand"
              placementClassName="col-span-2 col-start-5 row-start-2"
              onClick={() => selectAction(onCreateCategory)}
            />
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

interface QuickActionButtonProps {
  label: string
  description?: string
  icon: ReactNode
  tone: QuickActionTone
  placementClassName: string
  buttonRef?: Ref<HTMLButtonElement>
  disabled?: boolean
  onClick?: () => void
}

function QuickActionButton({
  label,
  description,
  icon,
  tone,
  placementClassName,
  buttonRef,
  disabled = false,
  onClick,
}: QuickActionButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="menuitem"
      className={cn(
        'group flex min-h-24 min-w-0 flex-col items-center justify-start gap-2 rounded-2xl px-1 py-1 text-center text-app-text transition duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg disabled:cursor-not-allowed disabled:opacity-55',
        placementClassName
      )}
      disabled={disabled}
      onClick={onClick}
      aria-label={description ? `${label}, ${description}` : label}
    >
      <span
        className={cn(
          'inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full border shadow-lg shadow-app-bg/30 transition-transform group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 group-disabled:transform-none',
          quickActionToneClasses[tone]
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[11px] font-medium text-app-muted">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  )
}
