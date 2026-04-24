import { Sparkles } from 'lucide-react'
import { APP_BRAND } from '@/shared/config/brand'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/lib/card'
import { AuthAppShell } from './AuthAppShell'

export function DashboardPage() {
  return (
    <AuthAppShell
      activeSection="dashboard"
      title="Dashboard"
      subtitle={`Seu espaço principal no ${APP_BRAND.name}`}
    >
      <Card className="border-app-border bg-app-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-app-text">
            <Sparkles className="h-4 w-4 text-brand-soft" />
            {`Bem-vindo ao ${APP_BRAND.name}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-app-muted">
            Seu painel está pronto para receber os próximos módulos financeiros.
          </p>
          <p className="text-sm text-app-muted">
            Enquanto isso, a área de conta e segurança já está ativa em Configurações.
          </p>
        </CardContent>
      </Card>

      <Card className="border-app-border bg-app-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-app-text">
            <Sparkles className="h-4 w-4 text-brand-soft" />
            Próxima etapa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-app-muted">
            Os widgets de saldo, metas e movimentações entram nesta área nas próximas
            entregas.
          </p>
        </CardContent>
      </Card>
    </AuthAppShell>
  )
}
