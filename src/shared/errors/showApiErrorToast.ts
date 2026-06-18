import { toast } from '@/shared/hooks/use-toast'
import type { ApiErrorContext } from './apiError.types'
import { resolveApiError } from './resolveApiError'

export const showApiErrorToast = (
  error: unknown,
  context: ApiErrorContext = 'generic'
) => {
  const presentation = resolveApiError(error, context)

  toast({
    variant: 'destructive',
    title: presentation.title,
    description: presentation.description,
  })

  return presentation
}
