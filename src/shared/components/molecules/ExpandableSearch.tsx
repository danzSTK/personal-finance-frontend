import type { RefObject } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/shared/lib/button'
import { Input } from '@/shared/lib/input'
import { cn } from '@/shared/lib/utils'

interface ExpandableSearchProps {
  isOpen: boolean
  value: string
  inputRef: RefObject<HTMLInputElement>
  placeholder: string
  closedLabel: string
  activeLabel: string
  onOpen: () => void
  onChange: (value: string) => void
  onClear: () => void
  onBlur: () => void
  className?: string
  openClassName?: string
  closedClassName?: string
}

export function ExpandableSearch({
  isOpen,
  value,
  inputRef,
  placeholder,
  closedLabel,
  activeLabel,
  onOpen,
  onChange,
  onClear,
  onBlur,
  className,
  openClassName,
  closedClassName,
}: ExpandableSearchProps) {
  const hasActiveSearch = value.trim() !== ''

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          'h-11 w-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground',
          hasActiveSearch &&
            'border-state-info bg-state-info/10 text-state-info hover:text-state-info',
          className,
          closedClassName
        )}
        onClick={onOpen}
        aria-label={hasActiveSearch ? activeLabel : closedLabel}
        title={hasActiveSearch ? activeLabel : closedLabel}
      >
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div
      className={cn(
        'flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-border bg-secondary px-3 opacity-100 transition-[width,opacity] duration-300 ease-out animate-in fade-in-0 zoom-in-95 motion-reduce:animate-none sm:w-72',
        className,
        openClassName
      )}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onBlur()
        }
      }}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Input
        ref={inputRef}
        className="h-9 border-0 bg-transparent px-0 text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
        onClick={onClear}
        aria-label="Limpar pesquisa"
        title="Limpar pesquisa"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
