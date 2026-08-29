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
    image:
      'https://watchpaparazzi.com/img/pairings/8cb9b89f-0326-40df-84b0-86ed75542157.jpg',
    imagePosition: 'left center',
    imageScale: 1.55,
    captionAlign: 'right',
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

      <div className="relative mx-auto max-w-[92rem] space-y-6 sm:space-y-8 lg:space-y-12 px-3 sm:px-6 lg:px-12">
        {matches.map((match, index) => {
          const product = match.product
          const itemNumber = String(index + 1).padStart(2, '0')

          return (
            <article
              key={match.celebrity}
              className="icon-story grid overflow-hidden rounded-2xl border border-white/10 bg-[#0a0908] shadow-[0_30px_100px_rgba(0,0,0,0.5)] lg:min-h-[42rem] lg:grid-cols-2 lg:rounded-[2rem]"
            >
              {/* Celebrity Portrait Tile - Uncropped Person with object-top */}
              <div className="icon-portrait relative h-72 sm:h-96 lg:min-h-full overflow-hidden bg-[#111]">
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
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_35%,rgba(0,0,0,0.85)_100%)]" />
                
                {/* Reference Match Badge */}
                <div className="absolute left-4 top-4 sm:left-6 sm:top-6 flex items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-300/25 bg-black/70 px-2.5 py-1 sm:px-3 sm:py-1.5 font-body text-[7.5px] sm:text-[8px] font-semibold uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md">
                  <Check size={10} strokeWidth={2.5} />
                  {translate("Exact reference match", currentLang)}
                </div>

                {/* Index Number */}
                <div className="absolute right-4 top-4 sm:right-6 sm:top-6 font-display text-4xl sm:text-6xl lg:text-7xl text-white/20">
                  {itemNumber}
                </div>

                {/* Seen on Name Overlay */}
                <div
                  className={`absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 lg:bottom-8 lg:left-8 lg:right-8 ${
                    match.captionAlign === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  <p className="font-body text-[8px] sm:text-[9px] uppercase tracking-[0.24em] text-[#e8c264]">
                    {translate("Seen on", currentLang)}
                  </p>
                  <h2 className="mt-1 font-display text-2xl sm:text-4xl lg:text-5xl leading-none text-white">
                    {translate(match.celebrity, currentLang)}
                  </h2>
                  <a
                    href={match.source}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-2 sm:mt-3 items-center gap-1.5 font-body text-[7.5px] sm:text-[8px] uppercase tracking-[0.16em] text-white/45 transition hover:text-white ${
                      match.captionAlign === 'right' ? 'inline-flex flex-row-reverse' : 'inline-flex'
                    }`}
                  >
                    {translate("Editorial source · ", currentLang)}{translate(match.sourceLabel, currentLang)}
                    <ExternalLink size={9} />
                  </a>
                </div>
              </div>

              {/* Exact Matching Luxury Watch Tile - BIG Watch with Watermark Brand Background */}
              <div className="icon-product relative flex flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(212,175,55,0.14),transparent_35%),linear-gradient(145deg,#120e09_0%,#070706_70%)] p-5 sm:p-8 lg:p-10 min-h-[26rem] sm:min-h-[34rem] lg:min-h-full">
                {/* Big Background Watermark Brand Name */}
                <div className="pointer-events-none absolute -right-4 sm:-right-6 top-8 sm:top-12 font-display text-[3.8rem] sm:text-[6.5rem] lg:text-[8.5rem] leading-none text-white/[0.035] select-none uppercase tracking-tight">
                  {translate(product?.brand || match.reference.split(' ')[0], currentLang)}
                </div>

                {/* Top Info Row */}
                <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-3 sm:pb-5">
                  <div>
                    <p className="font-body text-[7.5px] sm:text-[8px] uppercase tracking-[0.22em] text-white/35">
                      {translate("DWG catalogue edition", currentLang)}
                    </p>
                    <p className="mt-1 font-body text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e8c264]">
                      {translate(product?.brand || match.reference.split(' ').slice(0, 2).join(' '), currentLang)}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#e8c264]/25 px-2.5 py-1 font-body text-[7.5px] sm:text-[8px] uppercase tracking-[0.16em] text-[#e8c264] bg-[#e8c264]/5">
                    {translate("In stock", currentLang)}
                  </span>
                </div>

                {/* Big Center Watch Image with Concentric Gold Aura Rings */}
                <div className="relative flex flex-1 items-center justify-center py-6 sm:py-8 my-auto">
                  <div className="absolute h-44 w-44 sm:h-[18rem] sm:w-[18rem] lg:h-[21rem] lg:w-[21rem] rounded-full border border-[#e8c264]/15" />
                  <div className="absolute h-32 w-32 sm:h-[14rem] sm:w-[14rem] lg:h-[17rem] lg:w-[17rem] rounded-full border border-[#e8c264]/10" />
                  {match.watchImage || product?.image ? (
                    <WatchImage
                      src={match.watchImage || product?.image || ''}
                      alt={match.reference}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      className="icon-watch relative z-10 max-h-48 sm:max-h-[22rem] lg:max-h-[28rem] max-w-[85%] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
                    />
                  ) : (
                    <div className="h-32 w-32 sm:h-52 sm:w-52 animate-pulse rounded-full border border-[#e8c264]/10 bg-[#e8c264]/5" />
                  )}
                </div>

                {/* Bottom Details Row with CTA */}
                <div className="relative z-10 border-t border-white/10 pt-4 sm:pt-6">
                  <p className="font-body text-[7.5px] sm:text-[8px] uppercase tracking-[0.2em] text-white/35">
                    {translate("The matching watch", currentLang)}
                  </p>
                  <h3 className="mt-1 font-display text-lg sm:text-2xl lg:text-3xl leading-tight text-white line-clamp-2">
                    {translate(match.reference, currentLang)}
                  </h3>
                  <div className="mt-4 sm:mt-6 flex flex-row items-center justify-between border-t border-white/8 pt-3 sm:pt-5">
                    <div>
                      <p className="font-body text-[7.5px] sm:text-[8px] uppercase tracking-[0.18em] text-white/35">
                        {translate("Available edition", currentLang)}
                      </p>
                      <p className="mt-0.5 font-body text-base sm:text-xl font-semibold text-[#e8c264]">
                        {product?.priceAED || 'View price'}
                      </p>
                    </div>
                    <Link
                      to={`/product/${match.productId}`}
                      className="group inline-flex items-center gap-2 sm:gap-3 rounded-full bg-[#e8c264] px-4 py-2.5 sm:px-5 sm:py-3 font-body text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-[#f1d98e] active:scale-95 shadow-md"
                    >
                      <ShoppingBag size={13} />
                      {translate("Shop this watch", currentLang)}
                      <ArrowRight size={12} className="transition group-hover:translate-x-1" />
                    </Link>
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
