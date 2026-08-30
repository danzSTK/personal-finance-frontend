export type AccountType = 'CASH' | 'BANK' | 'CREDIT_CARD' | 'INVESTMENT'

export type UserCreatableAccountType = Exclude<AccountType, 'CASH'>

export type AccountTemplateType = 'INSTITUTIONAL' | 'CUSTOM'

export interface AccountTemplate {
  object: 'account_template.item'
  id: string
  type: AccountTemplateType
  name: string
  colorToken: string | null
  iconKey: string | null
  logoUrl: string | null
  bankCode: number | null
  ispb: string | null
}

export type AccountTemplateInput =
  | { type: 'institutional'; templateId: string }
  | { type: 'custom'; colorToken?: string | null; iconKey?: string | null }

export interface AccountBalance {
  currentCents: number
  projectedCents?: number
  projectedUntil?: string
}

export interface AccountSummary {
  object: 'account.summary'
  currentCents: number
  projectedCents?: number
  projectedUntil?: string
}

export interface Account {
  object: 'account.item'
  id: string
  name: string
  type: AccountType
  initialBalanceCents: number
  templateId: string | null
  template: AccountTemplate | null
  /** @deprecated Compatibility fallback while DB-COMPAT-002 is active. */
  color: string | null
  /** @deprecated Compatibility fallback while DB-COMPAT-002 is active. */
  icon: string | null
  includeInTotal: boolean
  isArchived: boolean
  isDefault: boolean
  balance: AccountBalance
  createdAt: string
  updatedAt: string
}

export interface CreateAccountDto {
  name: string
  type: UserCreatableAccountType
  initialBalanceCents?: number
  template: AccountTemplateInput
  includeInTotal?: boolean
  isDefault?: boolean
}

export interface UpdateAccountDto {
  name?: string
  type?: AccountType
  template?: AccountTemplateInput
  includeInTotal?: boolean
}

export interface ListAccountsParams {
  includeArchived?: boolean
  projectedUntil?: string
}

export interface GetAccountSummaryParams {
  includeArchived?: boolean
  includeExcludedFromTotal?: boolean
  projectedUntil?: string
}
