import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

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
  <Card className="gap-4 border-0 bg-transparent py-0 shadow-none ring-0 sm:gap-5 sm:border sm:border-border sm:bg-card sm:py-5 sm:shadow-xs sm:ring-1">
    <CardHeader className="px-0 sm:px-6">
      <CardTitle className="text-base text-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 px-0 sm:px-6">
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
