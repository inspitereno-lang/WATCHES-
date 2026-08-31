import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { translate } from '../utils/translate'

gsap.registerPlugin(ScrollTrigger)

interface LuminescenceProps {
  lumeHeading1?: string
  lumeHeading2?: string
  lumeSubhead?: string
  lumeBody?: string
  lumeImage?: string
}

export default function Luminescence({
  lumeHeading1 = 'ARCHITECTURE',
  lumeHeading2 = 'OF TIME',
  lumeSubhead = 'CASE, DIAL, MOVEMENT',
  lumeBody = 'Discover the best copy watches and super clone watches in Dubai, crafted with replica-watch detailing, refined case architecture, exposed movement depth, and polished gold finishing for collectors seeking premium replica watches in Dubai.',
  lumeImage = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1783924974/t24_watches_defaults/watch-architecture.webp',
}: LuminescenceProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const currentLang = localStorage.getItem('t24_lang') || 'en'

  const heading1 = translate(lumeHeading1, currentLang)
  const heading2 = translate(lumeHeading2, currentLang)
  const subhead = translate(lumeSubhead, currentLang)
  const body = translate(lumeBody, currentLang)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const heading = section.querySelector('.lume-heading')
      const subhead = section.querySelector('.lume-subhead')
      const body = section.querySelector('.lume-body')
      const image = section.querySelector('.lume-image')

      gsap.set([heading, subhead, body], { opacity: 0, y: 40 })
      gsap.set(image, { opacity: 0, scale: 1.05 })

      gsap.to(heading, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(subhead, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(body, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 50%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(image, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 65%',
          toggleActions: 'play none none none',
        },
      })

      // Parallax on image
      if (image) {
        gsap.to(image, {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="architecture"
      className="hidden lg:block relative overflow-hidden bg-black pt-16 pb-10 lg:pt-20 lg:pb-14"
    >
      <div className="absolute left-[-16rem] top-1/3 h-[30rem] w-[30rem] rounded-full bg-[#d9a520]/10 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8c264]/30 to-transparent" />

      <div className="w-full px-6 lg:px-12 xl:px-20">
        <div className="relative z-10 flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          <div className="lg:w-1/2">
            <h2 className="lume-heading font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white leading-[0.95] mb-8 uppercase font-light">
              {heading1}
              <br />
              <span className="font-bold text-[#e8c264]">{heading2}</span>
            </h2>

            <h3 className="lume-subhead font-body text-xl lg:text-2xl tracking-[0.1em] text-gold mb-6 uppercase">
              {subhead}
            </h3>

            <p className="lume-body font-body text-sm text-silver leading-relaxed max-w-md font-light">
              {body}
            </p>
          </div>

          <div className="lg:w-1/2">
            <div className="lume-image relative flex items-center justify-center overflow-hidden rounded-[2rem] border border-[#ebcb7a]/15 bg-white/[0.02] p-3 shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
              <img
                src={lumeImage}
                alt="Watch architecture case and movement study"
                className="h-auto max-h-[560px] w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
