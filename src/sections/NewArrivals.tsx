import { useRef } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { WatchImage } from '../components/WatchImage'
import { translate } from '../utils/translate'

interface NewArrivalItem {
  id: number
  name: string
  type: string
  image: string
  label: string
  priceUSD?: string
  priceAED?: string
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
    id: 123,
    name: 'Rolex Cosmograph Daytona 40mm – PANDA',
    type: '1:1 Swiss Super Clone Edition',
    image: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1784372639/t24_watches_clean/vmdeatpytq76vufbbmhh.png',
    label: 'BEST SELLER',
  },
  {
    id: 119,
    name: 'Richard Mille RM 055 Bubba Watson Asia Carbon NTPT',
    type: '1:1 Swiss Super Clone Edition',
    image: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1784372624/t24_watches_clean/ffoturqlsqn7c3aiwgif.png',
    label: 'NEW ARRIVAL',
  },
  {
    id: 114,
    name: 'Rolex Datejust 126281RBR Two-Tone Oyster Grey Dial 36mm 2023',
    type: '1:1 Super Clone Edition',
    image: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1784372603/t24_watches_clean/jctyki5eoi9smo4s67ri.png',
    label: 'EXQUISITE',
  },
  {
    id: 103,
    name: 'Richard Mille RM 67-01 Rose Gold Skeleton Dial Extra Flat',
    type: '1:1 Flyback Chrono Super Clone',
    image: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1784372551/t24_watches_clean/ze5js60llxs3rgiukog3.png',
    label: 'CRAFTSMANSHIP',
  },
]

const defaultCraftsmanship: CraftsmanshipImageItem[] = [
  { 
    id: 138, 
    image: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1784372700/t24_watches_clean/fnrdjyeusvk64pfj2doh.png', 
    alt: 'Audemars Piguet Royal Oak Double Balance Wheel Skeleton' 
  },
  { 
    id: 102, 
    image: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1784372545/t24_watches_clean/h8fxgwcqbbzof42ixa6y.png', 
    alt: 'Richard Mille RM 67-02 Mutaz Essa Barshim Qatar' 
  },
  { 
    id: 119, 
    image: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1784372624/t24_watches_clean/ffoturqlsqn7c3aiwgif.png', 
    alt: 'Richard Mille RM 055 Bubba Watson' 
  },
  { 
    id: 114, 
    image: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1784372603/t24_watches_clean/jctyki5eoi9smo4s67ri.png', 
    alt: 'Rolex Datejust 126281RBR Two-Tone' 
  },
]

