import type { Area } from 'react-easy-crop'

export const AVATAR_ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const AVATAR_INPUT_MAX_BYTES = 10 * 1024 * 1024
export const AVATAR_OUTPUT_SIZE = 512

export const AVATAR_FILE_ACCEPT = AVATAR_ACCEPTED_MIME_TYPES.join(',')

export type AvatarFileValidation =
  | { isValid: true }
  | { isValid: false; message: string }

export const validateAvatarFile = (file: File): AvatarFileValidation => {
  if (!AVATAR_ACCEPTED_MIME_TYPES.includes(file.type as AcceptedAvatarMime)) {
    return {
      isValid: false,
      message: 'Use uma foto em JPEG, PNG ou WebP.',
    }
  }

  if (file.size > AVATAR_INPUT_MAX_BYTES) {
    return {
      isValid: false,
      message: 'Escolha uma imagem de até 10 MB para ajustar a foto.',
    }
  }

  return { isValid: true }
}

export const createCroppedAvatarFile = async (
  imageSrc: string,
  pixelCrop: Area
): Promise<File> => {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas context is not available.')
  }

  canvas.width = AVATAR_OUTPUT_SIZE
  canvas.height = AVATAR_OUTPUT_SIZE

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE
  )

  const blob = await canvasToBlob(canvas)

  return new File([blob], 'avatar.webp', {
    type: 'image/webp',
    lastModified: Date.now(),
  })
}

type AcceptedAvatarMime = (typeof AVATAR_ACCEPTED_MIME_TYPES)[number]

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () =>
      reject(new Error('Could not load avatar image.'))
    )
    image.src = src
  })

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not crop avatar image.'))
          return
        }

        resolve(blob)
      },
      'image/webp',
      0.92
    )
  })
