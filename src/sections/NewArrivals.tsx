import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface NewArrivalItem {
  id: number
  name: string
  type: string
  image: string
  label: string
}

interface CraftsmanshipImageItem {
  id: number
  image: string
  alt: string
}

interface NewArrivalsProps {
  newArrivalsTitle?: string
  craftsmanshipTitle?: string
  newArrivals?: NewArrivalItem[]
  craftsmanshipImages?: CraftsmanshipImageItem[]
}

const defaultArrivals: NewArrivalItem[] = [
  {
    id: 133,
    name: 'Daytona Pikachu 126518LN Gold',
    type: 'Clean Factory 1:1 Swiss Clone',
    image: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F02%2FIMG_0913-300x300.webp',
    label: 'BEST SELLER',
  },
  {
    id: 121,
    name: 'Patek Philippe Celestial Blue',
    type: '3K Factory 1:1 Swiss Clone',
    image: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F04%2FIMG_3594-300x300.webp',
    label: 'NEW ARRIVAL',
  },
]

const defaultCraftsmanship: CraftsmanshipImageItem[] = [
  { 
    id: 108, 
    image: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F03%2FIMG_2868-300x300.webp', 
    alt: 'Richard Mille Mother Of Pearl Rose Gold' 
  },
  { 
    id: 120, 
    image: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2025%2F11%2FIMG_4627-300x300.webp', 
    alt: 'Audemars Piguet Frosted Double Balance Wheel' 
  },
]

export default function NewArrivals({
  newArrivalsTitle = 'NEW ARRIVALS',
  craftsmanshipTitle = 'CRAFTSMANSHIP',
  newArrivals = defaultArrivals,
  craftsmanshipImages = defaultCraftsmanship,
}: NewArrivalsProps) {
  const sectionRef = useRef<HTMLElement>(null)

  const arrivalsList = newArrivals && newArrivals.length > 0 ? newArrivals : defaultArrivals
  const craftList = craftsmanshipImages && craftsmanshipImages.length > 0 ? craftsmanshipImages : defaultCraftsmanship

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const titles = section.querySelectorAll('.section-title')
      const cards = section.querySelectorAll('.watch-card')

      gsap.set(titles, { opacity: 0, x: -30 })
      gsap.set(cards, { opacity: 0, y: 40 })

      gsap.to(titles, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.2,
        scrollTrigger: {
          trigger: section,
          start: 'top 65%',
          toggleActions: 'play none none none',
        },
      })
    }, section)

    return () => ctx.revert()
  }, [arrivalsList, craftList])

  return (
    <section
      ref={sectionRef}
      id="collections"
      className="relative bg-dark py-20 lg:py-32"
    >
      <div className="w-full px-6 lg:px-12 xl:px-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Titles */}
          <div className="lg:w-[200px] flex-shrink-0">
            <div className="lg:sticky lg:top-32 space-y-12">
              <div>
                <h2 className="section-title font-body text-lg tracking-[0.15em] text-white uppercase">
                  {newArrivalsTitle}
                </h2>
              </div>

              <div>
                <h2 className="section-title font-body text-lg tracking-[0.15em] text-white uppercase">
                  {craftsmanshipTitle}
                </h2>
              </div>
            </div>
          </div>

          {/* Right Column - Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {arrivalsList.map((item, idx) => (
                <Link 
                  key={idx}
                  to={`/product/${item.id}`} 
                  className="watch-card relative group cursor-pointer overflow-hidden rounded-lg bg-charcoal block"
                >
                  <div className="aspect-square overflow-hidden bg-black/20 p-4 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-[90%] max-w-[90%] object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <p className="font-body text-[10px] tracking-[0.2em] text-gold mb-1 uppercase font-semibold">
                      {item.label}
                    </p>
                    <p className="font-body text-sm text-white font-medium truncate">
                      {item.name}
                    </p>
                    <p className="font-body text-xs text-silver">
                      {item.type}
                    </p>
                  </div>
                </Link>
              ))}

              {craftList.map((item, idx) => (
                <Link 
                  key={idx}
                  to={`/product/${item.id}`} 
                  className="watch-card relative group cursor-pointer overflow-hidden rounded-lg bg-charcoal block"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-black/20 p-6 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="max-h-[90%] max-w-[90%] object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="font-body text-[10px] tracking-[0.2em] text-gold mb-1 uppercase font-semibold">
                      CRAFTSMANSHIP
                    </p>
                    <p className="font-body text-xs text-white truncate">
                      {item.alt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
