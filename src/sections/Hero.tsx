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

const DEFAULT_HERO_VIDEOS = [
  'https://res.cloudinary.com/dwqxzzqpn/video/upload/v1787902113/t24_watches_videos/hero_video_transition_clean.mp4',
  'https://res.cloudinary.com/dwqxzzqpn/video/upload/v1787902117/t24_watches_videos/hero_video_orbiting_clean.mp4',
]

const DEFAULT_MOBILE_VIDEO = 'https://res.cloudinary.com/dwqxzzqpn/video/upload/v1787901807/t24_watches_videos/hero_video_mobile_clean.mp4'

export default function Hero({
  heroTitle = 'SWISS | PRECISION',
  heroSubtitleLabel = 'SUPER CLONE WATCHES DUBAI',
  heroSubtitleDesc = 'Best replica watches in Dubai. Super clone watches & clone watches.',
  heroBodyDescription = "Dubai's ultimate boutique for 1:1 super clone watches. Hand-calibrated with flawless sweep movements, premium Oystersteel, and sapphire crystals. Cash on delivery available.",
  heroCtaLabel = 'VIEW COLLECTION',
  heroCtaTarget = '#store',
  heroWatchImageUrl = '/watch-diver-green.jpg',
  heroVideos = DEFAULT_HERO_VIDEOS,
  heroMobileVideoUrl = DEFAULT_MOBILE_VIDEO,
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
  const watchPanelRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subheadRef = useRef<HTMLParagraphElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null)
  const [activeVideoIdx, setActiveVideoIdx] = useState(0)

  const currentLang = localStorage.getItem('t24_lang') || 'en'
  const isRtl = currentLang === 'ar'

  const videoList = heroVideos && heroVideos.length ? heroVideos : DEFAULT_HERO_VIDEOS

  // Handle Desktop Video Sequence Switching
  const handleVideoEnded = (idx: number) => {
    const nextIdx = (idx + 1) % videoList.length
    setActiveVideoIdx(nextIdx)
    const nextVideo = videoRefs.current[nextIdx]
    if (nextVideo) {
      nextVideo.currentTime = 0
      nextVideo.play().catch(() => {})
    }
  }

  // Ensure initial video plays
  useEffect(() => {
    const firstVideo = videoRefs.current[0]
    if (firstVideo) {
      firstVideo.play().catch(() => {})
    }
    if (mobileVideoRef.current) {
      mobileVideoRef.current.play().catch(() => {})
    }
  }, [])

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

      gsap.set(watchPanel, { opacity: 0, scale: 1.05 })
      gsap.set(glow, { opacity: 0, scale: 0.82 })
      gsap.set([eyebrow, subhead, body, cta, stats, marker], { opacity: 0, y: 28 })
      gsap.set(words, { opacity: 0, yPercent: 115, rotateX: -18 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.to(glow, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' })
        .to(watchPanel, { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, '-=0.65')
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
          yPercent: 4,
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
      className="relative isolate min-h-screen overflow-hidden bg-[#070605] pt-20 text-white flex items-center"
    >
      {/* Background soft ambient radial lighting */}
      <div 
        className={`absolute inset-0 -z-30 bg-[#050403] sm:bg-[radial-gradient(circle_at_${isRtl ? '22%' : '78%'}_28%,rgba(232,194,100,0.25),transparent_24%),radial-gradient(circle_at_${isRtl ? '12%' : '88%'}_70%,rgba(217,165,32,0.10),transparent_28%),linear-gradient(135deg,#050403_0%,#140b05_45%,#050403_100%)]`} 
      />
      <div
        ref={glowRef}
        className={`absolute top-[-10rem] -z-20 hidden h-[45rem] w-[45rem] rounded-full bg-[conic-gradient(from_120deg,rgba(217,165,32,0),rgba(217,165,32,0.32),rgba(232,194,100,0.22),rgba(235,203,122,0.42),rgba(217,165,32,0))] blur-3xl ${isRtl ? 'left-[-16rem]' : 'right-[-16rem]'}`}
      />

      {/* Cinematic Watch Advertisement Video Background Banner */}
      <div
        ref={watchPanelRef}
        className="absolute inset-0 -z-20 overflow-hidden pointer-events-none"
      >
        {/* Desktop / Tablet Sequential Clean Video Player */}
        <div className="hidden sm:block absolute inset-0">
          {videoList.map((src, idx) => (
            <video
              key={src}
              ref={(el) => { videoRefs.current[idx] = el }}
              src={src}
              autoPlay={idx === 0}
              muted
              playsInline
              preload="auto"
              onEnded={() => handleVideoEnded(idx)}
              className={`absolute inset-0 h-full w-full object-cover ${
                isRtl ? 'object-left md:object-center' : 'object-right md:object-center'
              } transition-opacity duration-1000 ${
                idx === activeVideoIdx ? 'opacity-90' : 'opacity-0 pointer-events-none'
              } brightness-[1.10] contrast-[1.08] saturate-[1.12]`}
            />
          ))}

          {/* Desktop Subtle Contrast Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050403] via-transparent to-[#050403]/60" />
          <div
            className={`absolute inset-0 ${
              isRtl
                ? 'bg-gradient-to-l from-[#050403]/90 via-[#050403]/60 to-transparent'
                : 'bg-gradient-to-r from-[#050403]/90 via-[#050403]/60 to-transparent'
            } w-[65%]` }
          />
        </div>

        {/* Mobile Portrait 9:16 Watermark-Free Video Player with Clean, Bright Visibility */}
        <div className="block sm:hidden absolute inset-0">
          <video
            ref={mobileVideoRef}
            src={heroMobileVideoUrl || DEFAULT_MOBILE_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-95 brightness-[1.15] contrast-[1.10] saturate-[1.15]"
          />
          {/* Subtle Mobile Vignettes - Keeping the Watch in the Center Clear & Luminous */}
          <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-[#050403]/80 via-[#050403]/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#050403]/90 via-[#050403]/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </div>

        <div className="absolute inset-0 bg-[#d9a520]/[0.02] mix-blend-screen pointer-events-none" />
      </div>

      <div className={`absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-[#e8c264]/50 to-transparent ${isRtl ? 'right-0 sm:right-8 lg:right-12' : 'left-0 sm:left-8 lg:left-12'}`} />
      <div className={`absolute top-28 hidden h-40 w-40 rounded-full border border-[#ebcb7a]/20 lg:block ${isRtl ? 'left-10' : 'right-10'}`} />
      <div className={`absolute top-40 hidden h-24 w-24 rounded-full border border-[#e8c264]/20 lg:block ${isRtl ? 'left-20' : 'right-20'}`} />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center px-6 py-7 sm:px-10 sm:py-8 lg:px-14">
        <div className="w-full max-w-[42rem]">
          <p
            ref={eyebrowRef}
            className="mb-4 sm:mb-6 inline-flex items-center gap-2.5 sm:gap-3 border border-[#e8c264]/35 bg-[#120b04]/70 px-3.5 py-1.5 sm:px-4 sm:py-2 font-body text-[10px] font-medium uppercase tracking-[0.35em] sm:tracking-[0.46em] text-[#ebcb7a] shadow-[0_0_25px_rgba(217,165,32,0.2)] backdrop-blur-md sm:text-xs rounded-full"
          >
            <Sparkles size={13} className="text-[#e8c264]" />
            {heroData.subtitleLabel}
          </p>

          <h1
            ref={headingRef}
            className="font-body text-[clamp(2.8rem,7vw,6.75rem)] font-semibold uppercase leading-[0.9] sm:leading-[0.88] tracking-[-0.05em] text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)]"
          >
            {titleLines.map((line, lineIndex) => (
              <span key={line} className="block overflow-hidden pb-2 sm:pb-3">
                {line.split(' ').map((word, wordIndex) => (
                  <span key={`${lineIndex}-${wordIndex}-${word}`}>
                    <span
                      className={lineIndex === titleLines.length - 1 ? 'hero-word inline-block bg-gradient-to-r from-[#d9a520] via-[#e8c264] to-[#ebcb7a] bg-clip-text pr-[0.12em] text-transparent drop-shadow-[0_4px_24px_rgba(217,165,32,0.4)]' : 'hero-word inline-block pr-[0.12em]'}
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
            className="mt-2 max-w-xl font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e8c264] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] sm:mt-2 sm:text-xs sm:tracking-[0.32em]"
          >
            {heroData.subtitleDesc}
          </p>

          <p
            ref={bodyRef}
            className="mt-3.5 max-w-lg font-body text-xs sm:text-[15px] leading-6 sm:leading-7 text-white/95 sm:text-[#ffffffb3] drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]"
          >
            {heroData.bodyDescription}
          </p>

          <div className="mt-5 sm:mt-7 flex flex-col gap-5 sm:flex-row sm:items-center">
            <a
              ref={ctaRef}
              href={collectionTarget}
              className="relative z-20 group inline-flex w-fit items-center gap-3.5 sm:gap-4 rounded-full border border-[#ebcb7a]/80 bg-gradient-to-r from-[#d9a520] via-[#e8c264] to-[#ebcb7a] px-6 py-3.5 sm:px-7 sm:py-4 font-body text-xs font-bold uppercase tracking-[0.22em] text-[#090604] shadow-[0_12px_45px_rgba(217,165,32,0.45),0_0_35px_rgba(232,194,100,0.3)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_90px_rgba(217,165,32,0.6),0_0_58px_rgba(235,203,122,0.4)]"
            >
              <span>{heroData.ctaLabel}</span>
              <ArrowRight size={16} className={`transition duration-300 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </a>
          </div>

          <div
            ref={statsRef}
            className="mt-6 sm:mt-8 grid max-w-2xl grid-cols-3 gap-2 border-y border-[#ebcb7a]/25 bg-black/40 py-3.5 sm:py-4 text-center font-body text-[9px] uppercase tracking-normal text-white/90 backdrop-blur-md sm:gap-3 sm:text-xs sm:tracking-[0.22em] rounded-xl"
          >
            {displayStats.slice(0, 3).map((stat) => (
              <div key={`${stat.value}-${stat.label}`}>
                <span className="mb-0.5 sm:mb-1 block text-base sm:text-xl font-black tracking-[-0.04em] text-[#ebcb7a]">
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
        className={`absolute bottom-8 hidden max-w-[15rem] items-center gap-4 rounded-full border border-[#ebcb7a]/25 bg-black/40 px-5 py-3 font-body text-[10px] uppercase tracking-[0.22em] text-white/85 shadow-[0_0_50px_rgba(217,165,32,0.16)] backdrop-blur-xl sm:flex ${isRtl ? 'left-6 lg:left-14' : 'right-6 lg:right-14'}`}
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
