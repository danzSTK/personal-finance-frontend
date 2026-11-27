import {
  BarcodeDetector,
  prepareZXingModule,
} from 'barcode-detector/ponyfill'
import zxingReaderWasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'

const locateWasmFile = (path: string, prefix: string): string => {
  if (path.endsWith('.wasm')) {
    return zxingReaderWasmUrl
  }

  return `${prefix}${path}`
}

let isWasmConfigured = false
let readinessPromise: Promise<void> | null = null

const configureQrBarcodeDetectorWasm = (): void => {
  if (isWasmConfigured) {
    return
  }

  prepareZXingModule({
    overrides: {
      locateFile: locateWasmFile,
    },
  })
  isWasmConfigured = true
}

export const ensureQrBarcodeDetectorReady = async (): Promise<void> => {
  if (!readinessPromise) {
    readinessPromise = prepareZXingModule({
      overrides: {
        locateFile: locateWasmFile,
      },
      fireImmediately: true,
    })
      .then(() => {
        isWasmConfigured = true
      })
      .catch((error: unknown) => {
        readinessPromise = null
        throw error
      })
  }

  await readinessPromise
}

export const createQrBarcodeDetector = (): BarcodeDetector => {
  configureQrBarcodeDetectorWasm()
  return new BarcodeDetector({ formats: ['qr_code'] })
}

const loadImageElementFromFile = (
  file: File
): Promise<{ image: HTMLImageElement; revoke: () => void }> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      resolve({
        image,
        revoke: () => {
          URL.revokeObjectURL(objectUrl)
        },
      })
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image file for QR code decoding.'))
    }

    image.src = objectUrl
  })

const extractFirstQrRawValue = async (
  detector: BarcodeDetector,
  source: ImageBitmap | HTMLImageElement
): Promise<string | null> => {
  const results = await detector.detect(source)
  const match = results.find((result) => result.rawValue.trim().length > 0)
  return match ? match.rawValue.trim() : null
}

export const decodeQrCodeFromImageFile = async (
  file: File
): Promise<string | null> => {
  await ensureQrBarcodeDetectorReady()
  const detector = createQrBarcodeDetector()

  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file)
    try {
      return await extractFirstQrRawValue(detector, bitmap)
    } finally {
      bitmap.close()
    }
  }

  const { image, revoke } = await loadImageElementFromFile(file)
  try {
    return await extractFirstQrRawValue(detector, image)
  } finally {
    revoke()
  }
}
