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
  <Card className="border-0 bg-transparent shadow-none sm:border sm:border-border sm:bg-card sm:shadow-xs">
    <CardHeader className="px-0 pt-0 sm:p-6">
      <CardTitle className="text-base text-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 px-0 pb-0 sm:p-6 sm:pt-0">
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
