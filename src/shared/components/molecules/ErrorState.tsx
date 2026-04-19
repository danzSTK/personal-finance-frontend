import { AlertCircle } from 'lucide-react'
import { Button } from '@/shared/lib/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/lib/card'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Algo deu errado',
  message = 'Ocorreu um erro ao carregar os dados. Por favor, tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">{title}</CardTitle>
        </div>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button onClick={onRetry} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