export default function NewArrivals({
  newArrivalsTitle = 'NEW ARRIVALS',
  craftsmanshipTitle = 'CRAFTSMANSHIP',
  newArrivals: apiNewArrivals = [],
  craftsmanshipImages: apiCraftsmanship = [],
}: NewArrivalsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentLang = localStorage.getItem('t24_lang') || 'en'

  // Merge API and fallbacks so there are always up to 24 items (12 arrivals, 12 craftsmanship)
  const mergedArrivals = [...apiNewArrivals, ...defaultArrivals.filter(d => !apiNewArrivals.some(a => a.id === d.id))].slice(0, 12)
  const mergedCraftsmanship = [...apiCraftsmanship, ...defaultCraftsmanship.filter(d => !apiCraftsmanship.some(c => c.id === d.id))].slice(0, 12)

  // Construct standard items list for carousel slider
  const slides = [
    ...mergedArrivals.map(item => ({
      id: item.id,
      brand: item.label || 'Rolex',
      reference: item.name,
      priceUSD: item.priceUSD || (item.name.includes('Pikachu') ? '$1,250' : item.name.includes('Patek') ? '$1,850' : item.name.includes('Mille') ? '$2,450' : '$1,450'),
      priceAED: item.priceAED || (item.name.includes('Pikachu') ? 'AED 4,590' : item.name.includes('Patek') ? 'AED 6,795' : item.name.includes('Mille') ? 'AED 8,995' : 'AED 5,325'),
      image: item.image,
    })),
    ...mergedCraftsmanship.map(item => ({
      id: item.id,
      brand: item.alt ? (item.alt.includes('Mille') ? 'Richard Mille' : item.alt.includes('Audemars') ? 'Audemars Piguet' : 'Rolex') : 'Rolex',
      reference: item.alt || 'Luxury Watch',
      priceUSD: item.alt && item.alt.includes('Mille') ? '$2,450' : '$1,650',
      priceAED: item.alt && item.alt.includes('Mille') ? 'AED 8,995' : 'AED 6,060',
      image: item.image,
    }))
  ]

  const scrollNext = () => {
    const container = containerRef.current
    if (!container) return
    container.scrollBy({ left: 300, behavior: 'smooth' })
  }

  const scrollPrev = () => {
    const container = containerRef.current
    if (!container) return
    container.scrollBy({ left: -300, behavior: 'smooth' })
  }

  return (
    <section id="collections" className="bg-black py-20 lg:py-28 px-6 lg:px-16 w-full text-white relative overflow-hidden">
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
              alt="Luxury watch movement"
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10" />
          </div>

          <div className="relative z-20 space-y-4">
            <span className="font-mono text-[9px] tracking-[0.35em] text-[#e8c264] bg-[#e8c264]/10 border border-[#e8c264]/20 px-2.5 py-1 rounded-full uppercase">
              {translate('Spotlight', currentLang)}
            </span>
            <h3 className="font-display text-2xl xl:text-3xl font-light tracking-tight text-white leading-tight mt-2">
              {translate(newArrivalsTitle, currentLang)}
              <br />
              <span className="text-[#e8c264] font-bold font-display">{currentLang === 'ar' ? 'و ' : '& '}{translate(craftsmanshipTitle, currentLang)}</span>
            </h3>
          </div>

          <div className="relative z-20 pt-8 border-t border-white/5 mt-auto">
            <p className="font-body text-xs text-silver tracking-widest leading-relaxed">
              {translate("Explore our latest curated timepieces, featuring ultra-precise movements, custom engineering, and original weight specifications.", currentLang)}
            </p>
          </div>
        </div>

        {/* Right Slider Section */}
        <div className="lg:col-span-9 flex flex-col justify-center relative">
          
          {/* Navigation Controls Row */}
          <div className="flex items-center justify-between mb-6 z-20 px-1">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#e8c264]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#e8c264]">
                {translate("Click arrows to slide", currentLang)}
              </p>
            </div>
            
            {/* Arrows */}
            <div className="flex gap-2" dir="ltr">
              <button 
                onClick={scrollPrev}
                className="w-10 h-10 rounded-full border border-white/10 bg-black/80 hover:bg-[#e8c264] hover:text-black hover:border-[#e8c264] flex items-center justify-center transition-all duration-300 z-10 group"
                aria-label="Previous Products"
              >
                <ChevronLeft className="w-5 h-5 text-white group-hover:text-black" />
              </button>
              <button 
                onClick={scrollNext}
                className="w-10 h-10 rounded-full border border-[#e8c264]/10 bg-black/80 hover:bg-[#e8c264] hover:text-black hover:border-[#e8c264] flex items-center justify-center transition-all duration-300 z-10 group"
                aria-label="Next Products"
              >
                <ChevronRight className="w-5 h-5 text-white group-hover:text-black" />
              </button>
            </div>
          </div>

          {/* Carousel Viewport Container */}
          <div className="w-full overflow-hidden px-1 py-4">
            <div 
              ref={containerRef}
              className="flex flex-row flex-nowrap gap-5 overflow-x-auto scrollbar-none"
            >
              {slides.map((item, idx) => (
                <div 
                  key={idx}
                  className="shrink-0 w-[280px] rounded-2xl bg-[#0d0d0f] border border-white/5 backdrop-blur-md p-6 flex flex-col justify-between group hover:border-[#e8c264]/20 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                >
                  {/* Link wrapper around entire card */}
                  <Link to={`/product/${item.id}`} className="flex flex-col h-full justify-between">
                    
                    {/* Watch Image */}
                    <div className="relative w-full aspect-[4/5] bg-[#0a0a0c] rounded-xl flex items-center justify-center p-4 mb-5 overflow-hidden">
                      <div className="absolute w-[180px] h-[180px] rounded-full bg-[#e8c264]/[0.015] blur-xl pointer-events-none group-hover:bg-[#e8c264]/[0.03] transition-colors duration-500" />
                      <WatchImage
                        src={item.image}
                        alt={item.reference}
                        className="max-h-[190px] object-contain group-hover:scale-105 transition-transform duration-700"
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
                      <div className="mt-3 text-xs font-mono text-silver/80 tracking-wider flex items-center justify-center gap-1.5" dir="ltr">
                        <span className="text-[#e8c264] font-bold">{item.priceAED}</span>
                        <span className="text-white/40 text-[10px] font-normal">({item.priceUSD})</span>
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
