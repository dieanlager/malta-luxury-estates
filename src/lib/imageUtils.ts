const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const BASE = CLOUD_NAME
  ? `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch`
  : null;

export type ImageVariant = 'thumb' | 'card' | 'hero' | 'og';

const VARIANTS: Record<ImageVariant, string> = {
  thumb: 'w_400,h_300,c_fill,f_auto,q_auto',
  card: 'w_800,h_600,c_fill,f_auto,q_auto',
  hero: 'w_1600,h_900,c_fill,f_auto,q_auto',
  og: 'w_1200,h_630,c_fill,f_auto,q_auto',
};

const PLACEHOLDER = '/assets/placeholder-property.jpg';

export function getImageUrl(
  rawUrl: string | undefined,
  variant: ImageVariant = 'card',
): string {
  if (!rawUrl) return PLACEHOLDER;
  // If Cloudinary is not configured, return original URL
  if (!BASE) return rawUrl;
  // Avoid double-wrapping existing Cloudinary URLs
  if (rawUrl.includes('res.cloudinary.com')) return rawUrl;

  const transform = VARIANTS[variant] ?? VARIANTS.card;
  return `${BASE}/${transform}/${encodeURIComponent(rawUrl)}`;
}

export function getSrcSet(rawUrl: string | undefined): string | undefined {
  if (!rawUrl || !BASE) return undefined;
  if (rawUrl.includes('res.cloudinary.com')) return undefined;

  const widths = [400, 800, 1200, 1600];
  return widths
    .map(
      (w) =>
        `${BASE}/w_${w},f_auto,q_auto/${encodeURIComponent(rawUrl)} ${w}w`,
    )
    .join(', ');
}

