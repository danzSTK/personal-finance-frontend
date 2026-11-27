import { describe, expect, it } from 'vitest'
import {
  computeMod11CheckDigit,
  formatAccessKeyGroups,
  hasValidMod11CheckDigit,
  normalizeFiscalNoteSubmissionInput,
  parseFiscalNoteInput,
  stripNonDigits,
} from './fiscalNoteInput.utils'

const makeAccessKey = ({
  uf = '23',
  model = '65',
  suffix = '261003539462000250',
  tail = '103000076054144320878',
}: {
  uf?: string
  model?: string
  suffix?: string
  tail?: string
} = {}): string => {
  const first43 = `${uf}${suffix}${model}${tail}`
  if (first43.length !== 43) {
    throw new Error(`Expected 43 digits, got ${first43.length}`)
  }

  const checkDigit = computeMod11CheckDigit(first43)
  if (checkDigit === null) {
    throw new Error('Could not compute check digit')
  }

  return `${first43}${checkDigit}`
}

const VALID_CE_ACCESS_KEY = makeAccessKey()

describe('fiscalNoteInput.utils', () => {
  it('valida chave de 44 dígitos do Ceará (UF 23, modelo 65) com DV módulo 11 válido', () => {
    expect(hasValidMod11CheckDigit(VALID_CE_ACCESS_KEY)).toBe(true)

    const result = parseFiscalNoteInput(VALID_CE_ACCESS_KEY)
    expect(result).toEqual({
      valid: true,
      data: {
        accessKey: VALID_CE_ACCESS_KEY,
        uf: '23',
        model: '65',
        environment: '1',
        qrVersion: null,
        sourceType: 'access-key',
        normalizedInput: VALID_CE_ACCESS_KEY,
      },
    })
  })

  it('aceita chave de 44 dígitos formatada com espaços, hífens, pontos e quebras de linha', () => {
    const formatted = `${VALID_CE_ACCESS_KEY.slice(0, 4)}-${VALID_CE_ACCESS_KEY.slice(4, 16)}.${VALID_CE_ACCESS_KEY.slice(16, 28)} \n ${VALID_CE_ACCESS_KEY.slice(28)}`

    const result = parseFiscalNoteInput(formatted)
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.data.accessKey).toBe(VALID_CE_ACCESS_KEY)
      expect(result.data.normalizedInput).toBe(VALID_CE_ACCESS_KEY)
    }
  })

  it('rejeita chave com dígito verificador módulo 11 inválido', () => {
    const lastDigit = Number(VALID_CE_ACCESS_KEY[43])
    const wrongDigit = (lastDigit + 1) % 10
    const invalidKey = `${VALID_CE_ACCESS_KEY.slice(0, 43)}${wrongDigit}`

    const result = parseFiscalNoteInput(invalidKey)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error).toContain('dígito verificador')
    }
  })

  it('rejeita NF-e modelo 55 informando que apenas NFC-e modelo 65 é suportada', () => {
    const model55Key = makeAccessKey({ model: '55' })

    const result = parseFiscalNoteInput(model55Key)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error).toContain('modelo 65')
      expect(result.error).toContain('55')
    }
  })

  it('rejeita UF diferente de 23 (SEFAZ-CE)', () => {
    const spKey = makeAccessKey({ uf: '35' })

    const result = parseFiscalNoteInput(spKey)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error).toContain('Ceará')
      expect(result.error).toContain('23')
    }
  })

  it('aceita URL de QR Code v2 normal e v2 contingência (8 campos)', () => {
    const normalUrl = `http://nfce.sefaz.ce.gov.br/nfce/pagina?p=${VALID_CE_ACCESS_KEY}|2|1|1|ABCDEF123456`
    const contingencyUrl = `https://nfce.sefaz.ce.gov.br/nfce/pagina?p=${VALID_CE_ACCESS_KEY}|2|1|15|31.41|646967657374|1|HASH123`

    const normalResult = parseFiscalNoteInput(normalUrl)
    const contingencyResult = parseFiscalNoteInput(contingencyUrl)

    expect(normalResult.valid).toBe(true)
    if (normalResult.valid) {
      expect(normalResult.data.sourceType).toBe('url')
      expect(normalResult.data.qrVersion).toBe('2')
      expect(normalResult.data.normalizedInput).toBe(normalUrl)
    }

    expect(contingencyResult.valid).toBe(true)
    if (contingencyResult.valid) {
      expect(contingencyResult.data.qrVersion).toBe('2')
      expect(contingencyResult.data.accessKey).toBe(VALID_CE_ACCESS_KEY)
    }
  })

  it('aceita URL de QR Code v3 inclusive com parâmetro p URL-encoded', () => {
    const encodedUrl = `https://nfce.sefaz.ce.gov.br/nfce/pagina?P=${VALID_CE_ACCESS_KEY}%7C3%7C1%7CASSINATURA`

    const result = parseFiscalNoteInput(encodedUrl)
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.data.sourceType).toBe('url')
      expect(result.data.qrVersion).toBe('3')
      expect(result.data.accessKey).toBe(VALID_CE_ACCESS_KEY)
    }
  })

  it('aceita payload p separado por pipe diretamente (com ou sem prefixo p=)', () => {
    const directPayload = `${VALID_CE_ACCESS_KEY}|2|1|1|HASH`
    const prefixedPayload = `p=${VALID_CE_ACCESS_KEY}|3|1|SIG`

    const directResult = parseFiscalNoteInput(directPayload)
    const prefixedResult = parseFiscalNoteInput(prefixedPayload)

    expect(directResult.valid).toBe(true)
    expect(prefixedResult.valid).toBe(true)
    if (prefixedResult.valid) {
      expect(prefixedResult.data.sourceType).toBe('payload')
      expect(prefixedResult.data.qrVersion).toBe('3')
      expect(prefixedResult.data.normalizedInput).toBe(
        `${VALID_CE_ACCESS_KEY}|3|1|SIG`
      )
    }
  })

  it('rejeita nota em ambiente de homologação (tpAmb = 2)', () => {
    const homologationPayload = `${VALID_CE_ACCESS_KEY}|2|2|1|HASH`
    const homologationUrl = `http://nfce.sefaz.ce.gov.br/nfce/pagina?p=${VALID_CE_ACCESS_KEY}|3|2|SIG`

    const payloadResult = parseFiscalNoteInput(homologationPayload)
    const urlResult = parseFiscalNoteInput(homologationUrl)

    expect(payloadResult.valid).toBe(false)
    expect(urlResult.valid).toBe(false)
    if (!payloadResult.valid) {
      expect(payloadResult.error).toContain('homologação')
    }
  })

  it('rejeita entrada vazia, acima de 1024 caracteres ou esquema não HTTP', () => {
    expect(parseFiscalNoteInput('   ').valid).toBe(false)
    expect(parseFiscalNoteInput('a'.repeat(1025)).valid).toBe(false)
    expect(
      parseFiscalNoteInput(`ftp://nfce.sefaz.ce.gov.br/?p=${VALID_CE_ACCESS_KEY}|2|1|1|H`)
        .valid
    ).toBe(false)
  })

  it('formata chave em blocos de 4 dígitos e normaliza entrada para envio', () => {
    expect(stripNonDigits('2326 1003-5394.62')).toBe('23261003539462')
    expect(formatAccessKeyGroups('232610035394')).toBe('2326 1003 5394')
    expect(formatAccessKeyGroups(VALID_CE_ACCESS_KEY).split(' ')).toHaveLength(11)

    const formattedKey = formatAccessKeyGroups(VALID_CE_ACCESS_KEY)
    expect(normalizeFiscalNoteSubmissionInput(formattedKey)).toBe(
      VALID_CE_ACCESS_KEY
    )
  })
})
