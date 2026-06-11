import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface NocturneProps {
  nocturneHeading1?: string
  nocturneHeading2?: string
  nocturneCopy?: string
  nocturneBuildSpec?: string
  nocturneImage?: string
}

export default function Nocturne({
  nocturneHeading1 = 'RICHARD',
  nocturneHeading2 = 'MILLE',
  nocturneCopy = 'An exact 1:1 replica of the RM 68-01 Cyril Kongo Tourbillon, blending haute horlogerie with street art aesthetics.',
  nocturneBuildSpec = 'KV FACTORY BUILD SPEC',
  nocturneImage = 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F04%2FIMG_3434-300x300.webp',
}: NocturneProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const heading = section.querySelector('.nocturne-heading')
      const copy = section.querySelector('.nocturne-copy')
      const image = section.querySelector('.nocturne-image')

      gsap.set([heading, copy], { opacity: 0, y: 40 })
      gsap.set(image, { opacity: 0, scale: 1.05 })

      gsap.to(heading, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(copy, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 55%',
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
      id="craftsmanship"
      className="relative bg-dark py-20 lg:py-32 overflow-hidden"
    >
      <div className="w-full px-6 lg:px-12 xl:px-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left - Typography */}
          <div className="lg:w-1/2">
            <h2 className="nocturne-heading font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white leading-[0.95] mb-8 uppercase font-light">
              {nocturneHeading1}
              <br />
              <span className="font-bold text-white">{nocturneHeading2}</span>
            </h2>

            <p className="nocturne-copy font-body text-lg lg:text-xl text-silver leading-relaxed max-w-md italic mb-4 font-light">
              &ldquo;{nocturneCopy}&rdquo;
            </p>
            <p className="font-body text-sm text-gold font-mono uppercase tracking-widest font-semibold">
              {nocturneBuildSpec}
            </p>
          </div>

          {/* Right - Image */}
          <div className="lg:w-1/2">
            <div className="nocturne-image relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex items-center justify-center">
              <img
                src={nocturneImage}
                alt={`${nocturneHeading1} ${nocturneHeading2} Custom Build`}
                className="w-full h-auto object-cover max-h-[500px]"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
