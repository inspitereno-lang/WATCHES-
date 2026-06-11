import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface HeroData {
  title: string
  subtitleLabel: string
  subtitleDesc: string
  bodyDescription: string
  ctaLabel: string
  ctaTarget: string
  watchImageUrl: string
  watchLabelLine1?: string
  watchLabelLine2?: string
  watchLabelLine3?: string
  watchLabelLine4?: string
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subheadRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const watchRef = useRef<HTMLImageElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)

  const [heroData, setHeroData] = useState<HeroData>({
    title: 'THE ART OF | 1:1 SWISS CLONES',
    subtitleLabel: 'T24 WATCHES DUBAI:',
    subtitleDesc: 'Indistinguishable Swiss movements & 904L Oystersteel',
    bodyDescription: 'Indulge in absolute luxury. Our hand-curated 1:1 Swiss Clone replica watches are visually and mechanically identical to the originals, engineered for those who demand uncompromising perfection.',
    ctaLabel: 'SHOP 1:1 CLONE WATCHES',
    ctaTarget: '#store',
    watchImageUrl: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171809/t24_watches_defaults/eehkzalmujmziwekwq9a.png',
    watchLabelLine1: 'AETERNA',
    watchLabelLine2: 'NOCTURNE',
    watchLabelLine3: 'ROSE GOLD',
    watchLabelLine4: 'CHRONOGRAPH'
  })
  const [loading, setLoading] = useState(true)

  // Fetch Hero content from MongoDB Atlas API
  useEffect(() => {
    fetch('/api/hero')
      .then((res) => {
        if (!res.ok) throw new Error('API failure')
        return res.json()
      })
      .then((data) => {
        if (data) {
          setHeroData(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch hero copy:', err)
        setLoading(false)
      })
  }, [])

  // GSAP Animations - run only when loading completes and elements exist
  useEffect(() => {
    if (loading) return

    const section = sectionRef.current
    const heading = headingRef.current
    const subhead = subheadRef.current
    const body = bodyRef.current
    const cta = ctaRef.current
    const watch = watchRef.current
    const label = labelRef.current

    if (!section || !heading || !subhead || !body || !cta || !watch || !label) return

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set([subhead, body, cta], { opacity: 0, y: 30 })
      gsap.set(watch, { opacity: 0, scale: 0.95, x: 50 })
      gsap.set(label, { opacity: 0, y: 20 })

      // Split heading into words for animation
      const words = heading.querySelectorAll('.word')
      gsap.set(words, { opacity: 0, y: 100 })

      // Master timeline
      const tl = gsap.timeline({ delay: 0.5 })

      // Heading words animation
      tl.to(words, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.1,
      })

      // Subhead
      tl.to(
        subhead,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.6'
      )

      // Body
      tl.to(
        body,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.5'
      )

      // CTA
      tl.to(
        cta,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.5'
      )

      // Watch image
      tl.to(
        watch,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 1.4,
          ease: 'power2.out',
        },
        '-=1'
      )

      // Label
      tl.to(
        label,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.6'
      )

      // Parallax on scroll
      gsap.to(watch, {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [loading])

  // Split title by '|' separator, then by spaces, preserving word spans for GSAP
  const renderTitle = () => {
    const titleText = heroData.title || 'THE ART OF | 1:1 SWISS CLONES'
    const lines = titleText.split(' | ')
    return lines.map((line, lineIdx) => (
      <span key={lineIdx} className="block">
        {line.split(' ').map((word, wordIdx) => (
          <span key={wordIdx} className="word inline-block mr-[0.25em]">
            {word}
          </span>
        ))}
      </span>
    ))
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen bg-charcoal overflow-hidden pt-16 sm:pt-20"
    >
      {/* Subtle spotlight background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20 pt-8 sm:pt-12 lg:pt-10 pb-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center min-h-[calc(100vh-8rem)] lg:min-h-[75vh]">
          {/* Left Content - 45% */}
          <div className="w-full lg:w-[45%] lg:pr-8 xl:pr-16">
            <h1
              ref={headingRef}
              className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-[85px] text-gold leading-[0.95] tracking-normal mb-5 sm:mb-6"
            >
              {renderTitle()}
            </h1>

            <div ref={subheadRef} className="mb-4">
              <p className="font-body text-xs tracking-[0.2em] text-white mb-1">
                {heroData.subtitleLabel}
              </p>
              <p className="font-body text-sm text-silver font-light">
                {heroData.subtitleDesc}
              </p>
            </div>

            <p
              ref={bodyRef}
              className="font-body text-sm text-silver leading-relaxed max-w-md mb-6"
            >
              {heroData.bodyDescription}
            </p>

            <a
              ref={ctaRef}
              href={heroData.ctaTarget}
              className="cta-button inline-flex items-center gap-3 px-8 py-3.5 border border-white/30 rounded-full font-body text-xs tracking-[0.15em] text-white hover:border-gold transition-colors duration-500 group"
            >
              <span className="relative z-10">{heroData.ctaLabel}</span>
              <ArrowRight
                size={16}
                className="relative z-10 text-gold group-hover:translate-x-1 transition-transform duration-300"
              />
            </a>
          </div>

          {/* Right Content - 60% - Watch Image */}
          <div className="w-full lg:w-[60%] relative mt-6 sm:mt-8 lg:mt-0">
            <div className="relative">
              <img
                ref={watchRef}
                src={heroData.watchImageUrl}
                alt="Aeterna Nocturne Rose Gold Chronograph"
                className="w-full max-w-[600px] lg:max-w-[700px] xl:max-w-[800px] mx-auto lg:ml-auto lg:mr-0 object-contain"
              />

              {/* Floating Product Label */}
              <div
                ref={labelRef}
                className="absolute bottom-12 right-4 lg:right-8 text-right"
              >
                {heroData.watchLabelLine1 && (
                  <p className="font-body text-[10px] tracking-[0.2em] text-silver">
                    {heroData.watchLabelLine1.toUpperCase()}
                  </p>
                )}
                {heroData.watchLabelLine2 && (
                  <p className="font-body text-[10px] tracking-[0.2em] text-silver">
                    {heroData.watchLabelLine2.toUpperCase()}
                  </p>
                )}
                {heroData.watchLabelLine3 && (
                  <p className="font-body text-[10px] tracking-[0.2em] text-silver">
                    {heroData.watchLabelLine3.toUpperCase()}
                  </p>
                )}
                {heroData.watchLabelLine4 && (
                  <p className="font-body text-[10px] tracking-[0.2em] text-gold">
                    {heroData.watchLabelLine4.toUpperCase()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
