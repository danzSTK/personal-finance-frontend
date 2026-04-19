import { isAxiosError } from 'axios'

type ApiMessage = string | string[]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const extractApiMessage = (value: unknown): ApiMessage | null => {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value
  }

  return null
}

const extractMessageFromData = (data: unknown): ApiMessage | null => {
  if (!isRecord(data) || !('message' in data)) {
    return null
  }

  return extractApiMessage(data.message)
}

export const extractApiErrorMessage = (error: unknown): string | null => {
  if (isAxiosError(error)) {
    const responseMessage = extractMessageFromData(error.response?.data)

    if (Array.isArray(responseMessage)) {
      return responseMessage.join(', ')
    }

    if (typeof responseMessage === 'string' && responseMessage.trim() !== '') {
      return responseMessage
    }

    if (typeof error.message === 'string' && error.message.trim() !== '') {
      return error.message
    }

    return null
  }

  if (error instanceof Error && error.message.trim() !== '') {
    return error.message
  }

  if (typeof error === 'string' && error.trim() !== '') {
    return error
  }

  return null
}

export const resolveApiErrorMessage = (error: unknown, fallbackMessage: string): string =>
  extractApiErrorMessage(error) ?? fallbackMessage
