import { useRef } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { WatchImage } from '../components/WatchImage'
import { translate } from '../utils/translate'

interface NewArrivalItem {
  id: number
  name: string
  brand?: string
  type?: string
  image: string
  label?: string
  priceUSD?: string
  priceAED?: string
}

interface CraftsmanshipImageItem {
  id: number
  image: string
  alt: string
}

interface NewArrivalsProps {
  eyebrow?: string
  newArrivalsTitle?: string
  craftsmanshipTitle?: string
  description?: string
  newArrivals?: NewArrivalItem[]
  craftsmanshipImages?: CraftsmanshipImageItem[]
}

export default function NewArrivals({
  eyebrow = 'Spotlight',
  newArrivalsTitle = 'NEW ARRIVALS',
  craftsmanshipTitle = 'CRAFTSMANSHIP',
  description = 'Explore our latest curated timepieces, featuring ultra-precise movements, custom engineering, and original weight specifications.',
  newArrivals = [],
}: NewArrivalsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentLang = localStorage.getItem('t24_lang') || 'en'

  // Construct standard items list for carousel slider directly from dynamic backend data
  const slides = (newArrivals || []).map((item) => ({
    id: item.id,
    brand: item.label || item.brand || 'NEW ARRIVAL',
    reference: item.name,
    priceUSD: item.priceUSD || '',
    priceAED: item.priceAED || '',
    image: item.image,
  }))

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
    <section id="collections" className="bg-black py-8 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-16 w-full text-white relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute right-[-10rem] top-1/4 h-[30rem] w-[30rem] rounded-full bg-[#e8c264]/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute left-[-10rem] bottom-1/4 h-[30rem] w-[30rem] rounded-full bg-silver/[0.01] blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Spotlight Banner Card */}
        <div className="hidden lg:flex lg:col-span-3 rounded-3xl relative overflow-hidden min-h-[400px] lg:min-h-auto bg-[#0a0a0a] border border-[#e8c264]/10 p-6 sm:p-8 lg:p-5 xl:p-8 flex-col justify-between shadow-[0_15px_40px_rgba(0,0,0,0.5)] group">
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
              {translate(eyebrow, currentLang)}
            </span>
            <h3 className="font-display text-2xl xl:text-3xl font-light tracking-tight text-white leading-tight mt-2">
              {translate(newArrivalsTitle, currentLang)}
              <br />
              <span className="text-[#e8c264] font-bold font-display">{currentLang === 'ar' ? 'و ' : '& '}{translate(craftsmanshipTitle, currentLang)}</span>
            </h3>
          </div>

          <div className="relative z-20 pt-8 border-t border-white/5 mt-auto">
            <p className="font-body text-xs text-silver tracking-widest leading-relaxed">
              {translate(description, currentLang)}
            </p>
          </div>
        </div>

        {/* Right Slider Section */}
        <div className="lg:col-span-9 flex flex-col justify-center relative">
          
          {/* Navigation Controls Row */}
          <div className="flex items-center justify-between mb-3 sm:mb-6 z-20 px-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="h-[1px] w-5 sm:w-8 bg-[#e8c264]" />
              <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#e8c264]">
                {translate("Click arrows to slide", currentLang)}
              </p>
            </div>
            
            {/* Arrows */}
            <div className="flex gap-1.5 sm:gap-2" dir="ltr">
              <button 
                onClick={scrollPrev}
                className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-white/10 bg-black/80 hover:bg-[#e8c264] hover:text-black hover:border-[#e8c264] flex items-center justify-center transition-all duration-300 z-10 group"
                aria-label="Previous Products"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white group-hover:text-black" />
              </button>
              <button 
                onClick={scrollNext}
                className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-[#e8c264]/10 bg-black/80 hover:bg-[#e8c264] hover:text-black hover:border-[#e8c264] flex items-center justify-center transition-all duration-300 z-10 group"
                aria-label="Next Products"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white group-hover:text-black" />
              </button>
            </div>
          </div>

          {/* Carousel Viewport Container */}
          <div className="w-full overflow-hidden px-1 py-1 sm:py-4">
            <div 
              ref={containerRef}
              className="flex flex-row flex-nowrap gap-2.5 sm:gap-5 overflow-x-auto scrollbar-none"
            >
              {slides.map((item, idx) => (
                <div 
                  key={idx}
                  className="shrink-0 w-[155px] sm:w-[280px] rounded-xl sm:rounded-2xl bg-[#0d0d0f] border border-white/5 backdrop-blur-md p-2.5 sm:p-6 flex flex-col justify-between group hover:border-[#e8c264]/20 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                >
                  {/* Link wrapper around entire card */}
                  <Link to={`/product/${item.id}`} className="flex flex-col h-full justify-between">
                    
                    {/* Watch Image */}
                    <div className="relative w-full aspect-[4/5] bg-[#0a0a0c] rounded-lg sm:rounded-xl flex items-center justify-center p-2 sm:p-4 mb-2 sm:mb-5 overflow-hidden">
                      <div className="absolute w-[120px] sm:w-[180px] h-[120px] sm:h-[180px] rounded-full bg-[#e8c264]/[0.015] blur-xl pointer-events-none group-hover:bg-[#e8c264]/[0.03] transition-colors duration-500" />
                      <WatchImage
                        src={item.image}
                        alt={item.reference}
                        className="max-h-[115px] sm:max-h-[190px] object-contain group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>

                    {/* Content Section */}
                    <div className="text-center pt-1 sm:pt-2">
                      <p className="text-[7px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.25em] text-[#e8c264] uppercase font-bold mb-0.5 sm:mb-1 truncate">
                        {item.brand}
                      </p>
                      <h3 className="font-display text-[11px] sm:text-sm text-white font-medium tracking-wide uppercase line-clamp-1 group-hover:text-[#e8c264] transition-colors duration-300">
                        {item.reference}
                      </h3>
                      <div className="mt-1.5 sm:mt-3 text-[10px] sm:text-xs font-mono text-silver/80 tracking-wider flex items-center justify-center gap-1 sm:gap-1.5" dir="ltr">
                        <span className="text-[#e8c264] font-bold text-[11px] sm:text-xs">{item.priceAED}</span>
                        <span className="text-white/40 text-[8px] sm:text-[10px] font-normal">({item.priceUSD})</span>
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
