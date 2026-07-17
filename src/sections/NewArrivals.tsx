import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'

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
    id: 138,
    name: 'Daytona Pikachu 126518LN Gold',
    type: '1:1 Swiss Master Copy Edition',
    image: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F02%2FIMG_0913-300x300.webp',
    label: 'BEST SELLER',
  },
  {
    id: 119,
    name: 'Patek Philippe Celestial Blue',
    type: '1:1 Swiss Master Copy Edition',
    image: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F04%2FIMG_3594-300x300.webp',
    label: 'NEW ARRIVAL',
  },
  {
    id: 543,
    name: 'Audemars Piguet Royal Oak 41 MM',
    type: '1:1 Master Copy Edition',
    image: 'https://images.weserv.nl/?url=https%3A%2F%2Fdubaiwatchstores.com%2Fwp-content%2Fuploads%2F2018%2F10%2F1-19.jpg',
    label: 'EXQUISITE',
  },
  {
    id: 537,
    name: 'Richard Mille RM11-03 Rose Gold',
    type: '1:1 Flyback Chrono Master Copy',
    image: 'https://images.weserv.nl/?url=https%3A%2F%2Fdubaiwatchstores.com%2Fwp-content%2Fuploads%2F2018%2F11%2FIMG_0179-copy.jpg',
    label: 'CRAFTSMANSHIP',
  },
]

const defaultCraftsmanship: CraftsmanshipImageItem[] = [
  { 
    id: 125, 
    image: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F03%2FIMG_2868-300x300.webp', 
    alt: 'Richard Mille Mother Of Pearl Rose Gold' 
  },
  { 
    id: 156, 
    image: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2025%2F11%2FIMG_4627-300x300.webp', 
    alt: 'Audemars Piguet Frosted Double Balance Wheel' 
  },
  { 
    id: 541, 
    image: 'https://images.weserv.nl/?url=https%3A%2F%2Fdubaiwatchstores.com%2Fwp-content%2Fuploads%2F2018%2F10%2F1-21.jpg', 
    alt: 'Audemars Piguet Royal Oak 33 MM' 
  },
  { 
    id: 540, 
    image: 'https://images.weserv.nl/?url=https%3A%2F%2Fdubaiwatchstores.com%2Fwp-content%2Fuploads%2F2018%2F10%2F1-22.jpg', 
    alt: 'Audemars Piguet Royal Oak Diamond White' 
  },
]

