import type { ReactNode } from 'react'
import {
  Clock3,
  Loader2,
  LogOut,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { BrandLogo } from '@/shared/components/atoms/BrandLogo'
import { Button } from '@/shared/lib/button'
import type { ApiErrorPresentation } from '@/shared/errors'

interface PendingEmailVerificationPanelProps {
  email: string
  isResending: boolean
  isLoggingOut: boolean
  cooldownMinutes: number | null
  resendQueued: boolean
  error: ApiErrorPresentation | null
  onResend: () => void
  onLogout: () => void
}

export function PendingEmailVerificationPanel({
  email,
  isResending,
  isLoggingOut,
  cooldownMinutes,
  resendQueued,
  error,
  onResend,
  onLogout,
}: PendingEmailVerificationPanelProps) {
  const isCooldownActive = cooldownMinutes !== null && cooldownMinutes > 0
  const disableResend = isResending || isCooldownActive

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground sm:px-6">
      <section className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-xl shadow-background/40 sm:p-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo className="w-28" />
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verificação pendente
            </span>
          </div>

          <div className="space-y-5">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <MailCheck className="h-6 w-6" />
            </span>
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Confirme sua identidade pelo email
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Enviamos um link de verificação para{' '}
                <span className="font-medium text-foreground">{email}</span>.
                Sua sessão está ativa, mas os recursos financeiros ficam
                bloqueados até a confirmação.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <GuidanceItem
              icon={<MailCheck className="h-4 w-4" />}
              title="Confira sua caixa de entrada"
              description="O link pode chegar em alguns instantes. Verifique também spam ou lixo eletrônico."
            />
            <GuidanceItem
              icon={<Clock3 className="h-4 w-4" />}
              title="Reenvio protegido"
              description="Você pode solicitar um novo email respeitando o intervalo de 60 minutos e o limite diário."
            />
          </div>

          {resendQueued ? (
            <div
              className="rounded-xl border border-primary/30 bg-primary/10 p-4"
              aria-live="polite"
            >
              <p className="text-sm font-medium text-foreground">
                Novo email enfileirado
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Se ele não aparecer, aguarde o intervalo de segurança antes de
                solicitar outro envio.
              </p>
            </div>
          ) : null}

          {error ? <ApiErrorAlert error={error} /> : null}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Button
              type="button"
              className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={disableResend}
              onClick={onResend}
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {isCooldownActive
                    ? `Aguarde ${cooldownMinutes} min`
                    : 'Reenviar email'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent"
              disabled={isLoggingOut}
              onClick={onLogout}
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sair da conta
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

interface GuidanceItemProps {
  icon: ReactNode
  title: string
  description: string
}

const GuidanceItem = ({ icon, title, description }: GuidanceItemProps) => (
  <div className="rounded-xl border border-border bg-secondary p-4">
    <div className="flex items-center gap-2 text-primary">
      {icon}
      <p className="text-sm font-semibold text-foreground">{title}</p>
    </div>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">
      {description}
    </p>
  </div>
)
