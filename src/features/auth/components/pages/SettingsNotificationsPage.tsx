import { SettingsPlaceholder } from '../molecules/SettingsPlaceholder'

export const SettingsNotificationsPage = () => (
  <SettingsPlaceholder
    title="Notificações"
    description="Centralize alertas importantes para atividade de conta, segurança e movimentações críticas."
    items={[
      'Alertas de segurança por email',
      'Resumo semanal de atividade da conta',
      'Confirmações de ações sensíveis',
    ]}
  />
)
