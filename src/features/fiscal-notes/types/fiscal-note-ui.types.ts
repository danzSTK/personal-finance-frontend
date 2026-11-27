import type { ReactNode } from 'react'

export type FiscalNoteReaderMode = 'import' | 'link'

export type FiscalNoteCaptureTab = 'camera' | 'image' | 'manual'

export type FiscalNoteReaderStep = 'capture' | 'preview'

export interface FiscalNoteAccountOption {
  id: string
  name: string
  isArchived?: boolean
  isDefault?: boolean
}

export interface FiscalNoteCategoryOption {
  id: string
  displayName: string
  type: string
  isArchived?: boolean
}

export interface FiscalNoteLinkTarget {
  id: string
  amountCents: number
  date: string
  description: string | null
}

export type FiscalNoteReaderSheetState =
  | {
      open: boolean
      mode: 'import'
      targetTransaction?: null
    }
  | {
      open: boolean
      mode: 'link'
      targetTransaction: FiscalNoteLinkTarget | null
    }

export interface FiscalNoteDivergenceSummary {
  hasDivergence: boolean
  amountDiffers: boolean
  dateDiffers: boolean
  transactionAmountCents: number
  fiscalNoteAmountCents: number
  transactionDate: string
  fiscalNoteDate: string
}

export interface FiscalNoteAttachmentsFieldRenderProps {
  disabled: boolean
  isUploading: boolean
}

export type FiscalNoteAttachmentsFieldRenderer = (
  props: FiscalNoteAttachmentsFieldRenderProps
) => ReactNode
