export type AccountType = 'CASH' | 'BANK' | 'CREDIT_CARD' | 'INVESTMENT'

export type UserCreatableAccountType = Exclude<AccountType, 'CASH'>

export interface AccountBalance {
  currentCents: number
  projectedCents?: number
  projectedUntil?: string
}

export interface Account {
  id: string
  name: string
  type: AccountType
  initialBalanceCents: number
  color: string | null
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
  color?: string | null
  icon?: string | null
  includeInTotal?: boolean
  isDefault?: boolean
}

export interface UpdateAccountDto {
  name?: string
  type?: AccountType
  color?: string | null
  icon?: string | null
  includeInTotal?: boolean
}

export interface ListAccountsParams {
  includeArchived?: boolean
  projectedUntil?: string
}
