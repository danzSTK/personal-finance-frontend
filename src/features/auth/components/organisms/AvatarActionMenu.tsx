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
          className="w-72 rounded-2xl border-border bg-card p-2 text-foreground shadow-lg shadow-background/30"
        >
          <div className="px-2 py-2">
            <p className="text-sm font-semibold text-foreground">
              Foto de perfil
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
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
      <DrawerContent className="border-border bg-card text-foreground">
        <DrawerHeader className="text-left">
          <DrawerTitle>Foto de perfil</DrawerTitle>
          <DrawerDescription className="text-muted-foreground">
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
              className="h-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
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
      'group flex flex-col items-center gap-2 rounded-2xl p-1 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-60',
      className
    )}
    disabled={isDisabled}
    aria-label="Editar foto de perfil"
    title="Editar foto de perfil"
  >
    <span className="relative">
      <Avatar className="h-20 w-20 border border-border md:h-16 md:w-16">
        {avatarUrl ? (
          <AvatarImage
            src={avatarUrl}
            alt={`Foto de perfil de ${displayName}`}
            className="object-cover"
          />
        ) : null}
        <AvatarFallback className="bg-primary/20 text-xl font-semibold text-primary md:text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-md shadow-background/30 transition group-hover:bg-primary/90">
        <Pencil className="h-3.5 w-3.5" />
      </span>
    </span>
    <span className="text-xs font-medium text-primary">Editar</span>
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
      'h-12 w-full justify-start gap-3 rounded-xl bg-secondary text-foreground hover:bg-accent hover:text-foreground',
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
