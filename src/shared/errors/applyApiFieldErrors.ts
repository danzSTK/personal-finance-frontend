import type {
  FieldPath,
  FieldValues,
  UseFormSetError,
  UseFormSetFocus,
} from 'react-hook-form'
import type { ApiFieldError } from './apiError.types'

interface ApplyApiFieldErrorsOptions<TFieldValues extends FieldValues> {
  fieldErrors: ApiFieldError[]
  fieldMap: Partial<Record<string, FieldPath<TFieldValues>>>
  setError: UseFormSetError<TFieldValues>
  setFocus?: UseFormSetFocus<TFieldValues>
}

export const applyApiFieldErrors = <TFieldValues extends FieldValues>({
  fieldErrors,
  fieldMap,
  setError,
  setFocus,
}: ApplyApiFieldErrorsOptions<TFieldValues>): boolean => {
  let firstField: FieldPath<TFieldValues> | null = null

  fieldErrors.forEach((fieldError) => {
    const field = fieldMap[fieldError.field]

    if (!field) {
      return
    }

    firstField ??= field
    setError(field, {
      type: 'server',
      message: fieldError.messages.join(' '),
    })
  })

  if (firstField && setFocus) {
    setFocus(firstField)
  }

  return firstField !== null
}
