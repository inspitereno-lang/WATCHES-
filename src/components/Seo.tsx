import { useEffect } from 'react'

interface SeoProps {
  title: string
  description: string
  canonicalPath?: string
  image?: string
  type?: 'website' | 'article'
  structuredData?: Record<string, unknown>
}

const setMeta = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

export default function Seo({
  title,
  description,
  canonicalPath,
  image,
  type = 'website',
  structuredData,
}: SeoProps) {
  useEffect(() => {
    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', description)
    document.head.querySelector('meta[name="keywords"]')?.remove()

    const canonicalUrl = new URL(canonicalPath || window.location.pathname, `${import.meta.env.VITE_SITE_URL}/`).toString()
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl

    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:type"]', 'property', 'og:type', type)
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)

    if (image) {
      const imageUrl = new URL(image, `${import.meta.env.VITE_SITE_URL}/`).toString()
      setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl)
      setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl)
    }

    const existingSchema = document.head.querySelector<HTMLScriptElement>('script[data-t24-seo-schema]')
    existingSchema?.remove()
    if (structuredData) {
      const schema = document.createElement('script')
      schema.type = 'application/ld+json'
      schema.dataset.t24SeoSchema = 'true'
      schema.text = JSON.stringify(structuredData)
      document.head.appendChild(schema)
    }
  }, [canonicalPath, description, image, structuredData, title, type])

  return null
}
