import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/lib/button'
import { Input } from '@/shared/lib/input'
import { Label } from '@/shared/lib/label'
import { MaskedInput } from '@/shared/components/atoms/MaskedInput'
import { CPF_MASK, PHONE_MASK, CURRENCY_MASK } from '@/shared/utils/masks'

const exampleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(14, 'CPF inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  amount: z.string().min(1, 'Valor é obrigatório'),
})

type ExampleFormData = z.infer<typeof exampleSchema>

export function ExampleMaskedForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExampleFormData>({
    resolver: zodResolver(exampleSchema),
  })

  const onSubmit = (data: ExampleFormData) => {
    console.log('Form data:', data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          placeholder="Digite seu nome"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <Controller
          name="cpf"
          control={control}
          render={({ field }) => (
            <MaskedInput
              mask={CPF_MASK}
              value={field.value}
              onAccept={field.onChange}
              placeholder="000.000.000-00"
            />
          )}
        />
        {errors.cpf && (
          <p className="text-sm text-destructive">{errors.cpf.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <MaskedInput
              mask={PHONE_MASK}
              value={field.value}
              onAccept={field.onChange}
              placeholder="(00) 00000-0000"
            />
          )}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor</Label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <MaskedInput
              mask={CURRENCY_MASK}
              value={field.value}
              onAccept={field.onChange}
              placeholder="R$ 0,00"
            />
          )}
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Enviar
      </Button>
    </form>
  )
}
