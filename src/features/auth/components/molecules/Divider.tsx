import { cn } from '@/shared/lib/utils'

interface DividerProps {
  text?: string
  className?: string
}

export const Divider = ({ text = 'OR', className }: DividerProps) => {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-app-border" />
      </div>
      {text && (
        <div className="relative flex justify-center text-xs uppercase tracking-[0.22em]">
          <span className="bg-app-surface px-4 font-medium text-app-muted">
            {text}
          </span>
        </div>
      )}
    </div>
  )
}
