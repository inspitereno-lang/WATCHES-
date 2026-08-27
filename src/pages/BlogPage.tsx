import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BookOpen, CalendarDays, Clock, Loader2 } from 'lucide-react'
import { Link } from 'react-router'
import Seo from '../components/Seo'
import { translate } from '../utils/translate'
import type { BlogPost } from '../types/blog'

export default function BlogPage() {
  const currentLang = localStorage.getItem('t24_lang') || 'en'
  const isArabic = currentLang === 'ar'
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const lang = localStorage.getItem('t24_lang') || 'en'
    fetch(`/api/blogs?lang=${lang}`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load journal')
        return response.json()
      })
      .then((data: { posts: BlogPost[] }) => setPosts(data.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(posts.map((post) => post.category)))],
    [posts]
  )
  const visiblePosts =
    activeCategory === 'All'
      ? posts
      : posts.filter((post) => post.category === activeCategory)
  const featured = visiblePosts[0]

  return (
    <div className="min-h-screen bg-[#070706] pb-24 pt-20 text-white">
      <Seo
        title={isArabic ? 'مجلة الساعات الفاخرة في دبي | تي 24 للساعات' : 'Luxury Watch Journal Dubai | T24 Watches'}
        description={isArabic ? 'اقرأ أدلة عملية للشراء وشرحًا لموديلات الساعات ونصائح للعناية بالساعات الفاخرة في دبي.' : 'Read practical buying guides, watch-reference explainers, and care advice for replica watches and luxury-inspired timepieces in Dubai.'}
        keywords={[
          'watch blog Dubai',
          'replica watch guides',
          'Rolex Daytona guide',
          'luxury watch care Dubai',
        ]}
        canonicalPath="/blog"
        image="/images/blog/watch-buying-guide-2026.png"
      />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src="/images/blog/mechanical-movement-2026.png"
            alt=""
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-[#070706]/75 to-[#070706]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center lg:px-12 lg:py-28">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8c264]/25 bg-[#e8c264]/5 px-4 py-2 font-body text-[9px] uppercase tracking-[0.24em] text-[#e8c264]">
            <BookOpen size={14} />
            {translate('T24 Editorial', currentLang)}
          </div>
          <h1 className="font-display text-4xl font-light sm:text-6xl lg:text-7xl">
            {isArabic ? (
              <>مجلة <span className="text-[#e8c264]">الساعات</span></>
            ) : (
              <>The Watch <span className="italic text-[#e8c264]">Journal</span></>
            )}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-body text-sm leading-7 text-white/55">
            {isArabic
              ? 'أدلة متعمقة للموديلات، وشرح للحركات، ونصائح للأناقة والعناية العملية بالساعات لهواة الجمع في دبي.'
              : 'In-depth reference guides, movement explainers, style advice, and practical watch-care knowledge for collectors in Dubai.'}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-x-8 gap-y-3 font-body text-[9px] uppercase tracking-[0.18em] text-white/40">
            <span>{posts.length || 6} {translate('detailed guides', currentLang)}</span>
            <span>{translate('Independent education', currentLang)}</span>
            <span>{translate('Updated weekly', currentLang)}</span>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 pt-12 lg:px-12">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-4 py-2 font-body text-[9px] uppercase tracking-[0.16em] transition ${
                activeCategory === category
                  ? 'border-[#e8c264] bg-[#e8c264] text-black'
                  : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-[#e8c264]/40 hover:text-white'
              }`}
            >
              {translate(category, currentLang)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="animate-spin text-[#e8c264]" />
          </div>
        ) : featured ? (
          <>
            <Link
              to={`/blog/${featured.slug}`}
              className="group grid overflow-hidden rounded-2xl border border-white/10 bg-[#0d0c0a] sm:rounded-3xl lg:grid-cols-[1.1fr_0.9fr]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#111] lg:aspect-auto lg:min-h-[24rem]">
                <img
                  src={featured.heroImage}
                  alt={translate(featured.title, currentLang)}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent lg:bg-gradient-to-r" />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
                <p className="font-body text-[9px] font-semibold uppercase tracking-[0.22em] text-[#e8c264]">
                  {isArabic ? 'مميز · ' : 'Featured · '}{translate(featured.category, currentLang)}
                </p>
                <h2 className="mt-5 font-display text-3xl leading-tight text-white sm:text-4xl">
                  {translate(featured.title, currentLang)}
                </h2>
                <p className="mt-5 font-body text-sm leading-7 text-white/55">
                  {translate(featured.excerpt, currentLang)}
                </p>
                <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-4 font-body text-[9px] uppercase tracking-[0.14em] text-white/40">
                    <span className="inline-flex items-center gap-2">
                      <Clock size={13} />
                      {featured.readingMinutes} {translate('min read', currentLang)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={13} />
                      {new Date(featured.publishedAt).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-2 font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-[#e8c264]">
                    {translate('Read article', currentLang)}
                    <ArrowRight size={14} className={isArabic ? 'rotate-180' : ''} />
                  </span>
                </div>
              </div>
            </Link>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visiblePosts.slice(1).map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0d0c0a] transition hover:border-[#e8c264]/35"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#111]">
                    <img
                      src={post.heroImage}
                      alt={translate(post.title, currentLang)}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <p className="font-body text-[9px] uppercase tracking-[0.18em] text-[#e8c264]">
                      {translate(post.category, currentLang)}
                    </p>
                    <h2 className="mt-3 font-display text-2xl leading-tight text-white">
                      {translate(post.title, currentLang)}
                    </h2>
                    <p className="mt-4 line-clamp-3 font-body text-xs leading-6 text-white/50">
                      {translate(post.excerpt, currentLang)}
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 font-body text-[9px] uppercase tracking-[0.14em] text-white/40">
                      <span>{post.readingMinutes} {translate('min', currentLang)} · {translate(post.author, currentLang)}</span>
                      <span className="text-[#e8c264]">{isArabic ? 'اقرأ المزيد ←' : 'Read more →'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 py-20 text-center font-body text-sm text-white/45">
            {translate('No journal articles are available.', currentLang)}
          </div>
        )}
      </main>
    </div>
  )
}

