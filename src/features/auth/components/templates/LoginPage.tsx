import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, WalletCards } from 'lucide-react'
import { APP_BRAND, APP_COPY } from '@/shared/config/brand'
import { Toaster } from '@/shared/components/organisms/Toaster'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/lib/card'
import { Button } from '../atoms'
import { SignInForm } from '../organisms/SignInForm'
import { SignUpForm } from '../organisms/SignUpForm'
import { SocialButton } from '../molecules/SocialButton'
import { Divider } from '../molecules/Divider'
import { AUTH_ROUTES } from '../../constants/auth.constants'

type AuthMode = 'sign-in' | 'sign-up'

interface LoginPageProps {
  mode?: AuthMode
}

const authModeContent = {
  'sign-in': {
    title: 'Entrar na sua conta',
    description: 'Acesse seu painel com segurança e continue de onde parou.',
    switchPrompt: 'Ainda não possui conta?',
    switchAction: 'Criar conta',
    switchRoute: AUTH_ROUTES.signUp,
  },
  'sign-up': {
    title: 'Criar sua conta',
    description: 'Organize sua vida financeira com um começo simples e seguro.',
    switchPrompt: 'Já possui conta?',
    switchAction: 'Entrar',
    switchRoute: AUTH_ROUTES.signInAlias,
  },
} as const

export function LoginPage({ mode = 'sign-in' }: LoginPageProps) {
  const navigate = useNavigate()
  const copy = authModeContent[mode]

  return (
    <div className="dark min-h-screen bg-linear-to-br from-app-bg via-app-surface to-app-panel text-app-text">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-2xl shadow-app-bg/60">
          <div className="grid lg:grid-cols-[1fr_minmax(0,30rem)]">
            <section className="hidden bg-app-panel/60 p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
              <div className="space-y-5">
                <span className="inline-flex w-fit items-center rounded-full border border-app-border bg-app-panel px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-app-muted">
                  {APP_BRAND.name}
                </span>
                <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-app-text">
                  {APP_COPY.auth.headline}
                </h1>
                <p className="max-w-lg text-sm leading-relaxed text-app-muted">
                  {APP_COPY.auth.supporting}
                </p>
              </div>

              <div className="grid gap-3">
                <FeaturePill
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Segurança em primeiro plano"
                  description="Fluxo com feedback claro e estados de erro explícitos."
                />
                <FeaturePill
                  icon={<WalletCards className="h-4 w-4" />}
                  title="Conforto visual consistente"
                  description="Card focado na ação certa em cada etapa: entrar ou criar conta."
                />
              </div>
            </section>

            <div className="p-5 sm:p-8 lg:p-10">
              <CardHeader className="p-0">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-app-muted lg:hidden">
                  {APP_BRAND.name}
                </p>
              </CardHeader>

              <CardContent className="p-0 pt-4 sm:pt-6">
                <div
                  key={mode}
                  className="animate-in fade-in-0 duration-1000 ease-out"
                >
                  <div className="space-y-5 animate-in slide-in-from-bottom-1 duration-500 ease-out">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl font-semibold tracking-tight text-app-text sm:text-3xl">
                        {copy.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-app-muted">
                        {copy.description}
                      </CardDescription>
                    </div>
                    {mode === 'sign-in' ? <SignInCardFlow /> : <SignUpCardFlow />}

                    <p className="text-center text-xs text-app-muted">
                      Ao continuar, você aceita os termos e políticas da plataforma.
                    </p>
                    <div className="flex items-center justify-center gap-2 border-t border-app-border pt-4 text-sm text-app-muted">
                      <span>{copy.switchPrompt}</span>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-brand hover:text-brand-soft"
                        onClick={() => navigate(copy.switchRoute)}
                      >
                        {copy.switchAction}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}

const SignInCardFlow = () => (
  <>
    <SocialButton provider="google" />
    <Divider text="ou entre com email" />
    <SignInForm />
  </>
)

const SignUpCardFlow = () => (
  <>
    <SocialButton provider="google" />
    <Divider text="ou crie com email" />
    <SignUpForm />
  </>
)

interface FeaturePillProps {
  icon: ReactNode
  title: string
  description: string
}

const FeaturePill = ({ icon, title, description }: FeaturePillProps) => (
  <div className="rounded-xl border border-app-border bg-app-bg p-4">
    <div className="mb-2 flex items-center gap-2 text-brand">
      {icon}
      <p className="text-sm font-semibold text-app-text">{title}</p>
    </div>
    <p className="text-sm text-app-muted">{description}</p>
  </div>
)
