import {
  FISCAL_NOTE_ACCESS_KEY_LENGTH,
  FISCAL_NOTE_CE_UF_CODE,
  FISCAL_NOTE_INPUT_MAX_LENGTH,
  FISCAL_NOTE_MODEL_CODE,
} from '../constants/fiscal-notes.constants'

const HTTP_URL_SCHEME_REGEX = /^https?:\/\//i
const ANY_URL_SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:\/\//i
const NON_DIGIT_REGEX = /\D/g
const ACCESS_KEY_DATA_LENGTH = 43
const UF_START = 0
const UF_END = 2
const MODEL_START = 20
const MODEL_END = 22
const QR_V2_NORMAL_PARTS = 5
const QR_V2_CONTINGENCY_PARTS = 8
const QR_V3_MIN_PARTS = 3

export type FiscalNoteInputSourceType = 'url' | 'payload' | 'access-key'

export interface ParsedFiscalNoteInput {
  accessKey: string
  uf: string
  model: string
  environment: '1' | '2'
  qrVersion: '2' | '3' | null
  sourceType: FiscalNoteInputSourceType
  normalizedInput: string
}

export type FiscalNoteInputParseResult =
  | { valid: true; data: ParsedFiscalNoteInput }
  | { valid: false; error: string }

export const stripNonDigits = (value: string): string =>
  value.replace(NON_DIGIT_REGEX, '')

export const formatAccessKeyGroups = (value: string): string => {
  const digits = stripNonDigits(value).slice(0, FISCAL_NOTE_ACCESS_KEY_LENGTH)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

export const computeMod11CheckDigit = (dataDigits: string): number | null => {
  if (!/^\d{43}$/.test(dataDigits)) {
    return null
  }

  let sum = 0
  let weight = 2

  for (let index = ACCESS_KEY_DATA_LENGTH - 1; index >= 0; index -= 1) {
    sum += Number(dataDigits[index]) * weight
    weight = weight === 9 ? 2 : weight + 1
  }

  const remainder = sum % 11
  return remainder === 0 || remainder === 1 ? 0 : 11 - remainder
}

export const hasValidMod11CheckDigit = (accessKey: string): boolean => {
  if (!/^\d{44}$/.test(accessKey)) {
    return false
  }

  const expectedDigit = computeMod11CheckDigit(
    accessKey.slice(0, ACCESS_KEY_DATA_LENGTH)
  )

  return expectedDigit !== null && Number(accessKey[ACCESS_KEY_DATA_LENGTH]) === expectedDigit
}

const tryDecodeUriComponent = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

interface ExtractedPayload {
  accessKey: string
  environment: '1' | '2'
  qrVersion: '2' | '3' | null
  sourceType: FiscalNoteInputSourceType
  normalizedInput: string
}

type ExtractResult =
  | { ok: true; value: ExtractedPayload }
  | { ok: false; error: string }

const parsePipePayload = (
  payload: string,
  sourceType: 'url' | 'payload',
  normalizedInput: string
): ExtractResult => {
  const parts = payload.split('|').map((part) => part.trim())

  if (parts.length < QR_V3_MIN_PARTS) {
    return {
      ok: false,
      error: 'O payload do QR Code da NFC-e está incompleto ou malformado.',
    }
  }

  const accessKey = stripNonDigits(parts[0] ?? '')
  const version = parts[1] ?? ''
  const environment = parts[2] ?? ''

  if (environment === '2') {
    return {
      ok: false,
      error:
        'Notas fiscais emitidas em ambiente de homologação (teste) não são permitidas.',
    }
  }

  if (environment !== '1') {
    return {
      ok: false,
      error: 'Ambiente fiscal inválido no payload do QR Code da NFC-e.',
    }
  }

  if (version === '2') {
    if (parts.length === QR_V2_NORMAL_PARTS) {
      const cscId = parts[3] ?? ''
      const qrHash = parts[4] ?? ''
      if (!cscId || !qrHash) {
        return {
          ok: false,
          error:
            'O payload do QR Code v2 está incompleto (CSC ou hash ausente).',
        }
      }

      return {
        ok: true,
        value: {
          accessKey,
          environment: '1',
          qrVersion: '2',
          sourceType,
          normalizedInput,
        },
      }
    }

    if (parts.length === QR_V2_CONTINGENCY_PARTS) {
      const contingencyIssueDay = parts[3] ?? ''
      const contingencyTotalAmount = parts[4] ?? ''
      const contingencyDigestValue = parts[5] ?? ''
      const cscId = parts[6] ?? ''
      const qrHash = parts[7] ?? ''

      if (
        !contingencyIssueDay ||
        !contingencyTotalAmount ||
        !cscId ||
        !qrHash
      ) {
        return {
          ok: false,
          error:
            'O payload do QR Code v2 em contingência está com campos obrigatórios ausentes.',
        }
      }

      return {
        ok: true,
        value: {
          accessKey,
          environment: '1',
          qrVersion: '2',
          sourceType,
          normalizedInput: contingencyDigestValue ? normalizedInput : accessKey,
        },
      }
    }

    return {
      ok: false,
      error: 'Quantidade de campos inválida para o QR Code v2 da NFC-e.',
    }
  }

  if (version === '3') {
    return {
      ok: true,
      value: {
        accessKey,
        environment: '1',
        qrVersion: '3',
        sourceType,
        normalizedInput,
      },
    }
  }

  return {
    ok: false,
    error: 'Versão de QR Code não suportada. Utilize uma NFC-e v2 ou v3.',
  }
}

const extractPayloadFromQrUrl = (rawUrl: string): ExtractResult => {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(rawUrl)
  } catch {
    return {
      ok: false,
      error:
        'URL do QR Code inválida. Confira se o endereço foi colado por completo.',
    }
  }

  if (!parsedUrl.hostname) {
    return {
      ok: false,
      error: 'A URL do QR Code precisa conter um endereço válido.',
    }
  }

  let qrPayload: string | null = null
  for (const [key, value] of parsedUrl.searchParams.entries()) {
    if (key.toLowerCase() === 'p') {
      qrPayload = value.trim()
      break
    }
  }

  if (!qrPayload) {
    return {
      ok: false,
      error:
        'A URL informada não contém o parâmetro "p" do QR Code da NFC-e.',
    }
  }

  const decodedPayload = qrPayload.includes('|')
    ? qrPayload
    : tryDecodeUriComponent(qrPayload)

  if (!decodedPayload.includes('|')) {
    return {
      ok: false,
      error: 'O parâmetro "p" do QR Code está incompleto ou malformado.',
    }
  }

  return parsePipePayload(decodedPayload, 'url', rawUrl)
}

