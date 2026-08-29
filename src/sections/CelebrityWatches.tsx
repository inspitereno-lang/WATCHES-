import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Check, ExternalLink, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WatchImage } from '../components/WatchImage'
import { translate } from '../utils/translate'

gsap.registerPlugin(ScrollTrigger)

interface CatalogueProduct {
  id: number
  name: string
  brand: string
  image: string
  priceAED: string
  priceUSD?: string
  movement?: string
}

interface CelebrityMatch {
  celebrity: string
  productId: number
  reference: string
  image: string
  watchImage?: string
  imagePosition?: string
  imageScale?: number
  imageTransformOrigin?: string
  captionAlign?: 'left' | 'right'
  source: string
  sourceLabel: string
  product?: CatalogueProduct | null
}

const FALLBACK_MATCHES: CelebrityMatch[] = [
  {
    celebrity: 'Rafael Nadal',
    productId: 100,
    reference: 'Richard Mille RM 27-04 Tourbillon Rafael Nadal',
    image:
      'https://media.gq.com.mx/photos/61f1c2e9c981b856e36972ff/16:9/w_1600,c_limit/PR27-04.jpg',
    imagePosition: 'center center',
    source: 'https://www.gq.com.mx/relojes/articulo/rafael-nadal-tiene-un-nuevo-reloj-richard-mille',
    sourceLabel: 'GQ',
  },
  {
    celebrity: 'Shah Rukh Khan',
    productId: 149,
    reference: 'Audemars Piguet Royal Oak Perpetual Calendar Blue Ceramic',
    image: '/images/collections/shah-rukh-khan-portrait.png',
    watchImage: '/images/collections/shah-rukh-khan-royal-oak-blue.png',
    imagePosition: 'center top',
    source: 'https://blog.iflwatches.com/a-peek-into-shah-rukh-khan-watch-collection/',
    sourceLabel: 'IFL Watches',
  },
  {
    celebrity: 'Sergio Ramos',
    productId: 256,
    reference: 'Patek Philippe Aquanaut Chronograph 5968A-001 Orange',
    image: '/images/collections/sergio-ramos-portrait.png',
    watchImage: '/images/collections/sergio-ramos-aquanaut-orange.png',
    imagePosition: 'center top',
    source: 'https://www.instagram.com/p/DWYm235iGkR/',
    sourceLabel: 'Instagram',
  },
  {
    celebrity: 'Alexander Zverev',
    productId: 118,
    reference: 'Richard Mille RM 67-02 Alexander Zverev',
    image: '/images/collections/alexander-zverev-portrait.jpg',
    imagePosition: 'center top',
    source: 'https://watchpaparazzi.com/spotted.php?id=8cb9b89f-0326-40df-84b0-86ed75542157',
    sourceLabel: 'Watch Paparazzi',
  },
]

