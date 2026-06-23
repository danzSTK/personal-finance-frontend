export const API_ERROR_CODES = {
  validation: 'VALIDATION_ERROR',
  unauthorized: 'UNAUTHORIZED',
  internalServer: 'INTERNAL_SERVER_ERROR',

  authProviderAlreadyLinked: 'AUTH_PROVIDER_ALREADY_LINKED',
  authProviderLinkedToAnotherUser: 'AUTH_PROVIDER_LINKED_TO_ANOTHER_USER',
  invalidAccessToken: 'INVALID_ACCESS_TOKEN',
  invalidRefreshToken: 'INVALID_REFRESH_TOKEN',
  potentialSessionHijacking: 'POTENTIAL_SESSION_HIJACKING',
  sessionNotFound: 'SESSION_NOT_FOUND',

  invalidUsernameFormat: 'INVALID_USERNAME_FORMAT',
  avatarFileTooLarge: 'AVATAR_FILE_TOO_LARGE',
  avatarUploadFailed: 'AVATAR_UPLOAD_FAILED',
  invalidAvatarImage: 'INVALID_AVATAR_IMAGE',
  payloadTooLarge: 'PAYLOAD_TOO_LARGE',
  unsupportedAvatarFile: 'UNSUPPORTED_AVATAR_FILE',
  userEmailAlreadyExists: 'USER_EMAIL_ALREADY_EXISTS',
  usernameAlreadyExists: 'USERNAME_ALREADY_EXISTS',
  userNotFound: 'USER_NOT_FOUND',
  userUpdateInputVoid: 'USER_UPDATE_INPUT_VOID',
  invalidUser: 'INVALID_USER',

  accountAlreadyDefault: 'ACCOUNT_ALREADY_DEFAULT',
  accountArchived: 'ACCOUNT_ARCHIVED',
  accountArchivedMutation: 'ACCOUNT_ARCHIVED_MUTATION',
  accountCannotBeArchived: 'ACCOUNT_CANNOT_BE_ARCHIVED',
  accountCannotBeDefault: 'ACCOUNT_CANNOT_BE_DEFAULT',
  accountHasScheduledTransactions: 'ACCOUNT_HAS_SCHEDULED_TRANSACTIONS',
  accountMustRemainActive: 'ACCOUNT_MUST_REMAIN_ACTIVE',
  accountNotArchived: 'ACCOUNT_NOT_ARCHIVED',
  accountNotFound: 'ACCOUNT_NOT_FOUND',
  accountUpdateEmpty: 'ACCOUNT_UPDATE_EMPTY',
  invalidAccount: 'INVALID_ACCOUNT',
  invalidAccountName: 'INVALID_ACCOUNT_NAME',

  categoryHasTransactions: 'CATEGORY_HAS_TRANSACTIONS',
  categoryInvalidListQuery: 'CATEGORY_INVALID_LIST_QUERY',
  categoryInvalidMerge: 'CATEGORY_INVALID_MERGE',
  categoryNameAlreadyExists: 'CATEGORY_NAME_ALREADY_EXISTS',
  categoryNotFound: 'CATEGORY_NOT_FOUND',
  categoryNotManageable: 'CATEGORY_NOT_MANAGEABLE',
  categoryUpdateEmpty: 'CATEGORY_UPDATE_EMPTY',
  invalidCategory: 'INVALID_CATEGORY',
  technicalCategoryCannotBeCreated: 'TECHNICAL_CATEGORY_CANNOT_BE_CREATED',
} as const

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]

export const API_ERROR_CODE_VALUES = new Set<string>(
  Object.values(API_ERROR_CODES)
)
