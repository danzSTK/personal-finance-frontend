import { Card, CardContent, CardHeader, CardTitle } from '@/shared/lib/card'

interface SettingsPlaceholderProps {
  title: string
  description: string
  items: string[]
}

export const SettingsPlaceholder = ({
  title,
  description,
  items,
}: SettingsPlaceholderProps) => (
  <Card className="border-app-border bg-app-surface">
    <CardHeader>
      <CardTitle className="text-base text-app-text">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm text-app-muted">{description}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-xl border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text"
          >
            {item}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)
