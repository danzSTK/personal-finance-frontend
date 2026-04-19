import { cn } from '@/shared/lib/utils'

interface LoadingProps {
  fullScreen?: boolean
  message?: string
}

export function Loading({ fullScreen = false, message }: LoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullScreen && 'min-h-screen'
      )}
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
