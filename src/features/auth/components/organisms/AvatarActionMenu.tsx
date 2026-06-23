import {
  forwardRef,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import { Camera, ImagePlus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/lib/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/components/ui/drawer'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { cn } from '@/shared/lib/utils'

interface AvatarActionMenuProps {
  avatarUrl: string | null
  displayName: string
  initials: string
  hasAvatar: boolean
  isDisabled: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onChooseFile: () => void
  onOpenCamera: () => void
  onRequestRemove: () => void
}

export const AvatarActionMenu = ({
  avatarUrl,
  displayName,
  initials,
  hasAvatar,
  isDisabled,
  isOpen,
  onOpenChange,
  onChooseFile,
  onOpenCamera,
  onRequestRemove,
}: AvatarActionMenuProps) => {
  const isDesktop = useIsDesktop()

  const handleAction = (action: () => void) => {
    onOpenChange(false)
    action()
  }

  if (isDesktop) {
    return (
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <AvatarEditTrigger
            avatarUrl={avatarUrl}
            displayName={displayName}
            initials={initials}
            isDisabled={isDisabled}
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-72 rounded-2xl border-app-border bg-app-surface p-2 text-app-text shadow-lg shadow-app-bg/30"
        >
          <div className="px-2 py-2">
            <p className="text-sm font-semibold text-app-text">
              Foto de perfil
            </p>
            <p className="mt-1 text-xs text-app-muted">
              Atualize a imagem exibida no seu perfil.
            </p>
          </div>
          <AvatarActionList
            hasAvatar={hasAvatar}
            isDisabled={isDisabled}
            onChooseFile={() => handleAction(onChooseFile)}
            onOpenCamera={() => handleAction(onOpenCamera)}
            onRequestRemove={() => handleAction(onRequestRemove)}
            isCompact
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <AvatarEditTrigger
          avatarUrl={avatarUrl}
          displayName={displayName}
          initials={initials}
          isDisabled={isDisabled}
        />
      </DrawerTrigger>
      <DrawerContent className="border-app-border bg-app-surface text-app-text">
        <DrawerHeader className="text-left">
          <DrawerTitle>Foto de perfil</DrawerTitle>
          <DrawerDescription className="text-app-muted">
            Escolha como deseja atualizar sua foto.
          </DrawerDescription>
        </DrawerHeader>

        <AvatarActionList
          hasAvatar={hasAvatar}
          isDisabled={isDisabled}
          onChooseFile={() => handleAction(onChooseFile)}
          onOpenCamera={() => handleAction(onOpenCamera)}
          onRequestRemove={() => handleAction(onRequestRemove)}
        />

        <DrawerFooter>
          <DrawerClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-app-border bg-app-panel text-app-text hover:bg-app-elevated hover:text-app-text"
            >
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const handleChange = () => setIsDesktop(mediaQuery.matches)

    handleChange()
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isDesktop
}

interface AvatarEditTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  avatarUrl: string | null
  displayName: string
  initials: string
  isDisabled: boolean
}

const AvatarEditTrigger = forwardRef<HTMLButtonElement, AvatarEditTriggerProps>(
  (
    {
      avatarUrl,
      displayName,
      initials,
      isDisabled,
      className,
      ...buttonProps
    },
    ref
  ) => (
  <button
    ref={ref}
    type="button"
    {...buttonProps}
    className={cn(
      'group flex flex-col items-center gap-2 rounded-2xl p-1 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface disabled:cursor-not-allowed disabled:opacity-60',
      className
    )}
    disabled={isDisabled}
    aria-label="Editar foto de perfil"
    title="Editar foto de perfil"
  >
    <span className="relative">
      <Avatar className="h-20 w-20 border border-app-border md:h-16 md:w-16">
        {avatarUrl ? (
          <AvatarImage
            src={avatarUrl}
            alt={`Foto de perfil de ${displayName}`}
            className="object-cover"
          />
        ) : null}
        <AvatarFallback className="bg-brand/20 text-xl font-semibold text-brand-soft md:text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-app-border bg-brand text-brand-foreground shadow-md shadow-app-bg/30 transition group-hover:bg-brand-intense">
        <Pencil className="h-3.5 w-3.5" />
      </span>
    </span>
    <span className="text-xs font-medium text-brand-soft">Editar</span>
  </button>
  )
)
AvatarEditTrigger.displayName = 'AvatarEditTrigger'

interface AvatarActionListProps {
  hasAvatar: boolean
  isDisabled: boolean
  isCompact?: boolean
  onChooseFile: () => void
  onOpenCamera: () => void
  onRequestRemove: () => void
}

const AvatarActionList = ({
  hasAvatar,
  isDisabled,
  isCompact = false,
  onChooseFile,
  onOpenCamera,
  onRequestRemove,
}: AvatarActionListProps) => (
  <div className={cn('space-y-2 px-4 md:px-0', isCompact && 'space-y-1')}>
    <AvatarActionButton
      icon={<ImagePlus className="h-4 w-4" />}
      label="Alterar foto"
      onClick={onChooseFile}
      disabled={isDisabled}
    />
    <AvatarActionButton
      icon={<Camera className="h-4 w-4" />}
      label="Tirar foto agora"
      onClick={onOpenCamera}
      disabled={isDisabled}
    />
    {hasAvatar ? (
      <AvatarActionButton
        icon={<Trash2 className="h-4 w-4" />}
        label="Remover foto"
        onClick={onRequestRemove}
        disabled={isDisabled}
        isDestructive
      />
    ) : null}
  </div>
)

interface AvatarActionButtonProps {
  icon: ReactNode
  label: string
  disabled: boolean
  isDestructive?: boolean
  onClick: () => void
}

const AvatarActionButton = ({
  icon,
  label,
  disabled,
  isDestructive = false,
  onClick,
}: AvatarActionButtonProps) => (
  <Button
    type="button"
    variant="ghost"
    className={cn(
      'h-12 w-full justify-start gap-3 rounded-xl bg-app-panel text-app-text hover:bg-app-elevated hover:text-app-text',
      isDestructive &&
        'text-destructive hover:bg-destructive/10 hover:text-destructive'
    )}
    onClick={onClick}
    disabled={disabled}
  >
    {icon}
    {label}
  </Button>
)