export default function NewArrivals({
  newArrivalsTitle = 'NEW ARRIVALS',
  craftsmanshipTitle = 'CRAFTSMANSHIP',
  newArrivals: apiNewArrivals = [],
  craftsmanshipImages: apiCraftsmanship = [],
}: NewArrivalsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleSlides, setVisibleSlides] = useState(3)
  const [isHovered, setIsHovered] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  // Merge API and fallbacks so there are always 8 items (4 arrivals, 4 craftsmanship)
  const mergedArrivals = [...apiNewArrivals, ...defaultArrivals.filter(d => !apiNewArrivals.some(a => a.id === d.id))].slice(0, 4)
  const mergedCraftsmanship = [...apiCraftsmanship, ...defaultCraftsmanship.filter(d => !apiCraftsmanship.some(c => c.id === d.id))].slice(0, 4)

  // Construct standard items list for carousel slider
  const slides = [
    ...mergedArrivals.map(item => ({
      id: item.id,
      brand: item.label || 'Rolex',
      reference: item.name,
      price: item.name.includes('Pikachu') ? '$1,250' : item.name.includes('Patek') ? '$1,850' : item.name.includes('Mille') ? '$2,450' : '$1,450',
      image: item.image,
    })),
    ...mergedCraftsmanship.map(item => ({
      id: item.id,
      brand: item.alt ? (item.alt.includes('Mille') ? 'Richard Mille' : item.alt.includes('Audemars') ? 'Audemars Piguet' : 'Rolex') : 'Rolex',
      reference: item.alt || 'Luxury Watch',
      price: item.alt && item.alt.includes('Mille') ? '$2,450' : '$1,650',
      image: item.image,
    }))
  ]

  // Update visible slides count dynamically
  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 640) {
        setVisibleSlides(1)
      } else if (window.innerWidth < 1024) {
        setVisibleSlides(2)
      } else {
        setVisibleSlides(3)
      }
    }
    updateVisible()
    window.addEventListener('resize', updateVisible)
    return () => window.removeEventListener('resize', updateVisible)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = slides.length - visibleSlides
      return prev < maxIndex ? prev + 1 : 0
    })
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = slides.length - visibleSlides
      return prev > 0 ? prev - 1 : maxIndex
    })
  }

  // Autoplay functionality (moves side-to-side automatically, pauses on hover)
  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      nextSlide()
    }, 3000)
    return () => clearInterval(timer)
  }, [isHovered, visibleSlides, slides.length])

  return (
    <section className="bg-black py-20 lg:py-28 px-6 lg:px-16 w-full text-white relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute right-[-10rem] top-1/4 h-[30rem] w-[30rem] rounded-full bg-[#e8c264]/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute left-[-10rem] bottom-1/4 h-[30rem] w-[30rem] rounded-full bg-silver/[0.01] blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Spotlight Banner Card */}
        <div className="lg:col-span-3 rounded-3xl relative overflow-hidden min-h-[400px] lg:min-h-auto bg-[#0a0a0a] border border-[#e8c264]/10 p-6 sm:p-8 lg:p-5 xl:p-8 flex flex-col justify-between shadow-[0_15px_40px_rgba(0,0,0,0.5)] group">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&q=80&w=600" 
              alt="Premium Collection Spotlight" 
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
          </div>

          {/* Gold ambient overlay */}
          <div className="absolute inset-0 bg-[#e8c264]/[0.02] blur-2xl pointer-events-none" />

          {/* Top text block */}
          <div className="relative z-10">
            <span className="text-[10px] tracking-[0.3em] text-[#e8c264] uppercase font-bold block mb-3">
              LUXURY & PREMIUM BRANDS
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[20px] xl:text-[26px] 2xl:text-[32px] text-white font-light leading-tight uppercase tracking-tight">
              {newArrivalsTitle} <br />
              & <span className="font-bold text-[#e8c264] whitespace-nowrap">{craftsmanshipTitle}</span>
            </h2>
          </div>

          {/* Bottom text/location block */}
          <div className="relative z-10 pt-16">
            <div className="flex items-center gap-2 text-xs font-mono text-[#e8c264]/80">
              <MapPin className="w-4 h-4 text-[#e8c264]" />
              <span className="tracking-wider uppercase">Experience Excellence</span>
            </div>
            <p className="text-[11px] text-silver/60 mt-1 font-body">Master copy timepieces</p>
          </div>
        </div>

        {/* Right Product Carousel Slider */}
        <div 
          className="lg:col-span-9 flex flex-col justify-center relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          
          {/* Navigation Arrows */}
          <div className="absolute -top-14 right-4 flex gap-3 z-20 lg:static lg:-top-0 lg:right-0">
            <button 
              onClick={prevSlide}
              className="lg:absolute lg:-left-6 lg:top-1/2 lg:-translate-y-1/2 w-11 h-11 rounded-full border border-white/10 bg-black/80 hover:bg-[#e8c264] hover:text-black hover:border-[#e8c264] flex items-center justify-center transition-all duration-300 z-30 group shadow-md"
              aria-label="Previous Products"
            >
              <ChevronLeft className="w-5 h-5 text-white group-hover:text-black" />
            </button>
            
            <button 
              onClick={nextSlide}
              className="lg:absolute lg:-right-6 lg:top-1/2 lg:-translate-y-1/2 w-11 h-11 rounded-full border border-white/10 bg-black/80 hover:bg-[#e8c264] hover:text-black hover:border-[#e8c264] flex items-center justify-center transition-all duration-300 z-30 group shadow-md"
              aria-label="Next Products"
            >
              <ChevronRight className="w-5 h-5 text-white group-hover:text-black" />
            </button>
          </div>

          {/* Carousel Viewport Container */}
          <div className="w-full overflow-hidden px-1 py-4">
            <div 
              ref={trackRef}
              className="flex flex-row flex-nowrap gap-5 transition-transform duration-500 ease-out"
              style={{
                transform: `translate3d(-${currentIndex * (100 / visibleSlides)}%, 0, 0)`,
              }}
            >
              {slides.map((item, idx) => (
                <div 
                  key={idx}
                  className="shrink-0 rounded-2xl bg-[#0d0d0f] border border-white/5 backdrop-blur-md p-6 flex flex-col justify-between group hover:border-[#e8c264]/20 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                  style={{
                    width: `calc(${100 / visibleSlides}% - ${(visibleSlides - 1) * 20 / visibleSlides}px)`
                  }}
                >
                  {/* Link wrapper around entire card */}
                  <Link to={`/product/${item.id}`} className="flex flex-col h-full justify-between">
                    
                    {/* Watch Image */}
                    <div className="relative w-full aspect-[4/5] bg-[#0a0a0c] rounded-xl flex items-center justify-center p-4 mb-5 overflow-hidden">
                      <div className="absolute w-[180px] h-[180px] rounded-full bg-[#e8c264]/[0.015] blur-xl pointer-events-none group-hover:bg-[#e8c264]/[0.03] transition-colors duration-500" />
                      <img 
                        src={item.image} 
                        alt={item.reference} 
                        className="max-h-[190px] object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-700" 
                        loading="lazy"
                      />
                    </div>

                    {/* Content Section */}
                    <div className="text-center pt-2">
                      <p className="text-[10px] tracking-[0.25em] text-[#e8c264] uppercase font-bold mb-1">
                        {item.brand}
                      </p>
                      <h3 className="font-display text-sm text-white font-medium tracking-wide uppercase line-clamp-1 group-hover:text-[#e8c264] transition-colors duration-300">
                        {item.reference}
                      </h3>
                      <div className="mt-3 text-xs font-mono text-silver/80 tracking-wider">
                        {item.price}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
