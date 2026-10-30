export interface TransactionAttachment {
  id: string
  assetId: string
  position: number
  contentType: string
  sizeBytes: number
  url: string
  expiresAt: string
  cacheMaxAgeSeconds: number
}

export interface ReorderAttachmentItemDto {
  id: string
  position: number
}

export interface ReorderAttachmentsDto {
  positions: ReorderAttachmentItemDto[]
}

export const ATTACHMENT_MAX_FILES = 3
export const ATTACHMENT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
export const ATTACHMENT_ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export type AttachmentAllowedMimeType =
  (typeof ATTACHMENT_ALLOWED_MIME_TYPES)[number]

export const ATTACHMENT_ALLOWED_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
] as const
