import { APP_BRAND } from '@/shared/config/brand'
import { cn } from '@/shared/lib/utils'

type BrandLogoVariant = 'wordmark' | 'icon'
type BrandLogoTone = 'light' | 'dark'

interface BrandLogoProps {
  className?: string
  decorative?: boolean
  tone?: BrandLogoTone
  variant?: BrandLogoVariant
}

const getBrandLogoSource = (
  variant: BrandLogoVariant,
  tone: BrandLogoTone
) => {
  if (variant === 'icon') {
    return APP_BRAND.assets.local.icon
  }

  return tone === 'light'
    ? APP_BRAND.assets.local.wordmarkLight
    : APP_BRAND.assets.local.wordmarkDark
}

export const BrandLogo = ({
  className,
  decorative = false,
  tone = 'light',
  variant = 'wordmark',
}: BrandLogoProps) => (
  <img
    src={getBrandLogoSource(variant, tone)}
    alt={decorative ? '' : APP_BRAND.name}
    aria-hidden={decorative || undefined}
    className={cn(
      'block h-auto shrink-0 object-contain',
      variant === 'icon' ? 'aspect-square' : 'w-auto',
      className
    )}
    draggable={false}
  />
)
