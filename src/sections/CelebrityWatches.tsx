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
  imagePosition?: string
  imageScale?: number
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
  {
    celebrity: 'Lewis Hamilton',
    productId: 259,
    reference: 'Patek Philippe Nautilus 5980/1R Rose Gold',
    image:
      'https://watchpaparazzi.com/img/pairings/907a07b1-f845-4a94-b1d8-3ef95dc0d56c.jpg',
    imagePosition: 'left center',
    imageScale: 1.55,
    source: 'https://watchpaparazzi.com/spotted.php?id=907a07b1-f845-4a94-b1d8-3ef95dc0d56c',
    sourceLabel: 'Watch Paparazzi',
  },
  {
    celebrity: 'Lando Norris',
    productId: 116,
    reference: 'Richard Mille RM 67-02 McLaren',
    image:
      'https://oracleoftime.com/wp-content/uploads/2023/02/Lando-Norris-Mclaren-Richard-Mille-RM-67-02-Automatic-Extra-Flat.jpg',
    imagePosition: 'center 24%',
    source: 'https://oracleoftime.com/f1-drivers-watches-2023/',
    sourceLabel: 'Oracle Time',
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
        setMatches(
          data.matches.map((remoteMatch) => ({
            ...FALLBACK_MATCHES.find((match) => match.productId === remoteMatch.productId),
            ...remoteMatch,
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
    <section ref={sectionRef} className="relative overflow-hidden bg-[#050505] pb-20 pt-20 text-white lg:pb-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.09),transparent_28%)]" />

      <header className="icon-edit-intro relative mx-auto max-w-7xl px-6 pb-12 pt-14 text-center lg:px-12 lg:pb-20 lg:pt-20">
        <p className="font-body text-[9px] font-semibold uppercase tracking-[0.32em] text-[#e8c264]">
          {translate("T24 Icon Edit · 2026", currentLang)}
        </p>
        <h1 className="mt-5 font-display text-5xl font-light leading-none sm:text-6xl lg:text-8xl">
          {translate("Worn by", currentLang)} <span className="italic text-[#e8c264]">{translate("Icons", currentLang)}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-body text-sm leading-7 text-white/50">
          {translate("The moment on the wrist. The exact reference beside it. Four personalities, matched to four editions available in our store.", currentLang)}
        </p>
      </header>

      <div className="relative mx-auto max-w-[92rem] space-y-7 px-4 sm:px-6 lg:space-y-12 lg:px-12">
        {matches.map((match, index) => {
          const product = match.product
          const itemNumber = String(index + 1).padStart(2, '0')

          return (
            <article
              key={match.celebrity}
              className="icon-story grid overflow-hidden rounded-2xl border border-white/10 bg-[#0a0908] shadow-[0_30px_100px_rgba(0,0,0,0.45)] lg:min-h-[42rem] lg:grid-cols-2 lg:rounded-[2rem]"
            >
              <div className="icon-portrait relative min-h-[31rem] overflow-hidden bg-[#111] sm:min-h-[38rem] lg:min-h-full">
                <img
                  src={match.image}
                  alt={`${match.celebrity} wearing ${match.reference}`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  style={{
                    objectPosition: match.imagePosition || 'center center',
                    transform: `scale(${match.imageScale || 1})`,
                    transformOrigin: 'left center',
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_45%,rgba(0,0,0,0.82)_100%)]" />
                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-emerald-300/25 bg-black/65 px-3 py-1.5 font-body text-[8px] font-semibold uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md lg:left-7 lg:top-7">
                  <Check size={11} strokeWidth={2.5} />
                  {translate("Exact reference match", currentLang)}
                </div>
                <div className="absolute right-5 top-5 font-display text-5xl text-white/20 lg:right-7 lg:top-7 lg:text-7xl">
                  {itemNumber}
                </div>

                <div
                  className={`absolute bottom-6 left-6 right-6 lg:bottom-8 lg:left-8 lg:right-8 ${
                    match.captionAlign === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  <p className="font-body text-[9px] uppercase tracking-[0.24em] text-[#e8c264]">
                    {translate("Seen on", currentLang)}
                  </p>
                  <h2 className="mt-2 font-display text-4xl leading-none text-white sm:text-5xl">
                    {match.celebrity}
                  </h2>
                  <a
                    href={match.source}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-4 items-center gap-1.5 font-body text-[8px] uppercase tracking-[0.16em] text-white/45 transition hover:text-white ${
                      match.captionAlign === 'right' ? 'inline-flex flex-row-reverse' : 'inline-flex'
                    }`}
                  >
                    {translate("Editorial source · ", currentLang)}{match.sourceLabel}
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div className="icon-product relative flex min-h-[36rem] flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(212,175,55,0.13),transparent_34%),linear-gradient(145deg,#100d08_0%,#070706_70%)] p-6 sm:min-h-[40rem] sm:p-8 lg:min-h-full lg:p-10">
                <div className="pointer-events-none absolute -right-5 top-12 font-display text-[5.5rem] leading-none text-white/[0.025] sm:text-[7.5rem] lg:text-[8.5rem]">
                  {product?.brand || match.reference.split(' ')[0]}
                </div>
                <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="font-body text-[8px] uppercase tracking-[0.22em] text-white/35">
                      {translate("T24 catalogue edition", currentLang)}
                    </p>
                    <p className="mt-2 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e8c264]">
                      {product?.brand || match.reference.split(' ').slice(0, 2).join(' ')}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#e8c264]/25 px-3 py-1.5 font-body text-[8px] uppercase tracking-[0.16em] text-[#e8c264]">
                    {translate("In stock", currentLang)}
                  </span>
                </div>

                <div className="relative flex flex-1 items-center justify-center py-8">
                  <div className="absolute h-[17rem] w-[17rem] rounded-full border border-[#e8c264]/15 sm:h-[21rem] sm:w-[21rem]" />
                  <div className="absolute h-[13rem] w-[13rem] rounded-full border border-[#e8c264]/10 sm:h-[17rem] sm:w-[17rem]" />
                  {product?.image ? (
                    <WatchImage
                      src={product.image}
                      alt={product.name}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      className="icon-watch relative z-10 max-h-[20rem] max-w-[82%] object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.75)] sm:max-h-[25rem] lg:max-h-[28rem]"
                    />
                  ) : (
                    <div className="h-52 w-52 animate-pulse rounded-full border border-[#e8c264]/10 bg-[#e8c264]/5" />
                  )}
                </div>

                <div className="relative z-10 border-t border-white/10 pt-6">
                  <p className="font-body text-[8px] uppercase tracking-[0.2em] text-white/35">
                    {translate("The matching watch", currentLang)}
                  </p>
                  <h3 className="mt-2 max-w-xl font-display text-2xl leading-tight text-white sm:text-3xl">
                    {match.reference}
                  </h3>
                  <div className="mt-6 flex flex-col gap-5 border-t border-white/8 pt-5 sm:flex-row sm:items-end sm:justify-between">
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
            </article>
          )
        })}
      </div>

      <p className="relative mx-auto mt-8 max-w-[92rem] px-6 font-body text-[9px] leading-5 tracking-[0.08em] text-white/25 lg:px-12">
        {translate("Editorial watch-spotting only. Celebrity images show original references; no affiliation or endorsement of T24 Watches is implied.", currentLang)}
      </p>
    </section>
  )
}
