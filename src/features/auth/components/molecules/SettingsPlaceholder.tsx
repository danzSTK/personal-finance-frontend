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
  <Card className="border-border bg-card">
    <CardHeader>
      <CardTitle className="text-base text-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground"
          >
            {item}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)
