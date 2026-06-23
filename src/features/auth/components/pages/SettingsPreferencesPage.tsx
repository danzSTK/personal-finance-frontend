import { SettingsPlaceholder } from '../molecules/SettingsPlaceholder'

export const SettingsPreferencesPage = () => (
  <SettingsPlaceholder
    title="Preferências"
    description="Defina a experiência padrão da aplicação para o seu uso diário."
    items={[
      'Formato de data e horário',
      'Idioma da interface',
      'Comportamento inicial do painel',
    ]}
  />
)
