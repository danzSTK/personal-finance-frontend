import { Monitor, Smartphone, Tablet, MapPin, Trash2 } from 'lucide-react'
import { Button } from '../atoms'
import type { Session } from '../../types'
import { cn } from '@/shared/lib/utils'

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
}

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
