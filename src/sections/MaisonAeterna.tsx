import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { translate } from '../utils/translate'

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
  heritageHeading1 = 'DWG',
  heritageHeading2 = 'ATELIER',
  heritageDesc1 = 'At Dubai Watches Gallery, we offer the best replica watches in Dubai. Our dedicated watchmaking atelier is specializing in the selection, calibration, and tuning of 1:1 super clone watches Dubai collectors cherish. Every super clone watch in Dubai that we hand-deliver is built using identical weight distribution and flawless Swiss sweep movements.',
  heritageDesc2 = 'As a premier source for copy watches Dubai and copy watches in Dubai, our in-house watchmakers specialize in tuning and recalibrating first copy movements. From disassembling to lubricating, each timepiece is optimized to replicate the fluid sweeps, tick rates, and robustness of original luxury brands.',
  heritageDesc3 = 'From Daytona configurations to complex NTPT carbon fiber builds, we represent the peak of super clone watches Dubai has to offer. We use high-end 904L anti-corrosive steel, sapphire glass, and heavy bracelets to ensure our clone watches Dubai collection stands out.',
  heritageImage = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171811/t24_watches_defaults/igkoymjeabkrvpmjcx3o.jpg',
  heritageCaptionLabel = 'FROM THE EYES OF THE ARTISAN',
  heritageCaptionText = 'Every custom timepiece undergoes calibration and pressure testing to ensure confident daily precision',
}: MaisonAeternaProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const currentLang = localStorage.getItem('t24_lang') || 'en'

  const heading1 = translate(heritageHeading1, currentLang)
  const heading2 = translate(heritageHeading2, currentLang)
  const desc1 = translate(heritageDesc1, currentLang)
  const desc2 = translate(heritageDesc2, currentLang)
  const desc3 = translate((heritageDesc3 || '').replace(/master\s+copy/gi, 'super clone'), currentLang)
  const captionLabel = translate(heritageCaptionLabel, currentLang)
  const captionText = translate(heritageCaptionText, currentLang)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const heading = section.querySelector('.maison-heading')
      const paragraphs = section.querySelectorAll('.maison-text')
      const image = section.querySelector('.maison-image')

      gsap.set(heading, { opacity: 0, y: 50 })
      gsap.set(paragraphs, { opacity: 0, y: 30 })
      gsap.set(image, { opacity: 0, x: 50 })

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
      id="atelier"
      className="relative overflow-hidden bg-[#050403] py-16 text-white lg:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_4%_70%,rgba(217,165,32,0.14),transparent_24%),linear-gradient(180deg,#050403_0%,#070604_100%)]" />
      <div className="w-full px-6 lg:px-12 xl:px-20">
        <div className="relative flex flex-col items-center gap-10 lg:flex-row lg:gap-14">
          <div className="lg:w-[50%]">
            <h2 className="maison-heading font-display text-[clamp(3.5rem,5.5vw,5.75rem)] uppercase leading-[0.86] text-white">
              {heading1}
              <br />
              <span className="font-bold text-gold">{heading2}</span>
            </h2>

            <div className="mt-8 max-w-2xl space-y-5">
              <p className="maison-text font-body text-sm leading-7 text-white/55 sm:text-[15px]">
                {desc1}
              </p>
              <p className="maison-text font-body text-sm leading-7 text-white/55 sm:text-[15px]">
                {desc2}
              </p>
              <p className="maison-text font-body text-sm leading-7 text-white/55 sm:text-[15px]">
                {desc3}
              </p>
            </div>
          </div>

          <div className="relative lg:w-[50%]">
            <div className="maison-image relative overflow-hidden rounded-[1.25rem] border border-gold/15 bg-black">
              <img
                src={heritageImage}
                alt={captionText}
                className="h-auto max-h-[430px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-body text-xs font-bold uppercase tracking-[0.34em] text-gold">
                  {captionLabel}
                </p>
                <p className="mt-2 font-body text-sm leading-relaxed text-white/75">
                  {captionText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