export default function CelebrityWatches() {
  const sectionRef = useRef<HTMLElement>(null)
  const [matches, setMatches] = useState<CelebrityMatch[]>(FALLBACK_MATCHES)
  const currentLang = localStorage.getItem('t24_lang') || 'en'

  useEffect(() => {
    let active = true
    const lang = localStorage.getItem('t24_lang') || 'en'
    fetch(`/api/collections/celebrity-matches?lang=${lang}`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load editorial collection')
        return response.json()
      })
      .then((data: { matches?: CelebrityMatch[] }) => {
        if (!active || !data.matches) return
        const remoteByProductId = new Map(
          data.matches.map((remoteMatch) => [remoteMatch.productId, remoteMatch])
        )
        setMatches(
          FALLBACK_MATCHES.map((match) => ({
            ...match,
            product: remoteByProductId.get(match.productId)?.product || null,
          }))
        )
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [])

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.icon-edit-intro > *',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        }
      )

      gsap.utils.toArray<HTMLElement>('.icon-story').forEach((story) => {
        const portrait = story.querySelector('.icon-portrait')
        const product = story.querySelector('.icon-product')
        const watch = story.querySelector('.icon-watch')

        gsap.fromTo(
          [portrait, product],
          { opacity: 0, y: 55 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: story,
              start: 'top 78%',
              once: true,
            },
          }
        )

        if (watch) {
          gsap.fromTo(
            watch,
            { yPercent: 5, rotate: -1.2 },
            {
              yPercent: -4,
              rotate: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: story,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          )
        }
      })
    }, section)

    return () => ctx.revert()
  }, [matches])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#050505] pb-12 pt-6 sm:pb-20 sm:pt-20 lg:pb-32 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.09),transparent_28%)]" />

      <header className="icon-edit-intro relative mx-auto max-w-7xl px-4 pb-6 pt-4 text-center sm:px-6 sm:pb-12 sm:pt-14 lg:px-12 lg:pb-20 lg:pt-20">
        <p className="font-body text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.32em] text-[#e8c264]">
          {translate("DWG Icon Edit · 2026", currentLang)}
        </p>
        <h1 className="mt-2 sm:mt-5 font-display text-3xl sm:text-6xl lg:text-8xl font-light leading-none">
          {translate("Worn by", currentLang)} <span className="italic text-[#e8c264]">{translate("Icons", currentLang)}</span>
        </h1>
        <p className="mx-auto mt-2 sm:mt-6 max-w-2xl font-body text-[11px] sm:text-sm leading-relaxed text-white/50">
          {translate("The moment on the wrist. The exact reference beside it. Four personalities, matched to four editions available in our store.", currentLang)}
        </p>
      </header>

      <div className="relative mx-auto max-w-[92rem] space-y-4 sm:space-y-6 lg:space-y-12 px-3 sm:px-6 lg:px-12">
        {matches.map((match, index) => {
          const product = match.product
          const itemNumber = String(index + 1).padStart(2, '0')

          return (
            <article
              key={match.celebrity}
              className="icon-story overflow-hidden rounded-2xl border border-white/10 bg-[#0a0908] shadow-[0_20px_60px_rgba(0,0,0,0.5)] lg:rounded-[2rem]"
            >              {/* Mobile View: 2-Tile Side-by-Side Layout (< lg) */}
              <div className="grid grid-cols-2 lg:hidden">
                {/* Mobile Tile 1: Celebrity Portrait (Uncropped Face & Wrist) */}
                <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-[#111] border-r border-white/10">
                  <img
                    src={match.image}
                    alt={`${match.celebrity} wearing ${match.reference}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    style={{
                      objectPosition: match.imagePosition || 'center top',
                    }}
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <div className="font-mono text-[8px] font-bold text-[#e8c264] bg-black/80 border border-[#e8c264]/30 px-1.5 py-0.5 rounded">
                      {itemNumber}
                    </div>
                  </div>
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full border border-emerald-300/30 bg-black/80 px-1.5 py-0.5 text-[7px] font-mono text-emerald-300 backdrop-blur-md">
                    <Check size={8} strokeWidth={2.5} />
                    <span>Match</span>
                  </div>

                  {/* Celebrity Name Overlay */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                    <p className="font-mono text-[7px] uppercase tracking-[0.22em] text-[#e8c264]">
                      {translate("Seen on", currentLang)}
                    </p>
                    <h3 className="font-display text-sm sm:text-base leading-tight text-white font-semibold line-clamp-1 mt-0.5">
                      {translate(match.celebrity, currentLang)}
                    </h3>
                  </div>
                </div>

                {/* Mobile Tile 2: Exact Matching Luxury Watch Card */}
                <div className="relative flex flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgba(212,175,55,0.15),transparent_60%),linear-gradient(145deg,#120e09_0%,#080807_75%)] p-2.5 sm:p-4">
                  {/* Brand Watermark in Background */}
                  <div className="pointer-events-none absolute -right-2 top-2 font-display text-[2.8rem] sm:text-[3.5rem] leading-none text-white/[0.035] select-none">
                    {translate(product?.brand || match.reference.split(' ')[0], currentLang)}
                  </div>

                  {/* Top Row: Brand & In Stock */}
                  <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span className="font-mono text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-[#e8c264] truncate">
                      {translate(product?.brand || match.reference.split(' ')[0], currentLang)}
                    </span>
                    <span className="text-[7px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                      {translate("In stock", currentLang)}
                    </span>
                  </div>

                  {/* Watch Image with Larger Scale & Gold Aura */}
                  <div className="relative flex items-center justify-center py-2 flex-1 my-auto">
                    <div className="absolute h-24 w-24 sm:h-28 sm:w-28 rounded-full border border-[#e8c264]/15" />
                    <div className="absolute h-18 w-18 sm:h-22 sm:w-22 rounded-full border border-[#e8c264]/10" />
                    {match.watchImage || product?.image ? (
                      <WatchImage
                        src={match.watchImage || product?.image || ''}
                        alt={match.reference}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className="icon-watch relative z-10 max-h-28 sm:max-h-36 max-w-[90%] object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.85)]"
                      />
                    ) : (
                      <div className="h-20 w-20 animate-pulse rounded-full border border-[#e8c264]/10 bg-[#e8c264]/5" />
                    )}
                  </div>

                  {/* Watch Title, Price & Shop Button */}
                  <div className="relative z-10 space-y-1.5 pt-1.5 border-t border-white/10">
                    <h4 className="font-display text-[9.5px] sm:text-xs leading-tight text-white line-clamp-1">
                      {translate(match.reference, currentLang)}
                    </h4>
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-mono text-[9.5px] sm:text-xs font-bold text-[#e8c264]">
                        {product?.priceAED || 'View price'}
                      </p>
                      <Link
                        to={`/product/${match.productId}`}
                        className="inline-flex items-center gap-1 rounded-full bg-[#e8c264] px-2.5 py-1 font-body text-[7.5px] sm:text-[8.5px] font-bold uppercase tracking-wider text-black transition active:scale-95 shrink-0 hover:bg-[#f1d98e]"
                      >
                        <ShoppingBag size={9} />
                        <span>{translate("Shop", currentLang)}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop View: Full Editorial 2-Column Split (lg+) */}
              <div className="hidden lg:grid lg:min-h-[42rem] lg:grid-cols-2">
                <div className="icon-portrait relative min-h-full overflow-hidden bg-[#111]">
                  <img
                    src={match.image}
                    alt={`${match.celebrity} wearing ${match.reference}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    style={{
                      objectPosition: match.imagePosition || 'center center',
                      transform: `scale(${match.imageScale || 1})`,
                      transformOrigin: match.imageTransformOrigin || 'left center',
                    }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_45%,rgba(0,0,0,0.82)_100%)]" />
                  <div className="absolute left-7 top-7 flex items-center gap-2 rounded-full border border-emerald-300/25 bg-black/65 px-3 py-1.5 font-body text-[8px] font-semibold uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md">
                    <Check size={11} strokeWidth={2.5} />
                    {translate("Exact reference match", currentLang)}
                  </div>
                  <div className="absolute right-7 top-7 font-display text-7xl text-white/20">
                    {itemNumber}
                  </div>

                  <div
                    className={`absolute bottom-8 left-8 right-8 ${
                      match.captionAlign === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <p className="font-body text-[9px] uppercase tracking-[0.24em] text-[#e8c264]">
                      {translate("Seen on", currentLang)}
                    </p>
                    <h2 className="mt-2 font-display text-5xl leading-none text-white">
                      {translate(match.celebrity, currentLang)}
                    </h2>
                    <a
                      href={match.source}
                      target="_blank"
                      rel="noreferrer"
                      className={`mt-4 items-center gap-1.5 font-body text-[8px] uppercase tracking-[0.16em] text-white/45 transition hover:text-white ${
                        match.captionAlign === 'right' ? 'inline-flex flex-row-reverse' : 'inline-flex'
                      }`}
                    >
                      {translate("Editorial source · ", currentLang)}{translate(match.sourceLabel, currentLang)}
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div className="icon-product relative flex min-h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(212,175,55,0.13),transparent_34%),linear-gradient(145deg,#100d08_0%,#070706_70%)] p-10">
                  <div className="pointer-events-none absolute -right-5 top-12 font-display text-[8.5rem] leading-none text-white/[0.025]">
                    {translate(product?.brand || match.reference.split(' ')[0], currentLang)}
                  </div>
                  <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-5">
                    <div>
                      <p className="font-body text-[8px] uppercase tracking-[0.22em] text-white/35">
                        {translate("DWG catalogue edition", currentLang)}
                      </p>
                      <p className="mt-2 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e8c264]">
                        {translate(product?.brand || match.reference.split(' ').slice(0, 2).join(' '), currentLang)}
                      </p>
                    </div>
                    <span className="rounded-full border border-[#e8c264]/25 px-3 py-1.5 font-body text-[8px] uppercase tracking-[0.16em] text-[#e8c264]">
                      {translate("In stock", currentLang)}
                    </span>
                  </div>

                  <div className="relative flex flex-1 items-center justify-center py-8">
                    <div className="absolute h-[21rem] w-[21rem] rounded-full border border-[#e8c264]/15" />
                    <div className="absolute h-[17rem] w-[17rem] rounded-full border border-[#e8c264]/10" />
                    {match.watchImage || product?.image ? (
                      <WatchImage
                        src={match.watchImage || product?.image || ''}
                        alt={match.reference}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className="icon-watch relative z-10 max-h-[28rem] max-w-[82%] object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.75)]"
                      />
                    ) : (
                      <div className="h-52 w-52 animate-pulse rounded-full border border-[#e8c264]/10 bg-[#e8c264]/5" />
                    )}
                  </div>

                  <div className="relative z-10 border-t border-white/10 pt-6">
                    <p className="font-body text-[8px] uppercase tracking-[0.2em] text-white/35">
                      {translate("The matching watch", currentLang)}
                    </p>
                    <h3 className="mt-2 max-w-xl font-display text-3xl leading-tight text-white">
                      {translate(match.reference, currentLang)}
                    </h3>
                    <div className="mt-6 flex flex-row items-end justify-between border-t border-white/8 pt-5">
                      <div>
                        <p className="font-body text-[8px] uppercase tracking-[0.18em] text-white/35">
                          {translate("Available edition", currentLang)}
                        </p>
                        <p className="mt-1 font-body text-xl font-semibold text-[#e8c264]">
                          {product?.priceAED || 'View price'}
                        </p>
                      </div>
                      <Link
                        to={`/product/${match.productId}`}
                        className="group inline-flex w-fit items-center gap-3 rounded-full bg-[#e8c264] px-5 py-3 font-body text-[9px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-[#f1d98e]"
                      >
                        <ShoppingBag size={14} />
                        {translate("Shop this watch", currentLang)}
                        <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <p className="relative mx-auto mt-8 max-w-[92rem] px-6 font-body text-[9px] leading-5 tracking-[0.08em] text-white/25 lg:px-12">
        {translate("Editorial watch-spotting only. Celebrity images show original references; no affiliation or endorsement of Dubai Watches Gallery is implied.", currentLang)}
      </p>
    </section>
  )
}
