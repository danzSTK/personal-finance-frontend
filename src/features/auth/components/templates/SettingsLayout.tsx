import { Outlet } from 'react-router-dom'
import { AuthAppShell } from './AuthAppShell'
import { SettingsNav } from '../molecules/SettingsNav'

export const SettingsLayout = () => (
  <AuthAppShell
    activeSection="settings"
    title="Configurações"
    subtitle="Gerencie conta, segurança e preferências"
    settingsSidebar={<SettingsNav />}
  >
    <Outlet />
  </AuthAppShell>
)
