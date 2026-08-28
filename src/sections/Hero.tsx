import { useLayoutEffect, useRef, useEffect, useState } from 'react'
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

const DEFAULT_DESKTOP_POSTER = 'https://res.cloudinary.com/dwqxzzqpn/video/upload/q_auto,f_auto,so_0/v1787902113/t24_watches_videos/hero_video_transition_clean.jpg'
const DEFAULT_MOBILE_POSTER = 'https://res.cloudinary.com/dwqxzzqpn/video/upload/q_auto,f_auto,so_0/v1787901807/t24_watches_videos/hero_video_mobile_clean.jpg'

// Desktop video sequence: 2 videos that alternate
const DESKTOP_VIDEOS_WEBM = [
  'https://res.cloudinary.com/dwqxzzqpn/video/upload/q_70,vc_vp9/v1787902113/t24_watches_videos/hero_video_transition_clean.webm',
  'https://res.cloudinary.com/dwqxzzqpn/video/upload/q_70,vc_vp9/v1787902117/t24_watches_videos/hero_video_orbiting_clean.webm',
]
const DESKTOP_VIDEOS_MP4 = [
  'https://res.cloudinary.com/dwqxzzqpn/video/upload/q_70,vc_h264/v1787902113/t24_watches_videos/hero_video_transition_clean.mp4',
  'https://res.cloudinary.com/dwqxzzqpn/video/upload/q_70,vc_h264/v1787902117/t24_watches_videos/hero_video_orbiting_clean.mp4',
]

