import { useLayoutEffect, useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
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
  heroWatchLabelLine1?: string
  heroWatchLabelLine2?: string
  heroWatchLabelLine3?: string
  heroWatchLabelLine4?: string
  heroStats?: Array<{
    value: string
    label: string
  }>
}

export default function Hero({
  heroTitle = 'SWISS | PRECISION',
  heroSubtitleLabel = 'SUPER CLONE WATCHES DUBAI',
  heroSubtitleDesc = 'Best replica watches in Dubai. Master copy watches & clone watches.',
  heroBodyDescription = "Dubai's ultimate boutique for 1:1 super clone watches. Hand-calibrated with flawless sweep movements, premium Oystersteel, and sapphire crystals. Cash on delivery available.",
  heroCtaLabel = 'VIEW COLLECTION',
  heroCtaTarget = '#store',
  heroWatchImageUrl = '/watch-diver-green.jpg',
  heroWatchLabelLine1 = 'SWISS',
  heroWatchLabelLine2 = 'DUBAI EDITION',
  heroWatchLabelLine3 = 'PREMIUM OYSTERSTEEL',
  heroWatchLabelLine4 = '1:1 BUILD',
  heroStats = [
    { value: 'FREE', label: 'Same-day delivery' },
    { value: '2 YR', label: 'Service warranty' },
    { value: 'COD', label: 'Multiple payments' },
  ],
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const watchPanelRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subheadRef = useRef<HTMLParagraphElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)

  const [currentSlide, setCurrentSlide] = useState(0)
  const currentLang = localStorage.getItem('t24_lang') || 'en'
  const isRtl = currentLang === 'ar'

  const slideshowImages = Array.from(
    new Set(
      [
        '/hero-brands/richard-mille-rm11.png',
        '/hero-brands/patek-philippe-nautilus.png',
        '/hero-brands/audemars-piguet-royal-oak.png',
        '/hero-brands/rolex-daytona.png',
        '/hero-brands/cartier-santos.png'
      ].filter(
        (src) =>
          src &&
          !src.includes('eehkzalmujmziwekwq9a.png') &&
          !src.includes('hero-watch.png')
      )
    )
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [slideshowImages.length])

  const heroData = {
    title: heroTitle,
    subtitleLabel: heroSubtitleLabel,
    subtitleDesc: heroSubtitleDesc,
    bodyDescription: heroBodyDescription,
    ctaLabel: heroCtaLabel,
    ctaTarget: heroCtaTarget,
    watchImageUrl: heroWatchImageUrl,
    watchLabelLine1: heroWatchLabelLine1,
    watchLabelLine2: heroWatchLabelLine2,
    watchLabelLine3: heroWatchLabelLine3,
    watchLabelLine4: heroWatchLabelLine4,
    stats: heroStats,
  }

  useLayoutEffect(() => {
    const section = sectionRef.current
    const image = imageRef.current
    const watchPanel = watchPanelRef.current
    const glow = glowRef.current
    const eyebrow = eyebrowRef.current
    const heading = headingRef.current
    const subhead = subheadRef.current
    const body = bodyRef.current
    const cta = ctaRef.current
    const stats = statsRef.current
    const marker = markerRef.current

    if (!section || !image || !watchPanel || !glow || !eyebrow || !heading || !subhead || !body || !cta || !stats || !marker) return

    const ctx = gsap.context(() => {
      const words = heading.querySelectorAll('.hero-word')

      gsap.set(watchPanel, { opacity: 0, xPercent: isRtl ? -10 : 10, rotate: isRtl ? -1.5 : 1.5 })
      gsap.set(image, { scale: 1.18, opacity: 0, filter: 'saturate(1.15) contrast(1.08) brightness(1.05)' })
      gsap.set(glow, { opacity: 0, scale: 0.82 })
      gsap.set([eyebrow, subhead, body, cta, stats, marker], { opacity: 0, y: 28 })
      gsap.set(words, { opacity: 0, yPercent: 115, rotateX: -18 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.to(glow, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' })
        .to(watchPanel, { opacity: 1, xPercent: 0, rotate: 0, duration: 1, ease: 'power3.out' }, '-=0.65')
        .to(image, { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, '-=0.95')
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

      gsap.matchMedia().add('(min-width: 1024px)', () => {
        gsap.to(watchPanel, {
          yPercent: 6,
          xPercent: isRtl ? 8 : -8,
          rotate: isRtl ? 0.45 : -0.45,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      })

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
    !heroData.ctaTarget || heroData.ctaTarget === '#store'
      ? '/collections'
      : heroData.ctaTarget
  const displayStats = heroData.stats?.length ? heroData.stats : [
    { value: 'FREE', label: 'Same-day delivery' },
    { value: '2 YR', label: 'Service warranty' },
    { value: 'COD', label: 'Multiple payments' },
  ]

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative isolate min-h-screen overflow-hidden bg-[#050403] pt-20 text-white"
    >
      <div 
        className={`absolute inset-0 -z-30 bg-[#050403] sm:bg-[radial-gradient(circle_at_${isRtl ? '22%' : '78%'}_28%,rgba(232,194,100,0.30),transparent_24%),radial-gradient(circle_at_${isRtl ? '12%' : '88%'}_70%,rgba(217,165,32,0.12),transparent_28%),linear-gradient(135deg,#050403_0%,#140b05_45%,#050403_100%)]`} 
      />
      <div
        ref={glowRef}
        className={`absolute top-[-10rem] -z-20 hidden h-[45rem] w-[45rem] rounded-full bg-[conic-gradient(from_120deg,rgba(217,165,32,0),rgba(217,165,32,0.32),rgba(232,194,100,0.22),rgba(235,203,122,0.42),rgba(217,165,32,0))] blur-3xl ${isRtl ? 'left-[-16rem]' : 'right-[-16rem]'}`}
      />

      <div
        ref={watchPanelRef}
        className={`absolute bottom-0 top-20 -z-20 w-[138vw] overflow-hidden sm:top-14 sm:w-[105vw] lg:top-20 lg:w-[60vw] ${
          isRtl
            ? 'left-[-48vw] sm:left-[-12vw] lg:left-[-4vw]'
            : 'left-[-19vw] sm:left-auto sm:right-[-12vw] lg:right-0'
        }`}
      >
        {slideshowImages.map((src, idx) => (
          <img
            key={src}
            ref={idx === 0 ? imageRef : undefined}
            src={src}
            alt={`Luxury watch hero slide ${idx + 1}`}
            loading={idx === 0 ? 'eager' : 'lazy'}
            fetchPriority={idx === 0 ? 'high' : 'low'}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-contain transition-all duration-[1500ms] ease-in-out will-change-transform ${
              isRtl
                ? 'object-center sm:object-left'
                : 'object-center sm:object-right'
            } ${
              idx === currentSlide
                ? 'opacity-100 scale-[1.04] brightness-[1.32] contrast-[1.05] saturate-[1.16] sm:scale-[1.02] sm:brightness-[1.42] lg:scale-100 lg:brightness-[1.58] lg:contrast-[1.03] lg:saturate-[1.18]'
                : 'opacity-0 scale-[1.00] brightness-[1.0] contrast-[1.0] saturate-[1.0]'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050403]/10 via-transparent to-[#050403]/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(235,203,122,0.14),transparent_34%)] mix-blend-screen" />
        <div className={`absolute inset-y-0 w-[58%] ${isRtl ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'} from-[#050403]/95 via-[#050403]/55 to-transparent sm:w-1/2 lg:w-[42%]`} />
      </div>

      <div
        className={`absolute inset-0 -z-10 hidden sm:block ${
          isRtl
            ? 'bg-[linear-gradient(270deg,rgba(5,4,3,0.96)_0%,rgba(5,4,3,0.82)_28%,rgba(5,4,3,0.18)_58%,rgba(5,4,3,0.06)_100%),linear-gradient(180deg,rgba(5,4,3,0.18)_0%,rgba(5,4,3,0.06)_45%,#050403_100%)]'
            : 'bg-[linear-gradient(90deg,rgba(5,4,3,0.96)_0%,rgba(5,4,3,0.82)_28%,rgba(5,4,3,0.18)_58%,rgba(5,4,3,0.06)_100%),linear-gradient(180deg,rgba(5,4,3,0.18)_0%,rgba(5,4,3,0.06)_45%,#050403_100%)]'
        }`}
      />
      <div
        className={`absolute inset-0 -z-10 sm:hidden ${
          isRtl
            ? 'bg-[linear-gradient(180deg,rgba(5,4,3,0.04)_0%,rgba(5,4,3,0.30)_46%,rgba(5,4,3,0.88)_100%),linear-gradient(270deg,rgba(5,4,3,0.74),rgba(5,4,3,0.10))]'
            : 'bg-[linear-gradient(180deg,rgba(5,4,3,0.04)_0%,rgba(5,4,3,0.30)_46%,rgba(5,4,3,0.88)_100%),linear-gradient(90deg,rgba(5,4,3,0.74),rgba(5,4,3,0.10))]'
        }`}
      />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-[#050403] to-transparent" />
      <div className={`absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-[#e8c264]/50 to-transparent ${isRtl ? 'right-0 sm:right-8 lg:right-12' : 'left-0 sm:left-8 lg:left-12'}`} />
      <div className={`absolute top-28 hidden h-40 w-40 rounded-full border border-[#ebcb7a]/20 lg:block ${isRtl ? 'left-10' : 'right-10'}`} />
      <div className={`absolute top-40 hidden h-24 w-24 rounded-full border border-[#e8c264]/20 lg:block ${isRtl ? 'left-20' : 'right-20'}`} />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center px-6 py-7 sm:px-10 sm:py-8 lg:px-14">
        <div className="w-full max-w-[42rem]">
          <p
            ref={eyebrowRef}
            className="mb-5 inline-flex items-center gap-3 border border-[#e8c264]/25 bg-[#120b04]/35 px-4 py-2 font-body text-[10px] font-medium uppercase tracking-[0.42em] text-[#ebcb7a] shadow-[0_0_35px_rgba(217,165,32,0.14)] backdrop-blur-md sm:mb-6 sm:tracking-[0.46em] sm:text-xs"
          >
            <Sparkles size={14} />
            {heroData.subtitleLabel}
          </p>

          <h1
            ref={headingRef}
            className="font-body text-[clamp(3rem,6.8vw,6.75rem)] font-semibold uppercase leading-[0.88] tracking-[-0.055em] text-white drop-shadow-[0_8px_42px_rgba(0,0,0,0.88)] sm:leading-[0.9]"
          >
            {titleLines.map((line, lineIndex) => (
              <span key={line} className="block overflow-hidden pb-3">
                {line.split(' ').map((word, wordIndex) => (
                  <span key={`${lineIndex}-${wordIndex}-${word}`}>
                    <span
                      className={lineIndex === titleLines.length - 1 ? 'hero-word inline-block bg-gradient-to-r from-[#d9a520] via-[#e8c264] to-[#ebcb7a] bg-clip-text pr-[0.12em] text-transparent' : 'hero-word inline-block pr-[0.12em]'}
                    >
                      {word}
                    </span>{' '}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p
            ref={subheadRef}
            className="mt-1 max-w-xl font-body text-[10px] font-medium uppercase tracking-[0.12em] text-[#e8c264] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:mt-2 sm:text-xs sm:tracking-[0.32em]"
          >
            {heroData.subtitleDesc}
          </p>

          <p
            ref={bodyRef}
            className="mt-4 max-w-lg font-body text-sm leading-7 text-[#ffffffe8] drop-shadow-[0_2px_18px_rgba(0,0,0,0.92)] sm:mt-5 sm:text-[15px] sm:text-[#ffffffb3]"
          >
            {heroData.bodyDescription}
          </p>

          <div className="mt-6 flex flex-col gap-5 sm:mt-7 sm:flex-row sm:items-center">
            <a
              ref={ctaRef}
              href={collectionTarget}
              className="relative z-20 group inline-flex w-fit items-center gap-4 rounded-full border border-[#ebcb7a]/70 bg-gradient-to-r from-[#d9a520] via-[#e8c264] to-[#ebcb7a] px-7 py-4 font-body text-xs font-bold uppercase tracking-[0.24em] text-[#090604] shadow-[0_18px_70px_rgba(217,165,32,0.36),0_0_42px_rgba(232,194,100,0.22)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_90px_rgba(217,165,32,0.48),0_0_58px_rgba(235,203,122,0.28)]"
            >
              <span>{heroData.ctaLabel}</span>
              <ArrowRight size={17} className={`transition duration-300 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </a>
          </div>

          <div
            ref={statsRef}
            className="mt-7 grid max-w-2xl grid-cols-3 gap-2 border-y border-[#ebcb7a]/20 bg-black/10 py-4 text-center font-body text-[9px] uppercase tracking-normal text-white/75 backdrop-blur-[2px] sm:mt-8 sm:gap-3 sm:text-xs sm:tracking-[0.22em]"
          >
            {displayStats.slice(0, 3).map((stat) => (
              <div key={`${stat.value}-${stat.label}`}>
                <span className="mb-1 block text-lg font-black tracking-[-0.04em] text-[#ebcb7a] sm:text-xl">
                  {translate(stat.value, currentLang)}
                </span>
                {translate(stat.label, currentLang)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={markerRef}
        className={`absolute bottom-8 hidden max-w-[15rem] items-center gap-4 rounded-full border border-[#ebcb7a]/25 bg-black/24 px-5 py-3 font-body text-[10px] uppercase tracking-[0.22em] text-white/78 shadow-[0_0_50px_rgba(217,165,32,0.16)] backdrop-blur-xl sm:flex ${isRtl ? 'left-6 lg:left-14' : 'right-6 lg:right-14'}`}
      >
        <ShieldCheck size={18} className="text-[#ebcb7a]" />
        <span>
          {translate(heroData.watchLabelLine1 || 'Authenticated', currentLang)}{' '}
          <strong className="text-[#ebcb7a]">{translate(heroData.watchLabelLine4 || 'Edition', currentLang)}</strong>
        </span>
      </div>
    </section>
  )
}
