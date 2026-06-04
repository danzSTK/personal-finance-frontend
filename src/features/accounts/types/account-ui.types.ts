import type { Account } from './account.types'

export type AccountSheetState =
  | { mode: 'create'; account?: never }
  | { mode: 'edit'; account: Account }
  | null