export default function Hero({
  heroTitle = 'SWISS | PRECISION',
  heroSubtitleLabel = 'SUPER CLONE WATCHES DUBAI',
  heroSubtitleDesc = 'Best replica watches in Dubai. Super clone watches & clone watches.',
  heroBodyDescription = "Dubai's ultimate boutique for 1:1 super clone watches. Hand-calibrated with flawless sweep movements, premium Oystersteel, and sapphire crystals. Cash on delivery available.",
  heroCtaLabel = 'VIEW COLLECTION',
  heroCtaTarget = '#store',
  heroWatchImageUrl = '/watch-diver-green.jpg',
  heroVideoUrl,
  heroMobileVideoUrl,
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

  const desktopVideoRef0 = useRef<HTMLVideoElement | null>(null)
  const desktopVideoRef1 = useRef<HTMLVideoElement | null>(null)
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null)
  const [activeDesktopIdx, setActiveDesktopIdx] = useState(0)
  const [desktopVideoStarted, setDesktopVideoStarted] = useState(false)
  const [mobileVideoStarted, setMobileVideoStarted] = useState(false)

  const currentLang = localStorage.getItem('t24_lang') || 'en'
  const isRtl = currentLang === 'ar'

  // Ref callback for desktop video 0
  const setDesktopVideoRef0 = (el: HTMLVideoElement | null) => {
    desktopVideoRef0.current = el
    if (el) {
      el.muted = true
      // @ts-ignore
      el.defaultMuted = true
      el.setAttribute('muted', '')
      el.setAttribute('playsinline', '')
      el.setAttribute('webkit-playsinline', '')
      setTimeout(() => { el.play().catch(() => {}) }, 50)
      setTimeout(() => { el.play().catch(() => {}) }, 300)
    }
  }

  // Ref callback for desktop video 1
  const setDesktopVideoRef1 = (el: HTMLVideoElement | null) => {
    desktopVideoRef1.current = el
    if (el) {
      el.muted = true
      // @ts-ignore
      el.defaultMuted = true
      el.setAttribute('muted', '')
      el.setAttribute('playsinline', '')
      el.setAttribute('webkit-playsinline', '')
    }
  }

  // Ref callback for mobile video
  const setMobileVideoRef = (el: HTMLVideoElement | null) => {
    mobileVideoRef.current = el
    if (el) {
      el.muted = true
      // @ts-ignore
      el.defaultMuted = true
      el.setAttribute('muted', '')
      el.setAttribute('playsinline', '')
      el.setAttribute('webkit-playsinline', '')
      setTimeout(() => { el.play().catch(() => {}) }, 50)
      setTimeout(() => { el.play().catch(() => {}) }, 300)
      setTimeout(() => { el.play().catch(() => {}) }, 1000)
    }
  }

  // Persistent retry: keep trying to play until active video is playing
  useEffect(() => {
    const interval = setInterval(() => {
      const desk0 = desktopVideoRef0.current
      const mob = mobileVideoRef.current
      let allPlaying = true

      if (desk0 && desk0.paused && activeDesktopIdx === 0) {
        desk0.muted = true
        desk0.play().catch(() => {})
        allPlaying = false
      }
      if (mob && mob.paused) {
        mob.muted = true
        mob.play().catch(() => {})
        allPlaying = false
      }

      if (allPlaying) clearInterval(interval)
    }, 500)

    const timeout = setTimeout(() => clearInterval(interval), 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [activeDesktopIdx])

  // Unlock on ANY user gesture (not once — keep listening until videos play)
  useEffect(() => {
    let unlocked = false
    const unlockOnGesture = () => {
      if (unlocked) return
      const desk0 = desktopVideoRef0.current
      const desk1 = desktopVideoRef1.current
      const mob = mobileVideoRef.current
      let bothPlaying = true

      if (activeDesktopIdx === 0 && desk0 && desk0.paused) {
        desk0.muted = true
        desk0.play().catch(() => {})
        bothPlaying = false
      } else if (activeDesktopIdx === 1 && desk1 && desk1.paused) {
        desk1.muted = true
        desk1.play().catch(() => {})
        bothPlaying = false
      }
      if (mob && mob.paused) {
        mob.muted = true
        mob.play().then(() => setMobileVideoStarted(true)).catch(() => {})
        bothPlaying = false
      }

      if (bothPlaying) {
        unlocked = true
        window.removeEventListener('touchstart', unlockOnGesture)
        window.removeEventListener('touchend', unlockOnGesture)
        window.removeEventListener('touchmove', unlockOnGesture)
        window.removeEventListener('pointerdown', unlockOnGesture)
        window.removeEventListener('click', unlockOnGesture)
        window.removeEventListener('scroll', unlockOnGesture)
        window.removeEventListener('mousemove', unlockOnGesture)
        window.removeEventListener('keydown', unlockOnGesture)
      }
    }

    window.addEventListener('touchstart', unlockOnGesture, { passive: true })
    window.addEventListener('touchend', unlockOnGesture, { passive: true })
    window.addEventListener('touchmove', unlockOnGesture, { passive: true })
    window.addEventListener('pointerdown', unlockOnGesture, { passive: true })
    window.addEventListener('click', unlockOnGesture, { passive: true })
    window.addEventListener('scroll', unlockOnGesture, { passive: true })
    window.addEventListener('mousemove', unlockOnGesture, { passive: true })
    window.addEventListener('keydown', unlockOnGesture, { passive: true })

    return () => {
      window.removeEventListener('touchstart', unlockOnGesture)
      window.removeEventListener('touchend', unlockOnGesture)
      window.removeEventListener('touchmove', unlockOnGesture)
      window.removeEventListener('pointerdown', unlockOnGesture)
      window.removeEventListener('click', unlockOnGesture)
      window.removeEventListener('scroll', unlockOnGesture)
      window.removeEventListener('mousemove', unlockOnGesture)
      window.removeEventListener('keydown', unlockOnGesture)
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
        {/* Desktop / Tablet Video Player with Dual-Buffer Seamless Cross-Fade */}
        <div
          className="hidden sm:block absolute inset-0 pointer-events-none bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: desktopVideoStarted ? 'none' : `url(${DEFAULT_DESKTOP_POSTER})`,
          }}
        >
          {/* Video 0: Transition Watch */}
          <video
            ref={setDesktopVideoRef0}
            autoPlay
            muted
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            preload="auto"
            onCanPlay={(e) => {
              const v = e.currentTarget
              v.muted = true
              if (activeDesktopIdx === 0) v.play().catch(() => {})
            }}
            onPlaying={() => {
              if (activeDesktopIdx === 0) setDesktopVideoStarted(true)
            }}
            onEnded={() => {
              const v1 = desktopVideoRef1.current
              if (v1) {
                v1.currentTime = 0
                v1.muted = true
                v1.play().catch(() => {})
              }
              setActiveDesktopIdx(1)
            }}
            className={`absolute inset-0 h-full w-full object-cover ${
              isRtl ? 'object-left md:object-center' : 'object-right md:object-center'
            } brightness-[1.10] contrast-[1.08] saturate-[1.12] transition-opacity duration-1000 ${
              activeDesktopIdx === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <source
              src={heroVideoUrl && heroVideoUrl.startsWith('http')
                ? heroVideoUrl.replace('.mp4', '.webm').replace('vc_h264', 'vc_vp9')
                : DESKTOP_VIDEOS_WEBM[0]}
              type="video/webm"
            />
            <source
              src={heroVideoUrl && heroVideoUrl.startsWith('http')
                ? heroVideoUrl
                : DESKTOP_VIDEOS_MP4[0]}
              type="video/mp4"
            />
          </video>

          {/* Video 1: Orbiting Watch (Preloaded & Ready) */}
          <video
            ref={setDesktopVideoRef1}
            muted
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            preload="auto"
            onCanPlay={(e) => {
              const v = e.currentTarget
              v.muted = true
              if (activeDesktopIdx === 1) v.play().catch(() => {})
            }}
            onEnded={() => {
              const v0 = desktopVideoRef0.current
              if (v0) {
                v0.currentTime = 0
                v0.muted = true
                v0.play().catch(() => {})
              }
              setActiveDesktopIdx(0)
            }}
            className={`absolute inset-0 h-full w-full object-cover ${
              isRtl ? 'object-left md:object-center' : 'object-right md:object-center'
            } brightness-[1.10] contrast-[1.08] saturate-[1.12] transition-opacity duration-1000 ${
              activeDesktopIdx === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <source src={DESKTOP_VIDEOS_WEBM[1]} type="video/webm" />
            <source src={DESKTOP_VIDEOS_MP4[1]} type="video/mp4" />
          </video>

          {/* Desktop Subtle Contrast Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050403] via-transparent to-[#050403]/60 z-20 pointer-events-none" />
          <div
            className={`absolute inset-0 ${
              isRtl
                ? 'bg-gradient-to-l from-[#050403]/90 via-[#050403]/60 to-transparent'
                : 'bg-gradient-to-r from-[#050403]/90 via-[#050403]/60 to-transparent'
            } w-[65%] z-20 pointer-events-none`}
          />
        </div>

        {/* Mobile Portrait 9:16 Video Player with Zero Native Play Button Overlays */}
        <div
          className="block sm:hidden absolute inset-0 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage: `url(${DEFAULT_MOBILE_POSTER})`,
          }}
        >
          <video
            ref={setMobileVideoRef}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            preload="auto"
            onCanPlay={(e) => {
              const v = e.currentTarget
              v.muted = true
              v.play().then(() => {
                setMobileVideoStarted(true)
              }).catch(() => {})
            }}
            onLoadedData={(e) => {
              const v = e.currentTarget
              v.muted = true
              v.play().then(() => {
                setMobileVideoStarted(true)
              }).catch(() => {})
            }}
            onPlaying={() => setMobileVideoStarted(true)}
            className={`absolute inset-0 h-full w-full object-cover object-center brightness-[1.15] contrast-[1.10] saturate-[1.15] pointer-events-none transition-opacity duration-700 ${
              mobileVideoStarted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source
              src="https://res.cloudinary.com/dwqxzzqpn/video/upload/q_70,vc_vp9/v1787901807/t24_watches_videos/hero_video_mobile_clean.webm"
              type="video/webm"
            />
            <source
              src={heroMobileVideoUrl || 'https://res.cloudinary.com/dwqxzzqpn/video/upload/q_70,vc_h264/v1787901807/t24_watches_videos/hero_video_mobile_clean.mp4'}
              type="video/mp4"
            />
          </video>
          {/* Subtle Mobile Vignettes */}
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
              onClick={handleCtaClick}
              className="relative z-20 group inline-flex w-fit items-center gap-3.5 sm:gap-4 rounded-full border border-[#ebcb7a]/80 bg-gradient-to-r from-[#d9a520] via-[#e8c264] to-[#ebcb7a] px-6 py-3.5 sm:px-7 sm:py-4 font-body text-xs font-bold uppercase tracking-[0.22em] text-[#090604] shadow-[0_12px_45px_rgba(217,165,32,0.45),0_0_35px_rgba(232,194,100,0.3)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_90px_rgba(217,165,32,0.6),0_0_58px_rgba(235,203,122,0.4)] cursor-pointer"
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
