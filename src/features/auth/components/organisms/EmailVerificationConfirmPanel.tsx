import {
  ArrowRight,
  Loader2,
  LogIn,
  MailCheck,
  ShieldCheck,
} from 'lucide-react'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { BrandLogo } from '@/shared/components/atoms/BrandLogo'
import { Button } from '@/shared/lib/button'
import type { ApiErrorPresentation } from '@/shared/errors'

interface EmailVerificationConfirmPanelProps {
  hasToken: boolean
  isPending: boolean
  isConfirmed: boolean
  error: ApiErrorPresentation | null
  onConfirm: () => void
  onContinue: () => void
  onSignIn: () => void
  onRetry?: () => void
}

export function EmailVerificationConfirmPanel({
  hasToken,
  isPending,
  isConfirmed,
  error,
  onConfirm,
  onContinue,
  onSignIn,
  onRetry,
}: EmailVerificationConfirmPanelProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground sm:px-6">
      <section className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-xl shadow-background/40 sm:p-8">
        <div className="space-y-8">
          <BrandLogo className="w-28" />

          {isConfirmed ? (
            <ConfirmedContent onContinue={onContinue} onSignIn={onSignIn} />
          ) : (
            <PendingConfirmationContent
              hasToken={hasToken}
              isPending={isPending}
              error={error}
              onConfirm={onConfirm}
              onSignIn={onSignIn}
              onRetry={onRetry}
            />
          )}
        </div>
      </section>
    </main>
  )
}

interface ConfirmedContentProps {
  onContinue: () => void
  onSignIn: () => void
}

const ConfirmedContent = ({
  onContinue,
  onSignIn,
}: ConfirmedContentProps) => (
  <div className="space-y-6" aria-live="polite">
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
      <ShieldCheck className="h-6 w-6" />
    </span>
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Email confirmado
      </h1>
      <p className="text-sm leading-6 text-muted-foreground">
        Sua conta foi liberada com segurança. Se você já está com a sessão
        ativa neste navegador, pode continuar direto para o Danfy.
      </p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        type="button"
        className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={onContinue}
      >
        Continuar
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent"
        onClick={onSignIn}
      >
        <LogIn className="h-4 w-4" />
        Entrar
      </Button>
    </div>
  </div>
)

interface PendingConfirmationContentProps {
  hasToken: boolean
  isPending: boolean
  error: ApiErrorPresentation | null
  onConfirm: () => void
  onSignIn: () => void
  onRetry?: () => void
}

const PendingConfirmationContent = ({
  hasToken,
  isPending,
  error,
  onConfirm,
  onSignIn,
  onRetry,
}: PendingConfirmationContentProps) => (
  <div className="space-y-6">
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
      <MailCheck className="h-6 w-6" />
    </span>
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Confirme seu email
      </h1>
      <p className="text-sm leading-6 text-muted-foreground">
        Use o botão abaixo para confirmar que este email pertence a você. A
        confirmação só acontece quando você escolhe continuar.
      </p>
    </div>

    {error ? <ApiErrorAlert error={error} onRetry={onRetry} /> : null}

    {!hasToken ? (
      <div className="rounded-xl border border-border bg-secondary p-4">
        <p className="text-sm font-medium text-foreground">
          Link de confirmação ausente
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Abra novamente o link enviado por email ou entre na sua conta para
          solicitar um novo envio.
        </p>
      </div>
    ) : null}

    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        type="button"
        className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={!hasToken || isPending}
        onClick={onConfirm}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirmando...
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Confirmar email
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent"
        onClick={onSignIn}
      >
        <LogIn className="h-4 w-4" />
        Entrar
      </Button>
    </div>
  </div>
)
