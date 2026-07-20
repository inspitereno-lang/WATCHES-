export interface BlogSection {
  heading: string
  paragraphs: string[]
  bullets: string[]
}

export interface BlogPost {
  _id: string
  seedVersion?: number
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  publishedAt: string
  readingMinutes: number
  heroImage: string
  seoTitle: string
  seoDescription: string
  keywords: string[]
  sections?: BlogSection[]
}
