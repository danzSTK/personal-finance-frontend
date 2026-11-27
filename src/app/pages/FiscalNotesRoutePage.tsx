import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAccounts } from '@/features/accounts/api/queries'
import { AuthAppShell } from '@/features/auth/components/templates/AuthAppShell'
import { AUTH_ROUTES } from '@/features/auth/constants/auth.constants'
import { useCategories } from '@/features/categories/api/queries'
import {
  FiscalNoteReaderSheet,
  FiscalNotesPage,
  type FiscalNoteAccountOption,
  type FiscalNoteCategoryOption,
  type FiscalNoteImportResponse,
} from '@/features/fiscal-notes'
import {
  ATTACHMENT_MAX_FILES,
  TRANSACTION_QUERY_KEYS,
  TransactionAccountSelect,
  TransactionCategorySelect,
  TransactionStagedAttachmentsField,
  uploadTransactionAttachments,
  type StagedTransactionAttachment,
} from '@/features/transactions'
import { toast } from '@/shared/hooks/use-toast'

/**
 * Thin route-level composer connecting the isolated `fiscal-notes` module with
 * `AuthAppShell`, account/category selectors, attachment staging, and transaction deep-links.
 */
export function FiscalNotesRoutePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isReaderOpen, setIsReaderOpen] = useState(false)
  const [stagedAttachments, setStagedAttachments] = useState<
    StagedTransactionAttachment[]
  >([])
  const stagedAttachmentsRef = useRef<StagedTransactionAttachment[]>([])
  stagedAttachmentsRef.current = stagedAttachments

  const clearStagedAttachments = useCallback(() => {
    stagedAttachmentsRef.current.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl)
    })
    setStagedAttachments([])
  }, [])

  useEffect(() => {
    return () => {
      stagedAttachmentsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl)
      })
    }
  }, [])

  const openFiscalNoteImport = useCallback(() => {
    clearStagedAttachments()
    setIsReaderOpen(true)
  }, [clearStagedAttachments])

  const closeFiscalNoteReader = useCallback(() => {
    clearStagedAttachments()
    setIsReaderOpen(false)
  }, [clearStagedAttachments])

  const { data: accounts = [] } = useAccounts()
  const { data: expenseCategoriesResponse } = useCategories({
    page: 1,
    limit: 100,
    type: 'EXPENSE',
    search: '',
    includeArchived: false,
  })

  const activeAccounts = useMemo(
    () => accounts.filter((account) => !account.isArchived),
    [accounts]
  )
  const expenseCategories = useMemo(
    () =>
      (expenseCategoriesResponse?.data ?? []).filter(
        (category) => !category.isArchived && category.type === 'EXPENSE'
      ),
    [expenseCategoriesResponse?.data]
  )
  const fiscalNoteAccounts = useMemo<FiscalNoteAccountOption[]>(
    () =>
      activeAccounts.map((account) => ({
        id: account.id,
        name: account.name,
        isArchived: account.isArchived,
        isDefault: account.isDefault,
      })),
    [activeAccounts]
  )
  const fiscalNoteCategories = useMemo<FiscalNoteCategoryOption[]>(
    () =>
      expenseCategories.map((category) => ({
        id: category.id,
        displayName: category.displayName,
        type: category.type,
        isArchived: category.isArchived,
      })),
    [expenseCategories]
  )

  const handleAddStagedFiles = (files: File[]) => {
    setStagedAttachments((current) => {
      const remaining = Math.max(ATTACHMENT_MAX_FILES - current.length, 0)
      const accepted = files.slice(0, remaining)
      const nextItems = accepted.map((file, idx) => ({
        id: `staged-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      return [...current, ...nextItems]
    })
  }

  const handleRemoveStagedFile = (id: string) => {
    setStagedAttachments((current) => {
      const target = current.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return current.filter((item) => item.id !== id)
    })
  }

  const handleAfterImport = async (result: FiscalNoteImportResponse) => {
    const filesToUpload = stagedAttachmentsRef.current.map((item) => item.file)
    if (filesToUpload.length === 0) {
      return
    }

    try {
      await uploadTransactionAttachments(result.transaction.id, filesToUpload)
      void queryClient.invalidateQueries({
        queryKey: TRANSACTION_QUERY_KEYS.attachments(result.transaction.id),
      })
      void queryClient.invalidateQueries({
        queryKey: TRANSACTION_QUERY_KEYS.transactions,
        exact: false,
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'NFC-e importada, mas o comprovante falhou',
        description:
          'A despesa e a nota fiscal foram salvas. Você pode enviar os comprovantes nos detalhes da despesa.',
      })
    } finally {
      clearStagedAttachments()
    }
  }

  const openTransactionInPage = useCallback(
    (transactionId: string) => {
      closeFiscalNoteReader()
      navigate(
        `${AUTH_ROUTES.transactions}?openTransaction=${encodeURIComponent(transactionId)}`
      )
    },
    [closeFiscalNoteReader, navigate]
  )

  return (
    <AuthAppShell
      activeSection="fiscal-notes"
      title="Notas fiscais"
      subtitle="NFC-e e histórico de compras"
    >
      <FiscalNotesPage
        onImportFiscalNote={openFiscalNoteImport}
        onOpenTransaction={openTransactionInPage}
      />

      <FiscalNoteReaderSheet
        open={isReaderOpen}
        mode="import"
        accounts={fiscalNoteAccounts}
        categories={fiscalNoteCategories}
        renderAccountField={({ value, onChange, disabled, invalid }) => (
          <TransactionAccountSelect
            accounts={activeAccounts}
            value={value}
            onValueChange={onChange}
            disabled={disabled}
            invalid={invalid}
            ariaLabel="Conta"
          />
        )}
        renderCategoryField={({ value, onChange, disabled, invalid }) => (
          <TransactionCategorySelect
            categories={expenseCategories}
            value={value}
            onValueChange={onChange}
            disabled={disabled}
            invalid={invalid}
            ariaLabel="Categoria"
          />
        )}
        renderAttachmentsField={({ disabled, isUploading }) => (
          <TransactionStagedAttachmentsField
            items={stagedAttachments}
            disabled={disabled}
            isUploading={isUploading}
            onAddFiles={handleAddStagedFiles}
            onRemove={handleRemoveStagedFile}
            onReorder={setStagedAttachments}
          />
        )}
        onAfterImport={handleAfterImport}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeFiscalNoteReader()
          }
        }}
        onOpenExistingTransaction={openTransactionInPage}
      />
    </AuthAppShell>
  )
}
