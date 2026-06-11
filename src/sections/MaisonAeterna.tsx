import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface MaisonAeternaProps {
  heritageHeading1?: string
  heritageHeading2?: string
  heritageDesc1?: string
  heritageDesc2?: string
  heritageDesc3?: string
  heritageImage?: string
  heritageCaptionLabel?: string
  heritageCaptionText?: string
}

export default function MaisonAeterna({
  heritageHeading1 = 'T24',
  heritageHeading2 = 'ATELIER',
  heritageDesc1 = 'At T24 Watches, we stand at the intersection of legendary horology design and accessibility. Our state-of-the-art custom watchmaking laboratory is dedicated to the micro-engineering and meticulous hand-assembly of premium 1:1 luxury replica watches. Every Swiss clone watch that leaves our workspace undergoes rigorous multi-point testing, guaranteeing weight distribution and sweeps that are indistinguishable from authentic luxury watches.',
  heritageDesc2 = 'Our atelier brings together skilled watch artisans who specialize in the tuning of clone movements (such as the Clean Factory Caliber 4130 and VSF VS3235). By disassembling, lubricating, and recalibrating each mechanical movement, we ensure that our first-copy watches operate with the exact same fluid sweep, tick rate, and long-term durability as genuine Swiss timepieces.',
  heritageDesc3 = 'From our custom Daytona configurations to complex NTPT carbon fiber casing, we push the boundaries of replica horology. We use only premium materials like 904L anti-corrosive Oystersteel, white gold electroplated fluted bezels, and double-sided anti-reflective sapphire crystals. We are proud to deliver the ultimate watch collecting experience directly to your doorstep in Dubai and worldwide.',
  heritageImage = '/heritage-watchmaker.jpg',
  heritageCaptionLabel = 'FROM THE EYES OF THE ARTISAN',
  heritageCaptionText = 'Every custom T24 Swiss clone undergoes 100+ hours of calibration and pressure testing to ensure flawless precision',
}: MaisonAeternaProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const heading = section.querySelector('.maison-heading')
      const paragraphs = section.querySelectorAll('.maison-text')
      const image = section.querySelector('.maison-image')
      const caption = section.querySelector('.maison-caption')

      gsap.set(heading, { opacity: 0, y: 50 })
      gsap.set(paragraphs, { opacity: 0, y: 30 })
      gsap.set(image, { opacity: 0, x: 50 })
      gsap.set(caption, { opacity: 0, y: 20 })

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

      gsap.to(paragraphs, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(image, {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(caption, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 45%',
          toggleActions: 'play none none none',
        },
      })

      // Image parallax
      if (image) {
        gsap.to(image.querySelector('img'), {
          y: -30,
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
      id="heritage"
      className="relative bg-charcoal py-20 lg:py-32"
    >
      <div className="w-full px-6 lg:px-12 xl:px-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left Column - Text */}
          <div className="lg:w-1/2">
            <h2 className="maison-heading font-display text-4xl sm:text-5xl lg:text-6xl text-gold leading-[0.95] mb-10 uppercase font-light">
              {heritageHeading1}
              <br />
              <span className="font-bold text-white">{heritageHeading2}</span>
            </h2>

            <div className="space-y-6">
              <p className="maison-text font-body text-sm text-silver leading-relaxed font-light">
                {heritageDesc1}
              </p>

              <p className="maison-text font-body text-sm text-silver leading-relaxed font-light">
                {heritageDesc2}
              </p>

              <p className="maison-text font-body text-sm text-silver leading-relaxed font-light">
                {heritageDesc3}
              </p>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="lg:w-1/2 relative">
            <div className="maison-image relative overflow-hidden rounded-lg">
              <img
                src={heritageImage}
                alt="Master watchmaker calibrating movements"
                className="w-full h-auto object-cover max-h-[500px]"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Caption overlay */}
            <div className="maison-caption absolute bottom-6 left-6 right-6">
              <p className="font-body text-[10px] tracking-[0.3em] text-gold mb-1 uppercase font-semibold">
                {heritageCaptionLabel}
              </p>
              <p className="font-body text-xs text-white/80 font-light">
                {heritageCaptionText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
