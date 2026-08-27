import { useEffect, useState } from 'react'
import { ArrowLeft, Clock, Loader2 } from 'lucide-react'
import { Link, useParams } from 'react-router'
import Seo from '../components/Seo'
import { translate } from '../utils/translate'
import type { BlogPost } from '../types/blog'

export default function BlogArticlePage() {
  const currentLang = localStorage.getItem('t24_lang') || 'en'
  const isArabic = currentLang === 'ar'
  const { slug } = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    const lang = localStorage.getItem('t24_lang') || 'en'
    fetch(`/api/blogs/${encodeURIComponent(slug)}?lang=${lang}`)
      .then((response) => {
        if (!response.ok) throw new Error('Article not found')
        return response.json()
      })
      .then((data: BlogPost) => setPost(data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070706] pt-20">
        <Loader2 className="animate-spin text-[#e8c264]" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070706] px-6 pt-20 text-center text-white">
        <h1 className="font-display text-4xl">{translate('Article not found', currentLang)}</h1>
        <Link to="/blog" className="mt-6 font-body text-xs uppercase tracking-widest text-[#e8c264]">
          {translate('Return to the journal', currentLang)}
        </Link>
      </div>
    )
  }

  const publishedDate = new Date(post.publishedAt)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: translate(post.title, currentLang),
    description: translate(post.seoDescription, currentLang),
    image: new URL(post.heroImage, window.location.origin).toString(),
    datePublished: publishedDate.toISOString(),
    author: {
      '@type': 'Organization',
      name: translate(post.author, currentLang),
    },
    publisher: {
      '@type': 'Organization',
      name: 'T24 Watches Dubai',
    },
    mainEntityOfPage: new URL(`/blog/${post.slug}`, window.location.origin).toString(),
  }

  return (
    <article className="min-h-screen bg-[#070706] pb-24 pt-20 text-white">
      <Seo
        title={translate(post.seoTitle || post.title, currentLang)}
        description={translate(post.seoDescription || post.excerpt, currentLang)}
        keywords={post.keywords}
        canonicalPath={`/blog/${post.slug}`}
        image={post.heroImage}
        type="article"
        structuredData={schema}
      />

      <header className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-20">
          <div className="flex flex-col justify-center">
            <Link
              to="/blog"
              className="mb-8 inline-flex w-fit items-center gap-2 font-body text-[9px] uppercase tracking-[0.18em] text-white/45 transition hover:text-[#e8c264]"
            >
              <ArrowLeft size={13} className={isArabic ? 'rotate-180' : ''} />
              {translate('Back to journal', currentLang)}
            </Link>
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e8c264]">
              {translate(post.category, currentLang)}
            </p>
            <h1 className="mt-5 font-display text-4xl font-light leading-[1.06] sm:text-5xl lg:text-6xl">
              {translate(post.title, currentLang)}
            </h1>
            <p className="mt-6 max-w-xl font-body text-sm leading-7 text-white/55">
              {translate(post.excerpt, currentLang)}
            </p>
            <div className="mt-8 flex items-center gap-5 font-body text-[9px] uppercase tracking-[0.14em] text-white/40">
              <span>{translate(post.author, currentLang)}</span>
              <span>{publishedDate.toLocaleDateString(isArabic ? 'ar-AE' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} />
                {post.readingMinutes} {translate('min', currentLang)}
              </span>
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-[#111] sm:rounded-3xl lg:aspect-auto lg:min-h-[25rem]">
            <img src={post.heroImage} alt={translate(post.title, currentLang)} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[14rem_1fr] lg:px-12">
        <aside className={`h-fit lg:sticky lg:top-28 ${isArabic ? 'border-r border-[#e8c264]/35 pr-5' : 'border-l border-[#e8c264]/35 pl-5'}`}>
          <p className="font-body text-[9px] uppercase tracking-[0.2em] text-[#e8c264]">{translate('In this guide', currentLang)}</p>
          <ol className="mt-5 space-y-3 font-body text-xs leading-5 text-white/45">
            {post.sections?.map((section, index) => (
              <li key={section.heading}>
                <a href={`#section-${index + 1}`} className="transition hover:text-white">
                  {String(index + 1).padStart(2, '0')} · {translate(section.heading, currentLang)}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <div className="min-w-0 max-w-3xl">
          <div className="mb-12 border-y border-white/10 py-8">
            <p className="font-display text-2xl leading-relaxed text-white/80">
              {translate(post.excerpt, currentLang)}
            </p>
          </div>
          {post.sections?.map((section, index) => (
            <section
              id={`section-${index + 1}`}
              key={section.heading}
              className="scroll-mt-28 border-b border-white/10 pb-12 [&:not(:first-child)]:pt-12"
            >
              <p className="font-body text-[9px] uppercase tracking-[0.2em] text-[#e8c264]">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-white">{translate(section.heading, currentLang)}</h2>
              <div className="mt-6 space-y-5">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="font-body text-[15px] leading-8 text-white/65">
                    {translate(paragraph, currentLang)}
                  </p>
                ))}
              </div>
              {section.bullets?.length > 0 && (
                <ul className="mt-7 space-y-3">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 font-body text-sm leading-6 text-white/60">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8c264]" />
                      {translate(bullet, currentLang)}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div className="mt-12 rounded-2xl border border-[#e8c264]/20 bg-[#e8c264]/5 p-7">
            <p className="font-body text-[9px] uppercase tracking-[0.2em] text-[#e8c264]">{translate('Continue shopping', currentLang)}</p>
            <h2 className="mt-3 font-display text-2xl">{translate('Compare the references in our catalogue.', currentLang)}</h2>
            <Link
              to="/collections"
              className="mt-5 inline-flex items-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8c264]"
            >
              {translate('Explore collections →', currentLang)}
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
