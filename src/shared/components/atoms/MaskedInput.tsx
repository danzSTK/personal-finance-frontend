import { IMaskInput } from 'react-imask'
import {
  forwardRef,
  type ComponentType,
  type InputHTMLAttributes,
  type Ref,
} from 'react'
import { cn } from '@/shared/lib/utils'

type MaskPattern =
  | string
  | RegExp
  | NumberConstructor
  | DateConstructor
  | Array<Record<string, unknown>>

type MaskConfig = Record<string, unknown> & {
  mask: MaskPattern
}

interface MaskedInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'onAccept' | 'onChange' | 'value'
  > {
  mask: MaskPattern | MaskConfig
  blocks?: Record<string, unknown>
  definitions?: Record<string, unknown>
  unmask?: boolean | 'typed'
  value?: string
  onAccept?: (value: string) => void
  className?: string
}

type MaskedInputPrimitiveProps = MaskedInputProps & {
  inputRef?: Ref<HTMLInputElement>
}

const MaskedInputPrimitive = IMaskInput as unknown as ComponentType<
  MaskedInputPrimitiveProps
>

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onAccept, placeholder, className, ...maskProps }, ref) => {
    const resolvedMaskProps = isMaskConfig(mask)
      ? { ...mask, ...maskProps }
      : { ...maskProps, mask }

    return (
      <MaskedInputPrimitive
        {...resolvedMaskProps}
        value={value}
        onAccept={(acceptedValue) => {
          onAccept?.(String(acceptedValue ?? ''))
        }}
        placeholder={placeholder}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        inputRef={ref}
      />
    )
  }
)

MaskedInput.displayName = 'MaskedInput'

const isMaskConfig = (value: MaskPattern | MaskConfig): value is MaskConfig =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && 'mask' in value
