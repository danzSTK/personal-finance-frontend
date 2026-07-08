import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AtSign, CheckCircle2, Loader2, Mail, Pencil, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/shared/lib/card'
import { Button } from '@/shared/lib/button'
import {
  AlertDialog,
  AlertDialogAction,
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
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { applyApiFieldErrors, resolveApiError } from '@/shared/errors'
import { API_ERROR_CODES } from '@/shared/errors/apiErrorCodes'
import { toast } from '@/shared/hooks/use-toast'
import { FormField } from '../molecules'
import { useUser, useUsernameAvailability } from '../../api/queries'
import {
  useRemoveUserAvatar,
  useUpdateProfile,
  useUpdateUsername,
  useUpdateUserAvatar,
} from '../../api/mutations'
import {
  updateProfileSchema,
  updateUsernameSchema,
  type UpdateProfileFormData,
  type UpdateUsernameFormData,
} from '../../utils/validation'
import { getUserInitials, resolveUserFullName } from '../../utils/user'
import {
  AVATAR_FILE_ACCEPT,
  validateAvatarFile,
} from '../../utils/avatarCrop'
import { AvatarActionMenu } from './AvatarActionMenu'
import { AvatarCameraDialog } from './AvatarCameraDialog'
import { AvatarCropDialog } from './AvatarCropDialog'
import type { UpdateProfileDto, User } from '../../types'

const USERNAME_AVAILABILITY_DEBOUNCE_MS = 700
const USERNAME_RATE_LIMIT_LOCK_MS = 10 * 60 * 1000

export const AccountProfileForm = () => {
  const { data: user, isLoading } = useUser()
  const updateProfileMutation = useUpdateProfile()
  const updateUsernameMutation = useUpdateUsername()
  const resetUsernameMutation = updateUsernameMutation.reset
  const updateAvatarMutation = useUpdateUserAvatar()
  const removeAvatarMutation = useRemoveUserAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const captureInputRef = useRef<HTMLInputElement>(null)
  const selectedImageUrlRef = useRef<string | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [avatarSelectionError, setAvatarSelectionError] = useState<
    string | null
  >(null)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isRemoveAvatarOpen, setIsRemoveAvatarOpen] = useState(false)
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false)
  const [debouncedUsername, setDebouncedUsername] = useState('')
  const [usernameLockedUntil, setUsernameLockedUntil] = useState<number | null>(
    null
  )
  const [usernameLockNow, setUsernameLockNow] = useState(() => Date.now())

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: getProfileFormDefaults(user),
  })
  const usernameForm = useForm<UpdateUsernameFormData>({
    resolver: zodResolver(updateUsernameSchema),
    mode: 'onChange',
    defaultValues: getUsernameFormDefaults(user),
  })
  const resetForm = form.reset
  const resetUsernameForm = usernameForm.reset
  const { isDirty } = form.formState
  const {
    formState: {
      errors: usernameFormErrors,
      isDirty: isUsernameFormDirty,
    },
    setError: setUsernameError,
    setFocus: setUsernameFocus,
  } = usernameForm
  const usernameValue = usernameForm.watch('username')
  const currentUsername = normalizeUsername(user?.userName ?? '')
  const normalizedUsername = normalizeUsername(usernameValue)
  const isUsernameChanged =
    normalizedUsername.length > 0 && normalizedUsername !== currentUsername
  const isDebouncedUsernameValid = updateUsernameSchema.safeParse({
    username: debouncedUsername,
  }).success
  const shouldCheckUsernameAvailability =
    isUsernameDialogOpen && isUsernameChanged && isDebouncedUsernameValid
  const usernameAvailabilityQuery = useUsernameAvailability(
    debouncedUsername,
    shouldCheckUsernameAvailability
  )
  const isUsernameAvailabilitySettledForInput =
    debouncedUsername === normalizedUsername
  const isUsernameAvailabilityConfirmed =
    isUsernameAvailabilitySettledForInput &&
    usernameAvailabilityQuery.data?.available === true
  const isUsernameAvailabilityUnavailable =
    isUsernameAvailabilitySettledForInput &&
    usernameAvailabilityQuery.data?.available === false
  const isUsernameAvailabilityChecking =
    shouldCheckUsernameAvailability &&
    (!isUsernameAvailabilitySettledForInput ||
      usernameAvailabilityQuery.isFetching)
  const usernameLockRemainingMs = usernameLockedUntil
    ? Math.max(usernameLockedUntil - usernameLockNow, 0)
    : 0
  const usernameAvailabilityError =
    shouldCheckUsernameAvailability && usernameAvailabilityQuery.isError
      ? 'Não foi possível verificar a disponibilidade agora.'
      : undefined
  const usernameFieldError =
    usernameFormErrors.username?.message ??
    (isUsernameAvailabilityUnavailable
      ? 'Este nome de usuário já está em uso.'
      : usernameAvailabilityError)
  const usernameHelperText = getUsernameHelperText({
    isChanged: isUsernameChanged,
    isChecking: isUsernameAvailabilityChecking,
    isAvailable: isUsernameAvailabilityConfirmed,
    isUnavailable: isUsernameAvailabilityUnavailable,
    lockRemainingMs: usernameLockRemainingMs,
  })
  const canSubmitUsername =
    isUsernameFormDirty &&
    isUsernameChanged &&
    isUsernameAvailabilityConfirmed &&
    usernameLockRemainingMs === 0 &&
    !updateUsernameMutation.isPending

  const revokeSelectedImageUrl = useCallback(() => {
    const objectUrl = selectedImageUrlRef.current

    if (!objectUrl) {
      return
    }

    URL.revokeObjectURL(objectUrl)
    selectedImageUrlRef.current = null
  }, [])

  useEffect(() => {
    if (!user) {
      return
    }

    resetForm(getProfileFormDefaults(user))
    resetUsernameForm(getUsernameFormDefaults(user))
  }, [resetForm, resetUsernameForm, user])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedUsername(normalizedUsername)
    }, USERNAME_AVAILABILITY_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [normalizedUsername])

  useEffect(() => {
    if (!usernameLockedUntil) {
      return
    }

    const intervalId = window.setInterval(() => {
      setUsernameLockNow(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [usernameLockedUntil])

  useEffect(() => {
    if (usernameLockedUntil && usernameLockRemainingMs === 0) {
      setUsernameLockedUntil(null)
    }
  }, [usernameLockedUntil, usernameLockRemainingMs])

  useEffect(() => {
    if (!isUsernameDialogOpen || !user) {
      return
    }

    resetUsernameForm(getUsernameFormDefaults(user))
    resetUsernameMutation()
  }, [isUsernameDialogOpen, resetUsernameForm, resetUsernameMutation, user])

  useEffect(
    () => () => {
      revokeSelectedImageUrl()
    },
    [revokeSelectedImageUrl]
  )

  const errorPresentation = useMemo(
    () =>
      updateProfileMutation.error
        ? resolveApiError(updateProfileMutation.error, 'user.profile.update')
        : null,
    [updateProfileMutation.error]
  )

  const usernameErrorPresentation = useMemo(
    () =>
      updateUsernameMutation.error
        ? resolveApiError(updateUsernameMutation.error, 'user.username.update')
        : null,
    [updateUsernameMutation.error]
  )

  const avatarUpdateError = useMemo(
    () =>
      updateAvatarMutation.error
        ? resolveApiError(updateAvatarMutation.error, 'user.avatar.update')
        : null,
    [updateAvatarMutation.error]
  )

  const avatarRemoveError = useMemo(
    () =>
      removeAvatarMutation.error
        ? resolveApiError(removeAvatarMutation.error, 'user.avatar.remove')
        : null,
    [removeAvatarMutation.error]
  )

  useEffect(() => {
    if (!errorPresentation) {
      return
    }

    applyApiFieldErrors<UpdateProfileFormData>({
      fieldErrors: errorPresentation.fieldErrors,
      fieldMap: {
        firstName: 'firstName',
        lastName: 'lastName',
      },
      setError: form.setError,
      setFocus: form.setFocus,
    })
  }, [errorPresentation, form.setError, form.setFocus])

  useEffect(() => {
    if (!usernameErrorPresentation) {
      return
    }

    applyApiFieldErrors<UpdateUsernameFormData>({
      fieldErrors: usernameErrorPresentation.fieldErrors,
      fieldMap: {
        username: 'username',
        userName: 'username',
      },
      setError: setUsernameError,
      setFocus: setUsernameFocus,
    })

    if (
      usernameErrorPresentation.code === API_ERROR_CODES.usernameAlreadyExists
    ) {
      setUsernameError('username', {
        type: 'server',
        message: 'Este nome de usuário já está em uso.',
      })
      setUsernameFocus('username')
    }

    if (
      usernameErrorPresentation.code === API_ERROR_CODES.invalidUsernameFormat
    ) {
      setUsernameError('username', {
        type: 'server',
        message: 'Use apenas letras, números, _ ou -.',
      })
      setUsernameFocus('username')
    }

    if (
      usernameErrorPresentation.code === API_ERROR_CODES.tooManyRequests ||
      usernameErrorPresentation.statusCode === 429
    ) {
      setUsernameLockedUntil(Date.now() + USERNAME_RATE_LIMIT_LOCK_MS)
    }
  }, [
    usernameErrorPresentation,
    setUsernameError,
    setUsernameFocus,
  ])

  const handleChooseAvatar = () => {
    setAvatarSelectionError(null)
    fileInputRef.current?.click()
  }

  const handleChooseCameraFallback = () => {
    setAvatarSelectionError(null)
    captureInputRef.current?.click()
  }

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    handleAvatarFile(file)
  }

  const handleAvatarFile = (file: File) => {
    const validation = validateAvatarFile(file)

    if (!validation.isValid) {
      setAvatarSelectionError(validation.message)
      return
    }

    revokeSelectedImageUrl()

    const objectUrl = URL.createObjectURL(file)
    selectedImageUrlRef.current = objectUrl
    setSelectedImageUrl(objectUrl)
    setAvatarSelectionError(null)
  }

  const handleCameraCapture = (file: File) => {
    handleAvatarFile(file)
  }

  const handleCancelAvatarCrop = () => {
    revokeSelectedImageUrl()
    setSelectedImageUrl(null)
    setAvatarSelectionError(null)
    updateAvatarMutation.reset()
  }

  const handleConfirmAvatarCrop = (file: File) => {
    updateAvatarMutation.mutate(file, {
      onSuccess: () => {
        toast({
          title: 'Foto atualizada',
          description: 'Sua foto de perfil foi salva.',
        })
        handleCancelAvatarCrop()
      },
    })
  }

  const handleRemoveAvatar = () => {
    removeAvatarMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: 'Foto removida',
          description: 'Seu perfil voltou a mostrar as iniciais.',
        })
        setIsRemoveAvatarOpen(false)
      },
    })
  }

  const handleSubmit = form.handleSubmit((values) => {
    if (!user) {
      return
    }

    const dto = buildProfileUpdateDto(values, user)

    if (Object.keys(dto).length === 0) {
      return
    }

    updateProfileMutation.mutate(dto, {
      onSuccess: (updatedUser) => {
        resetForm(getProfileFormDefaults(updatedUser))
        toast({
          title: 'Perfil atualizado',
          description: 'Suas informações foram salvas.',
        })
      },
    })
  })

  const handleUsernameSubmit = usernameForm.handleSubmit((values) => {
    if (!user) {
      return
    }

    const username = normalizeUsername(values.username)

    if (username === normalizeUsername(user.userName ?? '')) {
      resetUsernameForm(getUsernameFormDefaults(user))
      return
    }

    if (usernameLockRemainingMs > 0) {
      setUsernameError('username', {
        type: 'manual',
        message: `Aguarde ${formatLockRemaining(
          usernameLockRemainingMs
        )} antes de tentar novamente.`,
      })
      setUsernameFocus('username')
      return
    }

    if (!isUsernameAvailabilityConfirmed) {
      setUsernameError('username', {
        type: 'manual',
        message: 'Aguarde a confirmação de disponibilidade antes de salvar.',
      })
      setUsernameFocus('username')
      return
    }

    updateUsernameMutation.mutate(
      { username },
      {
        onSuccess: (updatedUser) => {
          resetUsernameForm(getUsernameFormDefaults(updatedUser))
          setIsUsernameDialogOpen(false)
          toast({
            title: 'Usuário atualizado',
            description: 'Seu nome de usuário foi salvo.',
          })
        },
      }
    )
  })

  const displayName = resolveUserFullName(user)
  const hasAvatar = Boolean(user?.avatarUrl)
  const isAvatarPending =
    updateAvatarMutation.isPending || removeAvatarMutation.isPending
  const handleUsernameDialogOpenChange = (open: boolean) => {
    if (updateUsernameMutation.isPending) {
      return
    }

    setIsUsernameDialogOpen(open)
  }

  return (
    <>
      <Card className="border-0 bg-transparent shadow-none sm:border sm:bg-card sm:shadow-xs">
        <CardContent className="px-0 pb-0 sm:p-6">
          {isLoading && !user ? (
            <ProfileSkeleton />
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="space-y-3">
                <div className="flex flex-col items-center gap-3 text-center md:flex-row md:text-left">
                  <AvatarActionMenu
                    avatarUrl={user?.avatarUrl ?? null}
                    displayName={displayName}
                    initials={getUserInitials(displayName)}
                    hasAvatar={hasAvatar}
                    isDisabled={isAvatarPending}
                    isOpen={isAvatarMenuOpen}
                    onOpenChange={setIsAvatarMenuOpen}
                    onChooseFile={handleChooseAvatar}
                    onOpenCamera={() => setIsCameraOpen(true)}
                    onRequestRemove={() => {
                      removeAvatarMutation.reset()
                      setIsRemoveAvatarOpen(true)
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email ?? '—'}
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={AVATAR_FILE_ACCEPT}
                    className="hidden"
                    onChange={handleAvatarFileChange}
                    aria-label="Escolher foto de perfil"
                    aria-hidden
                    tabIndex={-1}
                  />

                  <input
                    ref={captureInputRef}
                    type="file"
                    accept={AVATAR_FILE_ACCEPT}
                    capture="user"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                    aria-label="Tirar foto ou escolher imagem"
                    aria-hidden
                    tabIndex={-1}
                  />
                </div>

                {avatarSelectionError ? (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {avatarSelectionError}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Nome"
                  placeholder="Seu nome"
                  autoComplete="given-name"
                  error={form.formState.errors.firstName?.message}
                  {...form.register('firstName')}
                />
                <FormField
                  label="Sobrenome"
                  placeholder="Seu sobrenome"
                  autoComplete="family-name"
                  error={form.formState.errors.lastName?.message}
                  {...form.register('lastName')}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ReadonlyField
                  label="Usuário"
                  value={user?.userName ?? '—'}
                  icon={<AtSign className="h-3.5 w-3.5" />}
                  action={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setIsUsernameDialogOpen(true)}
                      aria-label="Editar usuário"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  }
                />
                <ReadonlyField
                  label="Email"
                  value={user?.email ?? '—'}
                  icon={<Mail className="h-3.5 w-3.5" />}
                  badgeLabel="Protegido"
                />
              </div>

              {errorPresentation ? (
                <ApiErrorAlert error={errorPresentation} />
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl"
                  onClick={() => resetForm()}
                  disabled={!isDirty || updateProfileMutation.isPending}
                >
                  Desfazer
                </Button>
                <Button
                  type="submit"
                  className="h-10 rounded-xl px-4"
                  disabled={!isDirty || updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending
                    ? 'Salvando...'
                    : 'Salvar alterações'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isUsernameDialogOpen}
        onOpenChange={handleUsernameDialogOpenChange}
      >
        <DialogContent className="w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
            <DialogDescription>
              Escolha um nome único para sua conta.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleUsernameSubmit} noValidate>
            <FormField
              label="Nome de usuário"
              placeholder="seu_usuario"
              autoComplete="username"
              error={usernameFieldError}
              helperText={usernameHelperText}
              prefixIcon={<AtSign className="h-4 w-4" />}
              {...usernameForm.register('username')}
            />

            <UsernameAvailabilityFeedback
              isChanged={isUsernameChanged}
              isChecking={isUsernameAvailabilityChecking}
              isAvailable={isUsernameAvailabilityConfirmed}
              isUnavailable={isUsernameAvailabilityUnavailable}
              hasError={Boolean(usernameAvailabilityError)}
              isLocked={usernameLockRemainingMs > 0}
            />

            {usernameErrorPresentation ? (
              <ApiErrorAlert error={usernameErrorPresentation} />
            ) : null}

            <DialogFooter className="gap-2 sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl"
                onClick={() => setIsUsernameDialogOpen(false)}
                disabled={updateUsernameMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-10 rounded-xl px-4"
                disabled={!canSubmitUsername}
              >
                {updateUsernameMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AvatarCropDialog
        imageSrc={selectedImageUrl}
        isOpen={Boolean(selectedImageUrl)}
        isSubmitting={updateAvatarMutation.isPending}
        apiError={avatarUpdateError}
        onCancel={handleCancelAvatarCrop}
        onConfirm={handleConfirmAvatarCrop}
      />

      <AvatarCameraDialog
        isOpen={isCameraOpen}
        onOpenChange={setIsCameraOpen}
        onCapture={handleCameraCapture}
        onChooseFile={handleChooseCameraFallback}
      />

      <AlertDialog
        open={isRemoveAvatarOpen}
        onOpenChange={(open) => {
          if (!removeAvatarMutation.isPending) {
            setIsRemoveAvatarOpen(open)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover foto de perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Seu perfil passará a mostrar suas iniciais. Você pode adicionar
              outra foto depois.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {avatarRemoveError ? <ApiErrorAlert error={avatarRemoveError} /> : null}

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={removeAvatarMutation.isPending}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault()
                handleRemoveAvatar()
              }}
              disabled={removeAvatarMutation.isPending}
            >
              {removeAvatarMutation.isPending ? 'Removendo...' : 'Remover foto'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const getProfileFormDefaults = (
  user: User | undefined
): UpdateProfileFormData => ({
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
})

const getUsernameFormDefaults = (
  user: User | undefined
): UpdateUsernameFormData => ({
  username: user?.userName ?? '',
})

const normalizeUsername = (value: string) => value.trim().toLowerCase()

const buildProfileUpdateDto = (
  values: UpdateProfileFormData,
  user: User
): UpdateProfileDto => {
  const dto: UpdateProfileDto = {}

  if (values.firstName !== (user.firstName ?? '')) {
    dto.firstName = values.firstName === '' ? null : values.firstName
  }

  if (values.lastName !== (user.lastName ?? '')) {
    dto.lastName = values.lastName === '' ? null : values.lastName
  }

  return dto
}

interface UsernameHelperTextOptions {
  isChanged: boolean
  isChecking: boolean
  isAvailable: boolean
  isUnavailable: boolean
  lockRemainingMs: number
}

const getUsernameHelperText = ({
  isChanged,
  isChecking,
  isAvailable,
  isUnavailable,
  lockRemainingMs,
}: UsernameHelperTextOptions) => {
  if (lockRemainingMs > 0) {
    return `Bloqueado por limite de tentativas. Aguarde ${formatLockRemaining(
      lockRemainingMs
    )}.`
  }

  if (!isChanged) {
    return 'Este é seu usuário atual.'
  }

  if (isChecking) {
    return 'Vamos verificar depois que você parar de digitar.'
  }

  if (isAvailable) {
    return 'Você pode salvar este usuário.'
  }

  if (isUnavailable) {
    return 'Escolha outro nome para continuar.'
  }

  return '3 a 50 caracteres. Use letras, números, _ ou -.'
}

const formatLockRemaining = (milliseconds: number) => {
  const totalSeconds = Math.ceil(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes <= 0) {
    return `${seconds} s`
  }

  if (seconds === 0) {
    return `${minutes} min`
  }

  return `${minutes} min ${seconds} s`
}

interface UsernameAvailabilityFeedbackProps {
  isChanged: boolean
  isChecking: boolean
  isAvailable: boolean
  isUnavailable: boolean
  hasError: boolean
  isLocked: boolean
}

const UsernameAvailabilityFeedback = ({
  isChanged,
  isChecking,
  isAvailable,
  isUnavailable,
  hasError,
  isLocked,
}: UsernameAvailabilityFeedbackProps) => {
  if (!isChanged || isLocked) {
    return null
  }

  if (isChecking) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Verificando disponibilidade...</span>
      </div>
    )
  }

  if (isAvailable) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-state-income/30 bg-state-income/10 px-3 py-2 text-sm text-state-income">
        <CheckCircle2 className="h-4 w-4" />
        <span>Nome disponível para uso</span>
      </div>
    )
  }

  if (isUnavailable) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <XCircle className="h-4 w-4" />
        <span>Nome indisponível</span>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-state-warning/30 bg-state-warning/10 px-3 py-2 text-sm text-state-warning">
        <XCircle className="h-4 w-4" />
        <span>Não foi possível verificar agora</span>
      </div>
    )
  }

  return null
}

interface FieldBadgeProps {
  label: string
}

const FieldBadge = ({ label }: FieldBadgeProps) => (
  <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
    {label}
  </span>
)

interface ReadonlyFieldProps {
  label: string
  value: string
  icon: ReactNode
  badgeLabel?: string
  action?: ReactNode
}

const ReadonlyField = ({
  label,
  value,
  icon,
  badgeLabel,
  action,
}: ReadonlyFieldProps) => (
  <div className="rounded-xl border border-border bg-secondary p-3">
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </span>
      {action ?? (badgeLabel ? <FieldBadge label={badgeLabel} /> : null)}
    </div>
    <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
  </div>
)

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 animate-pulse rounded-full bg-secondary" />
      <div className="space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-56 animate-pulse rounded bg-secondary" />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="h-11 animate-pulse rounded-xl bg-secondary" />
      <div className="h-11 animate-pulse rounded-xl bg-secondary" />
    </div>
  </div>
)
