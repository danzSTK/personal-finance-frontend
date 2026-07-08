import {
  ChevronRight,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Trash2,
} from 'lucide-react'
import { Button } from '../atoms'
import type { Session } from '../../types'
import { cn } from '@/shared/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'

interface SessionCardProps {
  session: Session
  onRevoke?: (jti: string) => void
  isRevoking?: boolean
}

const getDeviceIcon = (device: Session['device']) => {
  const normalizedDevice = device.toLowerCase()

  if (
    normalizedDevice.includes('mobile') ||
    normalizedDevice.includes('iphone') ||
    normalizedDevice.includes('android')
  ) {
    return <Smartphone className="h-5 w-5" />
  }

  if (
    normalizedDevice.includes('tablet') ||
    normalizedDevice.includes('ipad')
  ) {
    return <Tablet className="h-5 w-5" />
  }

  return <Monitor className="h-5 w-5" />
}

export const SessionCard = ({
  session,
  onRevoke,
  isRevoking,
}: SessionCardProps) => {
  const loginTimeDistance = formatRelativeTimePtBR(session.loginAt)

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden',
              session.isCurrent
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:bg-secondary'
            )}
          >
            <span className="shrink-0 text-muted-foreground">
              {getDeviceIcon(session.device)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                {session.device}
              </span>
              <span className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {session.location ?? 'Localização indisponível'}
                </span>
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="max-h-[82vh] overflow-y-auto rounded-t-3xl border-border bg-card px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-5 lg:hidden"
        >
          <SheetHeader className="pr-8 text-left">
            <SheetTitle>{session.device}</SheetTitle>
            <SheetDescription>
              Detalhes desta sessão de acesso.
            </SheetDescription>
          </SheetHeader>

          <SessionDetails
            session={session}
            loginTimeDistance={loginTimeDistance}
            onRevoke={onRevoke}
            isRevoking={isRevoking}
          />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block">
        <FullSessionCard
          session={session}
          loginTimeDistance={loginTimeDistance}
          onRevoke={onRevoke}
          isRevoking={isRevoking}
        />
      </div>
    </>
  )
}

interface FullSessionCardProps extends SessionCardProps {
  loginTimeDistance: string
}

const FullSessionCard = ({
  session,
  onRevoke,
  isRevoking,
  loginTimeDistance,
}: FullSessionCardProps) => (
    <div
      className={cn(
        'relative p-4 rounded-lg border transition-all',
        session.isCurrent
          ? 'border-primary bg-primary/10'
          : 'border-border bg-card hover:bg-secondary'
      )}
    >
      {session.isCurrent && (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
            Atual
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="shrink-0 text-muted-foreground">
          {getDeviceIcon(session.device)}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{session.device}</h3>
          <div className="mt-1 space-y-1">
            <p className="text-sm text-muted-foreground">
              {session.browser} • {session.os}
            </p>
            {session.location && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {session.location}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              IP: {session.ip.replace(/\.\d+\.\d+$/, '.***')}
            </p>
            <p className="text-xs text-muted-foreground">
              {session.isCurrent ? 'Ativo agora' : `Login ${loginTimeDistance}`}
            </p>
          </div>
        </div>

        {!session.isCurrent && onRevoke && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRevoke(session.jti)}
            disabled={isRevoking}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
)

interface SessionDetailsProps extends SessionCardProps {
  loginTimeDistance: string
}

const SessionDetails = ({
  session,
  onRevoke,
  isRevoking,
  loginTimeDistance,
}: SessionDetailsProps) => (
  <div className="mt-5 space-y-4">
    <div
      className={cn(
        'rounded-2xl border p-4',
        session.isCurrent
          ? 'border-primary bg-primary/10'
          : 'border-border bg-background'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-muted-foreground">
          {getDeviceIcon(session.device)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{session.device}</p>
          <p className="text-sm text-muted-foreground">
            {session.browser} • {session.os}
          </p>
        </div>
        {session.isCurrent ? (
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
            Atual
          </span>
        ) : null}
      </div>
    </div>

    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <SessionDetailRow
        label="Localização"
        value={session.location ?? 'Localização indisponível'}
      />
      <SessionDetailRow
        label="IP"
        value={session.ip.replace(/\.\d+\.\d+$/, '.***')}
      />
      <SessionDetailRow
        label="Status"
        value={session.isCurrent ? 'Ativo agora' : `Login ${loginTimeDistance}`}
      />
    </div>

    {!session.isCurrent && onRevoke ? (
      <Button
        variant="ghost"
        className="h-11 w-full rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onRevoke(session.jti)}
        disabled={isRevoking}
      >
        <Trash2 className="h-4 w-4" />
        Encerrar sessão
      </Button>
    ) : null}
  </div>
)

interface SessionDetailRowProps {
  label: string
  value: string
}

const SessionDetailRow = ({ label, value }: SessionDetailRowProps) => (
  <div className="border-b border-border px-4 py-3 last:border-b-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-foreground">
      {value}
    </p>
  </div>
)

const formatRelativeTimePtBR = (value: string): string => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'agora'
  }

  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'agora'
  }

  const minutes = Math.floor(diffInSeconds / 60)

  if (minutes < 60) {
    return `há ${minutes} min`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `há ${hours} h`
  }

  const days = Math.floor(hours / 24)
  return `há ${days} d`
}
