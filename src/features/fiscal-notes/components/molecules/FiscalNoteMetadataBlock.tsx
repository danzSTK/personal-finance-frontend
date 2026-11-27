import { useEffect, useState } from 'react'
import { Check, ChevronDown, Copy } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import { toast } from '@/shared/hooks/use-toast'
import { cn } from '@/shared/lib/utils'
import { formatDateTime } from '@/shared/utils/formatters'
import type { FiscalNotePreviewDetail } from '../../types/fiscal-note.types'
import {
  formatCnpj,
  formatFiscalNoteNumberAndSeries,
} from '../../utils/fiscalNoteFormat.utils'
import { formatAccessKeyGroups } from '../../utils/fiscalNoteInput.utils'

export interface FiscalNoteMetadataBlockProps {
  fiscalNote: Pick<
    FiscalNotePreviewDetail,
    | 'issuerName'
    | 'issuerCnpj'
    | 'issuerAddress'
    | 'number'
    | 'series'
    | 'issuedAt'
    | 'protocol'
    | 'accessKey'
  >
  defaultOpen?: boolean
  className?: string
}

/**
 * Collapsible fiscal metadata section with issuer info, SEFAZ protocol, and copyable 44-digit key.
 */
export function FiscalNoteMetadataBlock({
  fiscalNote,
  defaultOpen = true,
  className,
}: FiscalNoteMetadataBlockProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timer = window.setTimeout(() => {
      setCopied(false)
    }, 2000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [copied])

  const handleCopyAccessKey = async () => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.clipboard ||
      typeof navigator.clipboard.writeText !== 'function'
    ) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível copiar',
        description:
          'A área de transferência não está disponível neste navegador.',
      })
      return
    }

    try {
      await navigator.clipboard.writeText(fiscalNote.accessKey)
      setCopied(true)
    } catch {
      toast({
        variant: 'destructive',
        title: 'Não foi possível copiar',
        description: 'Selecione a chave manualmente para copiar.',
      })
    }
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        'rounded-2xl border border-border bg-secondary',
        className
      )}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-xs font-medium uppercase tracking-normal text-muted-foreground transition hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>Dados fiscais da NFC-e</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              open && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t border-border px-4 py-3">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Emitente</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {fiscalNote.issuerName}
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">CNPJ</dt>
              <dd className="numeric mt-0.5 font-medium text-foreground">
                {formatCnpj(fiscalNote.issuerCnpj)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Documento</dt>
              <dd className="numeric mt-0.5 font-medium text-foreground">
                {formatFiscalNoteNumberAndSeries(
                  fiscalNote.number,
                  fiscalNote.series
                )}
              </dd>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Emissão</dt>
              <dd className="numeric mt-0.5 font-medium text-foreground">
                {formatDateTime(fiscalNote.issuedAt)}
              </dd>
            </div>
            {fiscalNote.protocol ? (
              <div>
                <dt className="text-xs text-muted-foreground">
                  Protocolo SEFAZ
                </dt>
                <dd className="numeric mt-0.5 font-medium break-all text-foreground">
                  {fiscalNote.protocol}
                </dd>
              </div>
            ) : null}
          </div>

          {fiscalNote.issuerAddress ? (
            <div>
              <dt className="text-xs text-muted-foreground">Endereço</dt>
              <dd className="mt-0.5 text-xs leading-5 text-foreground">
                {fiscalNote.issuerAddress}
              </dd>
            </div>
          ) : null}

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-xs text-muted-foreground">Chave de acesso</dt>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-border bg-card px-2.5 text-xs text-foreground hover:bg-accent"
                onClick={handleCopyAccessKey}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-state-income" />
                    Chave copiada
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar chave
                  </>
                )}
              </Button>
            </div>
            <dd className="numeric rounded-xl border border-border bg-card px-3 py-2 text-xs leading-5 break-all text-foreground">
              {formatAccessKeyGroups(fiscalNote.accessKey)}
            </dd>
          </div>
        </dl>
      </CollapsibleContent>
    </Collapsible>
  )
}
