import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Truck, ShieldCheck, CreditCard } from 'lucide-react'
import { translate } from '../utils/translate'

gsap.registerPlugin(ScrollTrigger)

interface HeroProps {
  heroTitle?: string
  heroSubtitleLabel?: string
  heroSubtitleDesc?: string
  heroBodyDescription?: string
  heroCtaLabel?: string
  heroCtaTarget?: string
  heroWatchImageUrl?: string
  heroVideoUrl?: string
  heroMobileVideoUrl?: string
  heroVideos?: string[]
  heroWatchLabelLine1?: string
  heroWatchLabelLine2?: string
  heroWatchLabelLine3?: string
  heroWatchLabelLine4?: string
  heroStats?: Array<{
    value: string
    label: string
  }>
}

const DEFAULT_DESKTOP_IMAGE = '/hero-banner-desktop.webp'
const DEFAULT_DESKTOP_RTL_IMAGE = '/hero-banner-desktop-rtl.webp'
const DEFAULT_MOBILE_IMAGE = '/hero-banner-mobile.webp'

export default function Hero({
  heroTitle = 'SWISS | PRECISION',
  heroSubtitleLabel = 'SUPER CLONE BRANDS DUBAI',
  heroSubtitleDesc = 'BEST REPLICA BRANDS IN DUBAI.',
  heroBodyDescription = "Dubai's ultimate boutique for 1:1 super clone brands. Hand-calibrated with flawless sweep movements, premium Oystersteel, and sapphire crystals. Cash on delivery available.",
  heroCtaLabel = 'EXPLORE COLLECTION',
  heroCtaTarget = '#collections',
  heroWatchImageUrl = '/hero-banner-desktop.webp',
  heroWatchLabelLine1 = 'SWISS',
  heroWatchLabelLine2 = 'DUBAI EDITION',
  heroWatchLabelLine3 = 'PREMIUM OYSTERSTEEL',
  heroWatchLabelLine4 = '1:1 BUILD',
  heroStats = [
    { value: 'FREE', label: 'SAME-DAY DELIVERY' },
    { value: '2 YR', label: 'SERVICE WARRANTY' },
    { value: 'COD', label: 'MULTIPLE PAYMENTS' },
  ],
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const watchPanelRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subheadRef = useRef<HTMLParagraphElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)

  const currentLang = localStorage.getItem('t24_lang') || 'en'
  const isRtl = currentLang === 'ar'

  const isCustomImage =
    heroWatchImageUrl &&
    !heroWatchImageUrl.includes('eehkzalmujmziwekwq9a') &&
    !heroWatchImageUrl.includes('/hero-watch.png') &&
    !heroWatchImageUrl.includes('watch-diver-green.jpg') &&
    !heroWatchImageUrl.includes('hero_banner_rm') &&
    !heroWatchImageUrl.includes('hero-banner') &&
    heroWatchImageUrl !== '/hero-banner-desktop.png' &&
    heroWatchImageUrl !== '/hero-banner-desktop.webp' &&
    heroWatchImageUrl !== '/hero-banner-desktop.jpg'

  const desktopBannerSrc = isCustomImage
    ? heroWatchImageUrl
    : (isRtl ? DEFAULT_DESKTOP_RTL_IMAGE : DEFAULT_DESKTOP_IMAGE)

  const mobileBannerSrc = isCustomImage
    ? heroWatchImageUrl
    : DEFAULT_MOBILE_IMAGE

  const heroData = {
    title: translate(heroTitle, currentLang),
    subtitleLabel: translate(heroSubtitleLabel, currentLang),
    subtitleDesc: translate((heroSubtitleDesc || '').replace(/master\s+copy/gi, 'super clone'), currentLang),
    bodyDescription: translate(heroBodyDescription, currentLang),
    ctaLabel: translate(heroCtaLabel, currentLang),
    ctaTarget: heroCtaTarget,
    watchImageUrl: heroWatchImageUrl,
    watchLabelLine1: translate(heroWatchLabelLine1, currentLang),
    watchLabelLine2: translate(heroWatchLabelLine2, currentLang),
    watchLabelLine3: translate(heroWatchLabelLine3, currentLang),
    watchLabelLine4: translate(heroWatchLabelLine4, currentLang),
    stats: (heroStats || []).map((s) => ({
      value: translate(s.value, currentLang),
      label: translate(s.label, currentLang),
    })),
  }

  useLayoutEffect(() => {
    const section = sectionRef.current
    const watchPanel = watchPanelRef.current
    const glow = glowRef.current
    const eyebrow = eyebrowRef.current
    const heading = headingRef.current
    const subhead = subheadRef.current
    const body = bodyRef.current
    const cta = ctaRef.current
    const stats = statsRef.current
    const marker = markerRef.current

    if (!section || !watchPanel || !glow || !eyebrow || !heading || !subhead || !body || !cta || !stats || !marker) return

    const ctx = gsap.context(() => {
      const words = heading.querySelectorAll('.hero-word')

      gsap.set(watchPanel, { opacity: 0 })
      gsap.set(glow, { opacity: 0, scale: 0.82 })
      gsap.set([eyebrow, subhead, body, cta, stats, marker], { opacity: 0, y: 28 })
      gsap.set(words, { opacity: 0, yPercent: 115, rotateX: -18 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.to(glow, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' })
        .to(watchPanel, { opacity: 1, duration: 1.0, ease: 'power2.out' }, '-=0.65')
        .to(eyebrow, { opacity: 1, y: 0, duration: 0.55 }, '-=0.75')
        .to(
          words,
          {
            opacity: 1,
            yPercent: 0,
            rotateX: 0,
            duration: 0.72,
            stagger: 0.04,
          },
          '-=0.35'
        )
        .to([subhead, body], { opacity: 1, y: 0, duration: 0.55, stagger: 0.07 }, '-=0.25')
        .to(cta, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
        .to([stats, marker], { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }, '-=0.25')

      gsap.to(glow, {
        rotate: 16,
        scale: 1.08,
        repeat: -1,
        yoyo: true,
        duration: 6,
        ease: 'sine.inOut',
      })

      gsap.to(marker, {
        y: -18,
        repeat: -1,
        yoyo: true,
        duration: 2.4,
        ease: 'sine.inOut',
      })
    }, section)

    return () => ctx.revert()
  }, [isRtl])

  const titleLines = (heroData.title || 'SWISS | PRECISION').split(' | ')
  const collectionTarget =
    !heroData.ctaTarget || heroData.ctaTarget === '#store' || heroData.ctaTarget === '/collections'
      ? '#collections'
      : heroData.ctaTarget

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (collectionTarget.startsWith('#')) {
      e.preventDefault()
      const target = document.querySelector(collectionTarget)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const displayStats = heroData.stats?.length ? heroData.stats : [
    { value: 'FREE', label: 'Same-day delivery' },
    { value: '2 YR', label: 'Service warranty' },
    { value: 'COD', label: 'Multiple payments' },
  ]

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative isolate hero-mobile-height overflow-hidden bg-[#070605] pt-2 sm:pt-20 text-white flex flex-col justify-between"
    >
      {/* Background soft ambient radial lighting */}
      <div 
        className={`absolute inset-0 -z-30 bg-[#050403] sm:bg-[radial-gradient(circle_at_${isRtl ? '22%' : '78%'}_28%,rgba(232,194,100,0.25),transparent_24%),radial-gradient(circle_at_${isRtl ? '12%' : '88%'}_70%,rgba(217,165,32,0.10),transparent_28%),linear-gradient(135deg,#050403_0%,#140b05_45%,#050403_100%)]`} 
      />
      <div
        ref={glowRef}
        className={`absolute top-[-10rem] -z-20 hidden h-[45rem] w-[45rem] rounded-full bg-[conic-gradient(from_120deg,rgba(217,165,32,0),rgba(217,165,32,0.32),rgba(232,194,100,0.22),rgba(235,203,122,0.42),rgba(217,165,32,0))] blur-3xl ${isRtl ? 'left-[-16rem]' : 'right-[-16rem]'}`}
      />

      {/* Cinematic Watch Background Banner */}
      <div
        ref={watchPanelRef}
        className="absolute inset-0 -z-20 overflow-hidden pointer-events-none"
      >
        <picture className="absolute inset-0 h-full w-full">
          {/* Mobile View (< 640px): Specially composed with watch framed dynamically on the right and bottom */}
          <source
            media="(max-width: 639px)"
            srcSet={mobileBannerSrc}
          />
          {/* Desktop View (>= 640px): Wide format with watch on right (or left for RTL) and dark text zone */}
          <img
            src={desktopBannerSrc}
            alt="Dubai Super Clone Luxury Brands"
            className="h-full w-full object-cover object-center brightness-[1.05] contrast-[1.05] saturate-[1.08] transition-opacity duration-700"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </div>

      <div className={`absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-[#e8c264]/50 to-transparent ${isRtl ? 'right-0 sm:right-8 lg:right-12' : 'left-0 sm:left-8 lg:left-12'}`} />

      {/* Main Hero Content - Mobile and Desktop Responsive */}
      <div className="relative z-10 mx-auto flex h-full sm:min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col justify-between px-5 py-5 sm:px-10 sm:py-8 lg:px-14">
        <div className="w-full max-w-[42rem] pt-2 sm:pt-8">
          {/* Eyebrow: Gold horizontal dash + tracked uppercase text */}
          <div
            ref={eyebrowRef}
            className="mb-3.5 sm:mb-6 flex items-center gap-2.5 sm:gap-3"
          >
            <span className="w-7 sm:w-10 h-[2px] bg-gradient-to-r from-[#d9a520] to-[#e8c264]" />
            <span className="font-body text-[10px] sm:text-xs font-semibold uppercase tracking-[0.24em] sm:tracking-[0.35em] text-[#e8c264]">
              {heroData.subtitleLabel}
            </span>
          </div>

          {/* Headline: SWISS in white, PRECISION in metallic luxury gold */}
          <h1
            ref={headingRef}
            className="font-body text-[clamp(3.1rem,8.5vw,6.75rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.04em] text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)]"
          >
            {titleLines.map((line, lineIndex) => (
              <span key={line} className="block overflow-hidden pb-1 sm:pb-2">
                {line.split(' ').map((word, wordIndex) => (
                  <span key={`${lineIndex}-${wordIndex}-${word}`}>
                    <span
                      className={lineIndex === titleLines.length - 1 ? 'hero-word inline-block bg-gradient-to-r from-[#d9a520] via-[#f7df9c] to-[#d9a520] bg-clip-text pr-[0.08em] text-transparent drop-shadow-[0_4px_24px_rgba(217,165,32,0.4)]' : 'hero-word inline-block pr-[0.08em]'}
                    >
                      {word}
                    </span>{' '}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p
            ref={subheadRef}
            className="mt-3 sm:mt-4 max-w-[260px] sm:max-w-xl font-body text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] sm:tracking-[0.26em] text-[#e8c264] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] leading-snug sm:leading-normal"
          >
            {heroData.subtitleDesc}
          </p>

          {/* Desktop Body Description */}
          <p
            ref={bodyRef}
            className="mt-3.5 hidden sm:block max-w-lg font-body text-xs sm:text-[15px] leading-6 sm:leading-7 text-white/85 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]"
          >
            {heroData.bodyDescription}
          </p>

          {/* CTA Button: Gold Pill Button with Dark Circle Arrow Icon */}
          <div className="mt-5 sm:mt-7 flex items-center">
            <a
              ref={ctaRef}
              href={collectionTarget}
              onClick={handleCtaClick}
              className="relative z-20 group inline-flex items-center gap-3.5 sm:gap-4 rounded-full bg-gradient-to-r from-[#e5b955] via-[#f3d27d] to-[#dca738] px-6 py-3 sm:px-7 sm:py-4 font-body text-xs sm:text-[13px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#140f07] shadow-[0_0_35px_rgba(232,194,100,0.45)] hover:shadow-[0_0_55px_rgba(232,194,100,0.7)] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <span>{heroData.ctaLabel}</span>
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1b140b] text-[#e8c264] transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
              </span>
            </a>
          </div>
        </div>

        {/* Bottom Feature Stats Strip & Pagination Dots */}
        <div
          ref={statsRef}
          className="w-full border-t border-[#e8c264]/20 pt-4 sm:pt-6 mt-6 sm:mt-10"
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-6 text-left">
            {displayStats.slice(0, 3).map((stat, idx) => {
              const Icon = idx === 0 ? Truck : idx === 1 ? ShieldCheck : CreditCard
              return (
                <div key={`${stat.value}-${stat.label}`} className="flex items-center gap-2 sm:gap-3">
                  <Icon size={19} className="text-[#e8c264] shrink-0 sm:w-6 sm:h-6 stroke-[1.8]" />
                  <div className="min-w-0">
                    <span className="block text-[11px] sm:text-sm font-bold tracking-tight text-white uppercase">
                      {translate(stat.value, currentLang)}
                    </span>
                    <span className="block text-[7.5px] sm:text-[10px] uppercase tracking-wider text-white/70 leading-tight truncate">
                      {translate(stat.label, currentLang)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
