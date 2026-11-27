import type { ReactNode } from 'react'

export type FiscalNoteReaderMode = 'import' | 'link'

export type FiscalNoteCaptureTab = 'camera' | 'image' | 'manual'

export type FiscalNoteReaderStep = 'capture' | 'preview'

export interface FiscalNoteLinkTarget {
  id: string
  amountCents: number
  date: string
  description: string | null
}

export type FiscalNoteReaderSheetState =
  | { open: false }
  | { open: true; mode: 'import' }
  | { open: true; mode: 'link'; targetTransaction: FiscalNoteLinkTarget }

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
