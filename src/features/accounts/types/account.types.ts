export type AccountType = 'CASH' | 'BANK' | 'CREDIT_CARD' | 'INVESTMENT'

export type UserCreatableAccountType = Exclude<AccountType, 'CASH'>

export interface Account {
  id: string
  name: string
  type: AccountType
  initialBalance: number
  color: string | null
  icon: string | null
  includeInTotal: boolean
  isArchived: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAccountDto {
  name: string
  type: UserCreatableAccountType
  initialBalance?: number
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
}
