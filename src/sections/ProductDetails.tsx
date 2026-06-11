import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface DetailSpecItem {
  label: string;
  value: string;
}

interface DetailCategory {
  category: string;
  items: DetailSpecItem[];
}

interface ProductDetailsProps {
  detailBrand?: string
  detailModel?: string
  detailImage?: string
  detailDesc1?: string
  detailDesc2?: string
  detailSpecs?: DetailCategory[]
}

const defaultSpecs: DetailCategory[] = [
  {
    category: 'Movement',
    items: [
      { label: 'Caliber', value: 'Calibre 240 LU CL C' },
      { label: 'Type', value: 'Automatic (Micro-Rotor)' },
      { label: 'Frequency', value: '21,600 vph' },
      { label: 'Jewels', value: '45' },
    ],
  },
  {
    category: 'Case',
    items: [
      { label: 'Material', value: '904L White Gold Plating' },
      { label: 'Diameter', value: '44mm' },
      { label: 'Thickness', value: '10.58mm' },
      { label: 'Crystal', value: 'Double AR Sapphire' },
    ],
  },
  {
    category: 'Strap',
    items: [
      { label: 'Material', value: 'Blue Alligator Leather' },
      { label: 'Color', value: 'Celestial Navy Blue' },
      { label: 'Buckle', value: 'Fold-over Clasp' },
      { label: 'Width', value: '22mm' },
    ],
  },
]

export default function ProductDetails({
  detailBrand = 'PATEK PHILIPPE',
  detailModel = 'CELESTIAL',
  detailImage = 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F04%2FIMG_3594-300x300.webp',
  detailDesc1 = 'The Patek Philippe Celestial represents the absolute zenith of grand complication horology. Its deep-sky chart dial captures the mesmerizing, slow progression of the stars and the moon in the Northern Hemisphere, bringing cosmic mechanics to your wrist.',
  detailDesc2 = 'This 3K Factory Swiss clone execution features a multi-layered dial disk, sapphire dial apertures, and the micro-rotor Calibre 240 LU CL C movement. Fine-tuned and pressure tested by our workshop for seamless mechanical sweeps and identical weight parameters.',
  detailSpecs = defaultSpecs
}: ProductDetailsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyImageRef = useRef<HTMLDivElement>(null)
  const specsList = detailSpecs && detailSpecs.length > 0 ? detailSpecs : defaultSpecs

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const heading = section.querySelector('.product-heading')
      const specCards = section.querySelectorAll('.spec-card')
      const description = section.querySelector('.product-description')

      gsap.set(heading, { opacity: 0, y: 50 })
      gsap.set(specCards, { opacity: 0, y: 30 })
      gsap.set(description, { opacity: 0, y: 30 })

      // Heading animation
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

      // Spec cards
      gsap.to(specCards, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: section,
          start: 'top 55%',
          toggleActions: 'play none none none',
        },
      })

      // Description
      gsap.to(description, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: description,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })

      // Sticky image parallax
      if (stickyImageRef.current) {
        gsap.to(stickyImageRef.current.querySelector('img'), {
          scale: 1.1,
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
  }, [specsList])

  return (
    <section
      ref={sectionRef}
      id="matte-black"
      className="relative bg-dark py-20 lg:py-32"
    >
      <div className="w-full px-6 lg:px-12 xl:px-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left Column - Sticky Image */}
          <div className="lg:w-[45%]">
            <div
              ref={stickyImageRef}
              className="lg:sticky lg:top-24 overflow-hidden rounded-lg bg-black/30 p-4"
            >
              <img
                src={detailImage}
                alt={`${detailBrand} ${detailModel} Swiss Clone`}
                className="w-full h-auto object-cover max-h-[500px] transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* Right Column - Scrolling Content */}
          <div className="lg:w-[55%] lg:py-12">
            <h2 className="product-heading font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-gold mb-12 uppercase leading-none font-light">
              {detailBrand}
              <br />
              <span className="font-bold text-white">{detailModel}</span>
            </h2>

            {/* Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              {specsList.map((spec) => (
                <div
                  key={spec.category}
                  className="spec-card glass-card rounded-lg p-5"
                >
                  <h3 className="font-body text-xs tracking-[0.2em] text-gold mb-4 uppercase font-semibold">
                    {spec.category}
                  </h3>
                  <div className="space-y-3">
                    {spec.items && spec.items.map((item) => (
                      <div key={item.label}>
                        <p className="font-body text-[10px] tracking-[0.1em] text-silver font-mono">
                          {item.label.toUpperCase()}
                        </p>
                        <p className="font-body text-sm text-white font-medium">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="product-description">
              <p className="font-body text-sm text-silver leading-relaxed mb-6 font-light">
                {detailDesc1}
              </p>
              <p className="font-body text-sm text-silver leading-relaxed font-light">
                {detailDesc2}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
