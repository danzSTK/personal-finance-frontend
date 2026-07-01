import { Plus } from 'lucide-react'
import { Button } from '@/shared/lib/button'

interface AddAccountButtonProps {
  onClick: () => void
}

export function AddAccountButton({ onClick }: AddAccountButtonProps) {
  return (
    <Button
      type="button"
      className="group h-11 w-11 justify-center gap-0 overflow-hidden rounded-xl bg-primary px-0 text-primary-foreground transition-[width,background-color] duration-300 ease-out hover:w-36 hover:bg-primary/90 focus-visible:w-36"
      onClick={onClick}
      aria-label="Nova conta"
      title="Nova conta"
    >
      <Plus className="h-4 w-4 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-[max-width,opacity,margin] duration-300 ease-out group-hover:ml-2 group-hover:max-w-24 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-24 group-focus-visible:opacity-100">
        Nova conta
      </span>
    </Button>
  )
}
