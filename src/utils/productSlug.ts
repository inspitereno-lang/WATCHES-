/**
 * Utility functions for generating and parsing product URL slugs.
 */

export function createProductSlug(name?: string | null): string {
  if (!name || typeof name !== 'string') return ''
  return name
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getProductUrl(product: { id: number | string; name?: string | null }): string {
  if (!product) return '/watches'
  if (product.name) {
    const slug = createProductSlug(product.name)
    if (slug) return `/product/${slug}`
  }
  return `/product/${product.id}`
}

export function extractProductId(slugOrId?: string | null): number | null {
  if (!slugOrId) return null
  const trimmed = slugOrId.trim()
  const match = trimmed.match(/^(\d+)(?:-.*)?$/)
  if (match) {
    const parsed = parseInt(match[1], 10)
    if (!isNaN(parsed) && parsed > 0) return parsed
  }
  return null
}
