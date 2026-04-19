import { ReactNode, useState } from 'react'
import { ShieldCheck, Sparkles, WalletCards } from 'lucide-react'
import { Toaster } from '@/shared/components/organisms/Toaster'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/lib/card'
import { cn } from '@/shared/lib/utils'
import { APP_BRAND } from '../../constants/auth.constants'
import { SignInForm } from '../organisms/SignInForm'
import { SignUpForm } from '../organisms/SignUpForm'
import { SocialButton } from '../molecules/SocialButton'
import { Divider } from '../molecules/Divider'
import { Button } from '../atoms'

type AuthMode = 'sign-in' | 'sign-up'

const authModeContent = {
  'sign-in': {
    title: 'Bem-vindo de volta',
    description: 'Entre para gerenciar suas finanças com foco e clareza.',
  },
  'sign-up': {
    title: 'Crie sua conta',
    description: 'Comece com um fluxo rápido e seguro para organizar seu dinheiro.',
  },
} as const

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const copy = authModeContent[mode]

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-app-bg via-app-surface to-app-elevated text-app-text">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center p-4 sm:p-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-5">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-app-border bg-brand/15 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-soft">
                <Sparkles className="h-3.5 w-3.5" />
                Dark-first Auth
              </span>
              <h1 className="max-w-xl text-4xl font-semibold leading-tight text-app-text">
                {APP_BRAND.name}: uma autenticação premium inspirada em produtos modernos.
              </h1>
              <p className="max-w-lg text-base text-app-muted">
                Fluxo simples, feedback claro e foco total na ação principal: entrar e
                seguir para seu painel financeiro.
              </p>
            </div>

            <div className="grid gap-3">
              <FeaturePill
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Segurança em primeiro lugar"
                description="Sessões, refresh e vínculo de contas integrados ao backend."
              />
              <FeaturePill
                icon={<WalletCards className="h-4 w-4" />}
                title="Interface orientada à ação"
                description="Menos ruído, hierarquia visual forte e estados claros."
              />
            </div>
          </section>

          <Card className="w-full border-app-border bg-app-surface">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-semibold text-app-text">{copy.title}</CardTitle>
              <CardDescription className="text-app-muted">{copy.description}</CardDescription>
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-app-border bg-app-panel p-1">
                <ModeButton active={mode === 'sign-in'} onClick={() => setMode('sign-in')}>
                  Entrar
                </ModeButton>
                <ModeButton active={mode === 'sign-up'} onClick={() => setMode('sign-up')}>
                  Criar conta
                </ModeButton>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {mode === 'sign-in' ? <SignInForm /> : <SignUpForm />}
              <Divider text="ou continue com" />
              <SocialButton provider="google" />
              <p className="text-center text-xs text-app-muted">
                Ao continuar, você aceita os termos e políticas da plataforma.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

interface ModeButtonProps {
  active: boolean
  onClick: () => void
  children: string
}

const ModeButton = ({ active, onClick, children }: ModeButtonProps) => (
  <Button
    type="button"
    onClick={onClick}
    variant="ghost"
    className={cn(
      'h-10 rounded-lg border border-transparent text-sm font-medium text-app-muted transition-all hover:bg-app-elevated hover:text-app-text',
      active && 'border-brand bg-brand text-brand-foreground hover:bg-brand-intense'
    )}
  >
    {children}
  </Button>
)

interface FeaturePillProps {
  icon: ReactNode
  title: string
  description: string
}

const FeaturePill = ({ icon, title, description }: FeaturePillProps) => (
  <div className="rounded-xl border border-app-border bg-app-panel p-4">
    <div className="mb-2 flex items-center gap-2 text-brand-soft">
      {icon}
      <p className="text-sm font-semibold text-app-text">{title}</p>
    </div>
    <p className="text-sm text-app-muted">{description}</p>
  </div>
)
