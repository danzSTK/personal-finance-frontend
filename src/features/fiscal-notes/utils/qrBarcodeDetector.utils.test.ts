import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { detectMock, prepareZXingModuleMock, constructorOptionsSpy } =
  vi.hoisted(() => ({
    detectMock: vi.fn(),
    prepareZXingModuleMock: vi.fn(),
    constructorOptionsSpy: vi.fn(),
  }))

vi.mock('zxing-wasm/reader/zxing_reader.wasm?url', () => ({
  default: '/assets/zxing_reader.wasm',
}))

vi.mock('barcode-detector/ponyfill', () => {
  class MockBarcodeDetector {
    constructor(options?: unknown) {
      constructorOptionsSpy(options)
    }

    detect(source: unknown) {
      return detectMock(source)
    }
  }

  return {
    BarcodeDetector: MockBarcodeDetector,
    prepareZXingModule: prepareZXingModuleMock,
  }
})

import {
  createQrBarcodeDetector,
  decodeQrCodeFromImageFile,
  ensureQrBarcodeDetectorReady,
} from './qrBarcodeDetector.utils'

describe('qrBarcodeDetector.utils', () => {
  const originalCreateImageBitmap = globalThis.createImageBitmap
  const originalImage = globalThis.Image
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  beforeEach(() => {
    vi.clearAllMocks()
    prepareZXingModuleMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    globalThis.createImageBitmap = originalCreateImageBitmap
    globalThis.Image = originalImage
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  it('configura prepareZXingModule com locateFile local e cria detector apenas para qr_code', async () => {
    await ensureQrBarcodeDetectorReady()
    const detector = createQrBarcodeDetector()

    expect(prepareZXingModuleMock).toHaveBeenCalled()
    const firstCallArg = prepareZXingModuleMock.mock.calls[0][0] as {
      overrides: { locateFile: (path: string, prefix: string) => string }
      fireImmediately?: boolean
    }
    expect(firstCallArg.overrides.locateFile('zxing_reader.wasm', '/cdn/')).toBe(
      '/assets/zxing_reader.wasm'
    )
    expect(firstCallArg.overrides.locateFile('other.js', '/prefix/')).toBe(
      '/prefix/other.js'
    )
    expect(constructorOptionsSpy).toHaveBeenCalledWith({
      formats: ['qr_code'],
    })
    expect(detector).toBeDefined()
  })

  it('decodifica imagem via createImageBitmap e fecha o bitmap após leitura', async () => {
    const closeMock = vi.fn()
    const mockBitmap = { close: closeMock } as unknown as ImageBitmap
    globalThis.createImageBitmap = vi.fn().mockResolvedValue(mockBitmap)
    detectMock.mockResolvedValue([
      { rawValue: '   ' },
      { rawValue: ' https://nfce.sefaz.ce.gov.br/qr?p=2326|2|1|1|abc ' },
    ])

    const file = new File(['qr-bytes'], 'nfce.png', { type: 'image/png' })
    const decoded = await decodeQrCodeFromImageFile(file)

    expect(globalThis.createImageBitmap).toHaveBeenCalledWith(file)
    expect(detectMock).toHaveBeenCalledWith(mockBitmap)
    expect(closeMock).toHaveBeenCalledTimes(1)
    expect(decoded).toBe('https://nfce.sefaz.ce.gov.br/qr?p=2326|2|1|1|abc')
  })

  it('retorna null e fecha bitmap quando nenhum QR Code legível é encontrado', async () => {
    const closeMock = vi.fn()
    const mockBitmap = { close: closeMock } as unknown as ImageBitmap
    globalThis.createImageBitmap = vi.fn().mockResolvedValue(mockBitmap)
    detectMock.mockResolvedValue([])

    const file = new File(['no-qr'], 'empty.jpg', { type: 'image/jpeg' })
    const decoded = await decodeQrCodeFromImageFile(file)

    expect(decoded).toBeNull()
    expect(closeMock).toHaveBeenCalledTimes(1)
  })

  it('usa fallback HTMLImageElement quando createImageBitmap não existe e revoga ObjectURL', async () => {
    Object.defineProperty(globalThis, 'createImageBitmap', {
      value: undefined,
      configurable: true,
    })

    const createObjectUrlMock = vi.fn().mockReturnValue('blob:mock-qr-image')
    const revokeObjectUrlMock = vi.fn()
    URL.createObjectURL = createObjectUrlMock
    URL.revokeObjectURL = revokeObjectUrlMock

    class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_value: string) {
        queueMicrotask(() => {
          this.onload?.()
        })
      }
    }
    globalThis.Image = MockImage as unknown as typeof Image

    detectMock.mockResolvedValue([{ rawValue: '23261003539462000250651030000760541443208780' }])

    const file = new File(['qr-bytes'], 'nfce.webp', { type: 'image/webp' })
    const decoded = await decodeQrCodeFromImageFile(file)

    expect(createObjectUrlMock).toHaveBeenCalledWith(file)
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:mock-qr-image')
    expect(decoded).toBe('23261003539462000250651030000760541443208780')
  })

  it('revoga ObjectURL se o carregamento da imagem falhar no fallback', async () => {
    Object.defineProperty(globalThis, 'createImageBitmap', {
      value: undefined,
      configurable: true,
    })

    URL.createObjectURL = vi.fn().mockReturnValue('blob:broken-image')
    const revokeObjectUrlMock = vi.fn()
    URL.revokeObjectURL = revokeObjectUrlMock

    class BrokenImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_value: string) {
        queueMicrotask(() => {
          this.onerror?.()
        })
      }
    }
    globalThis.Image = BrokenImage as unknown as typeof Image

    const file = new File(['broken'], 'broken.png', { type: 'image/png' })

    await expect(decodeQrCodeFromImageFile(file)).rejects.toThrow(
      'Failed to load image file for QR code decoding.'
    )
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:broken-image')
  })
})
