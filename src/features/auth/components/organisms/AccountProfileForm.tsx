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
import { AtSign, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/lib/card'
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
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { applyApiFieldErrors, resolveApiError } from '@/shared/errors'
import { toast } from '@/shared/hooks/use-toast'
import { FormField } from '../molecules'
import { useUser } from '../../api/queries'
import {
  useRemoveUserAvatar,
  useUpdateProfile,
  useUpdateUserAvatar,
} from '../../api/mutations'
import {
  updateProfileSchema,
  type UpdateProfileFormData,
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

export const AccountProfileForm = () => {
  const { data: user, isLoading } = useUser()
  const updateProfileMutation = useUpdateProfile()
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

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: getProfileFormDefaults(user),
  })
  const resetForm = form.reset
  const { isDirty } = form.formState

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
  }, [resetForm, user])

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

  const displayName = resolveUserFullName(user)
  const hasAvatar = Boolean(user?.avatarUrl)
  const isAvatarPending =
    updateAvatarMutation.isPending || removeAvatarMutation.isPending

  return (
    <>
      <Card className="border-app-border bg-app-surface">
        <CardHeader>
          <CardTitle className="text-base text-app-text">Perfil</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <p className="truncate text-sm font-semibold text-app-text">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-app-muted">
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
                />
                <ReadonlyField
                  label="Email"
                  value={user?.email ?? '—'}
                  icon={<Mail className="h-3.5 w-3.5" />}
                />
              </div>

              {errorPresentation ? (
                <ApiErrorAlert error={errorPresentation} />
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-app-border bg-app-panel text-app-text hover:bg-app-elevated hover:text-app-text"
                  onClick={() => resetForm()}
                  disabled={!isDirty || updateProfileMutation.isPending}
                >
                  Desfazer
                </Button>
                <Button
                  type="submit"
                  className="h-10 rounded-xl bg-brand px-4 text-brand-foreground hover:bg-brand-intense"
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
        <AlertDialogContent className="border-app-border bg-app-surface text-app-text">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover foto de perfil?</AlertDialogTitle>
            <AlertDialogDescription className="text-app-muted">
              Seu perfil passará a mostrar suas iniciais. Você pode adicionar
              outra foto depois.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {avatarRemoveError ? <ApiErrorAlert error={avatarRemoveError} /> : null}

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              className="border-app-border bg-app-panel text-app-text hover:bg-app-elevated hover:text-app-text"
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

const SoonBadge = () => (
  <span className="inline-flex items-center rounded-full bg-app-elevated px-2 py-0.5 text-[11px] font-medium text-app-muted">
    Em breve
  </span>
)

interface ReadonlyFieldProps {
  label: string
  value: string
  icon: ReactNode
}

const ReadonlyField = ({ label, value, icon }: ReadonlyFieldProps) => (
  <div className="rounded-xl border border-app-border bg-app-panel p-3">
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-app-muted">
        {icon}
        {label}
      </span>
      <SoonBadge />
    </div>
    <p className="mt-1 truncate text-sm font-medium text-app-text">{value}</p>
  </div>
)

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 animate-pulse rounded-full bg-app-panel" />
      <div className="space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-app-panel" />
        <div className="h-3 w-56 animate-pulse rounded bg-app-panel" />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="h-11 animate-pulse rounded-xl bg-app-panel" />
      <div className="h-11 animate-pulse rounded-xl bg-app-panel" />
    </div>
  </div>
)
