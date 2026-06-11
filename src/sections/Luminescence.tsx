import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface LuminescenceProps {
  lumeHeading1?: string
  lumeHeading2?: string
  lumeSubhead?: string
  lumeBody?: string
  lumeImage?: string
}

export default function Luminescence({
  lumeHeading1 = 'PATEK',
  lumeHeading2 = 'NAUTILUS',
  lumeSubhead = 'DIW ALL CARBON BLACK ORANGE',
  lumeBody = 'A customized, ultra-modern carbon-forged masterpiece by DIW. Extremely light, durable, featuring dynamic orange luminous hour markers and indicators that absorb UV light during the day to emit a soft, enduring glow in total darkness.',
  lumeImage = 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2024%2F10%2FIMG_0394-300x300.webp',
}: LuminescenceProps) {
  const sectionRef = useRef<HTMLElement>(null)

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
      className="relative bg-[#0A0A0A] py-20 lg:py-32 overflow-hidden"
    >
      <div className="w-full px-6 lg:px-12 xl:px-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left - Typography */}
          <div className="lg:w-1/2">
            <h2 className="lume-heading font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white leading-[0.95] mb-8 uppercase font-light">
              {lumeHeading1}
              <br />
              <span className="font-bold">{lumeHeading2}</span>
            </h2>

            <h3 className="lume-subhead font-body text-xl lg:text-2xl tracking-[0.1em] text-gold mb-6 uppercase">
              {lumeSubhead}
            </h3>

            <p className="lume-body font-body text-sm text-silver leading-relaxed max-w-md font-light">
              {lumeBody}
            </p>
          </div>

          {/* Right - Image */}
          <div className="lg:w-1/2">
            <div className="lume-image relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex items-center justify-center">
              <img
                src={lumeImage}
                alt={`${lumeHeading1} ${lumeHeading2} Orange Lume Dial`}
                className="w-full h-auto object-cover max-h-[500px]"
              />
              {/* Glow overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