const extractInput = (trimmed: string): ExtractResult => {
  if (HTTP_URL_SCHEME_REGEX.test(trimmed)) {
    return extractPayloadFromQrUrl(trimmed)
  }

  if (ANY_URL_SCHEME_REGEX.test(trimmed)) {
    return {
      ok: false,
      error: 'Use uma URL HTTP ou HTTPS válida do QR Code da NFC-e.',
    }
  }

  const hasDirectPayloadPrefix = /^p=/i.test(trimmed)
  const hasEncodedPipe = /%7c/i.test(trimmed)

  if (trimmed.includes('|') || hasDirectPayloadPrefix || hasEncodedPipe) {
    const withoutPrefix = trimmed.replace(/^p=/i, '').trim()
    const decodedPayload = withoutPrefix.includes('|')
      ? withoutPrefix
      : tryDecodeUriComponent(withoutPrefix)

    return parsePipePayload(decodedPayload, 'payload', decodedPayload)
  }

  const digitsOnly = stripNonDigits(trimmed)
  if (digitsOnly.length !== FISCAL_NOTE_ACCESS_KEY_LENGTH) {
    return {
      ok: false,
      error: 'A chave de acesso deve conter exatamente 44 dígitos numéricos.',
    }
  }

  return {
    ok: true,
    value: {
      accessKey: digitsOnly,
      environment: '1',
      qrVersion: null,
      sourceType: 'access-key',
      normalizedInput: digitsOnly,
    },
  }
}

export const parseFiscalNoteInput = (
  raw: string
): FiscalNoteInputParseResult => {
  if (typeof raw !== 'string') {
    return {
      valid: false,
      error: 'Informe a URL do QR Code ou a chave de acesso de 44 dígitos.',
    }
  }

  const trimmed = raw.trim()
  if (!trimmed) {
    return {
      valid: false,
      error: 'Informe a URL do QR Code ou a chave de acesso de 44 dígitos.',
    }
  }

  if (trimmed.length > FISCAL_NOTE_INPUT_MAX_LENGTH) {
    return {
      valid: false,
      error: `O código informado excede o limite de ${FISCAL_NOTE_INPUT_MAX_LENGTH} caracteres.`,
    }
  }

  const extracted = extractInput(trimmed)
  if (!extracted.ok) {
    return {
      valid: false,
      error: extracted.error,
    }
  }

  const { accessKey, environment, qrVersion, sourceType, normalizedInput } =
    extracted.value

  if (!/^\d{44}$/.test(accessKey)) {
    return {
      valid: false,
      error: 'A chave de acesso deve conter exatamente 44 dígitos numéricos.',
    }
  }

  const model = accessKey.slice(MODEL_START, MODEL_END)
  if (model === '55') {
    return {
      valid: false,
      error:
        'Apenas NFC-e (modelo 65) é suportada. Notas modelo 55 (NF-e) não são aceitas.',
    }
  }

  if (model !== FISCAL_NOTE_MODEL_CODE) {
    return {
      valid: false,
      error: `Modelo fiscal inválido (${model}). Apenas NFC-e (modelo ${FISCAL_NOTE_MODEL_CODE}) é suportada.`,
    }
  }

  if (!hasValidMod11CheckDigit(accessKey)) {
    return {
      valid: false,
      error:
        'O dígito verificador da chave de acesso é inválido. Confira os 44 dígitos.',
    }
  }

  const uf = accessKey.slice(UF_START, UF_END)
  if (uf !== FISCAL_NOTE_CE_UF_CODE) {
    return {
      valid: false,
      error:
        'Atualmente apenas notas fiscais emitidas no Ceará (SEFAZ-CE, UF 23) são suportadas.',
    }
  }

  return {
    valid: true,
    data: {
      accessKey,
      uf,
      model,
      environment,
      qrVersion,
      sourceType,
      normalizedInput,
    },
  }
}

export const normalizeFiscalNoteSubmissionInput = (raw: string): string => {
  const parsed = parseFiscalNoteInput(raw)
  return parsed.valid ? parsed.data.normalizedInput : raw.trim()
}
