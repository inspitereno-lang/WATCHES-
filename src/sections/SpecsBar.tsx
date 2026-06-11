import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Spec {
  title: string
  details: string[]
}

const defaultSpecs: Spec[] = [
  {
    title: '1:1 SWISS MOVEMENT',
    details: ['VS3235 & Caliber 4130 Clones', 'Flawless Sweep & Chronograph'],
  },
  {
    title: '904L OYSTERSTEEL',
    details: ['Highly Corrosion Resistant', 'Genuine Luxury Weight'],
  },
  {
    title: 'SAPPHIRE CRYSTAL',
    details: ['Anti-Reflective Coating', 'Scratch-Proof Durability'],
  },
]

export default function SpecsBar({ items }: { items?: Spec[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const specsList = items && items.length > 0 ? items : defaultSpecs

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const elements = section.querySelectorAll('.spec-item')

      gsap.set(elements, { opacity: 0, y: 30 })

      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    }, section)

    return () => ctx.revert()
  }, [specsList])

  return (
    <section
      ref={sectionRef}
      className="relative bg-charcoal border-t border-white/5 py-10 lg:py-12"
    >
      <div className="w-full px-6 lg:px-12 xl:px-20">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">
          {specsList.map((spec, index) => (
            <div key={spec.title} className="flex items-center gap-8 lg:gap-0">
              <div className="spec-item text-center lg:px-12 xl:px-16">
                <h3 className="font-body text-sm lg:text-base tracking-[0.15em] text-white mb-2">
                  {spec.title}
                </h3>
                <div className="space-y-0.5">
                  {spec.details && spec.details.map((detail) => (
                    <p
                      key={detail}
                      className="font-body text-xs text-silver"
                    >
                      {detail}
                    </p>
                  ))}
                </div>
              </div>

              {index < specsList.length - 1 && (
                <div className="hidden lg:block text-gold/50 font-body text-xl px-4 select-none">
                  →
                </div>
              )}

              {index < specsList.length - 1 && (
                <div className="lg:hidden w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent my-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
