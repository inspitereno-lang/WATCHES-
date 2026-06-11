import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Search, Compass, Loader2 } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface Watch {
  id: number
  name: string
  brand: string
  factory: string
  image: string
  priceAED: string
  priceUSD: string
  movement: string
  bezel: string
  glass: string
  waterResistance: string
  description: string
  features: string[]
}

const BRANDS = ['ALL BRANDS', 'Rolex', 'Audemars Piguet', 'Patek Philippe', 'Richard Mille', 'Hublot', 'Vacheron Constantin', 'Cartier']

export default function SignatureCollection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL BRANDS')
  
  // Dynamic backend pagination states
  const [watches, setWatches] = useState<Watch[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch watches from MongoDB Atlas via MERN API
  const fetchWatches = async (brand: string, search: string, pageNum: number, append = false) => {
    setLoading(true)
    try {
      const brandQuery = brand === 'ALL BRANDS' ? '' : encodeURIComponent(brand)
      const searchQuery = encodeURIComponent(search)
      const res = await fetch(`/api/products?brand=${brandQuery}&search=${searchQuery}&page=${pageNum}&limit=6`)
      if (!res.ok) throw new Error('API request failed')
      const data = await res.json()
      
      if (data && data.products) {
        if (append) {
          setWatches((prev) => [...prev, ...data.products])
        } else {
          setWatches(data.products)
        }
        setTotalPages(data.pagination.totalPages)
        setTotalCount(data.pagination.totalItems)
      }
    } catch (err) {
      console.error('Failed to fetch watches from API:', err)
    }
    setLoading(false)
  }

  // Handle Search Input & Brand Pill Debounced Fetching
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1)
      fetchWatches(selectedBrand, searchTerm, 1, false)
    }, 350) // 350ms debounce to limit DB query overload

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, selectedBrand])

  // Load next page
  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchWatches(selectedBrand, searchTerm, nextPage, true)
  }

  // GSAP scroll reveals
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const label = section.querySelector('.sig-label')
      const heading = section.querySelector('.sig-heading')
      const sub = section.querySelector('.sig-sub')

      gsap.set([label, heading, sub], { opacity: 0, y: 35 })

      gsap.to([label, heading, sub], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="store"
      className="relative bg-dark border-t border-b border-white/5 py-20 lg:py-32 overflow-hidden"
    >
      {/* Subtle luxury dark radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="store-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#store-grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20">
        
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="sig-label font-body text-xs tracking-[0.3em] text-gold mb-4 uppercase">
            1:1 SWISS REPLICA DIRECTORY
          </p>
          <h2 className="sig-heading font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] font-light">
            THE SWISS CLONE
            <br />
            <span className="text-gold font-bold">CATALOGUE</span>
          </h2>
          <p className="sig-sub font-body text-xs text-silver mt-6 tracking-widest max-w-lg mx-auto leading-relaxed">
            Exactly duplicate weight, premium sweeping frequencies, and factory calibrations. Sourced from VSF, Clean, ZF & 3KF.
          </p>
        </div>

        {/* Brand Filter Pills & Search Input Grid */}
        <div className="mb-12 max-w-6xl mx-auto space-y-6">
          
          {/* Search bar */}
          <div className="relative w-full max-w-md mx-auto">
            {loading ? (
              <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gold w-4 h-4 animate-spin" />
            ) : (
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            )}
            <input 
              type="text"
              placeholder="Search by model or factory (e.g. VSF)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full text-sm bg-white/[0.02] border border-white/10 hover:border-gold/30 focus:border-gold focus:outline-none transition-all duration-300 font-light text-white font-mono"
            />
          </div>

          {/* Brand Pills Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {BRANDS.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ${
                  selectedBrand === brand 
                    ? 'bg-gold text-black font-semibold' 
                    : 'bg-white/[0.02] border border-white/5 text-gray-400 hover:text-white hover:border-gold/20'
                }`}
              >
                {brand.toUpperCase()}
              </button>
            ))}
          </div>

        </div>

        {/* Watch Cards Grid */}
        {watches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {watches.map((watch) => (
              <Link
                key={watch.id}
                to={`/product/${watch.id}`}
                className="collection-card group cursor-pointer watch-card block"
              >
                <div className="relative bg-[#0d0d0f]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:border-gold/30 shadow-2xl flex flex-col justify-between h-full">
                  
                  {/* Watch Image Aspect Box */}
                  <div className="aspect-square overflow-hidden bg-gradient-to-b from-[#161619] to-[#09090b] relative flex items-center justify-center p-6 xl:p-10">
                    <img
                      src={watch.image}
                      alt={watch.name}
                      loading="lazy"
                      className="max-h-[95%] max-w-[95%] object-contain transition-transform duration-700 group-hover:scale-105 select-none"
                    />
                    
                    {/* Factory Tag Badge */}
                    <span className="absolute top-4 left-4 bg-black/85 backdrop-blur-md border border-gold/30 text-gold font-body text-[9px] font-bold tracking-[0.1em] px-2.5 py-1 rounded-full uppercase shadow-md font-mono">
                      {watch.factory}
                    </span>

                    {/* Stock indicator badge */}
                    <span className="absolute bottom-4 right-4 text-[8px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                      IN STOCK
                    </span>
                  </div>
                  
                  {/* Info Section */}
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      <p className="font-body text-[9px] tracking-[0.2em] text-gold mb-1.5 uppercase font-semibold font-mono">
                        1:1 SWISS REPLICA
                      </p>
                      <h3 className="font-body text-base font-light tracking-wide text-white group-hover:text-gold transition-colors duration-300 line-clamp-2">
                        {watch.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                      <div>
                        <p className="font-body text-[9px] tracking-wider text-silver/40 uppercase font-mono">Exclusive Price</p>
                        <div className="flex items-baseline gap-2">
                          <span className="font-body text-base text-gold font-bold font-mono">
                            {watch.priceAED}
                          </span>
                          <span className="font-body text-[11px] text-silver/50 font-light font-mono">
                            ({watch.priceUSD})
                          </span>
                        </div>
                      </div>
                      <span className="font-body text-[10px] tracking-[0.15em] text-gold group-hover:underline font-mono uppercase">
                        VIEW SPECS &rarr;
                      </span>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-20 max-w-md mx-auto">
              <Compass className="w-8 h-8 text-gold mx-auto mb-4 opacity-50" />
              <p className="text-sm font-light text-gray-500 font-mono">
                NO CLONE WATCHES MATCHING YOUR SPECIFIED SEARCH. PLEASE BROWSE ALL BRANDS PILLS.
              </p>
            </div>
          )
        )}

        {/* Load More Button */}
        {watches.length > 0 && page < totalPages && (
          <div className="text-center mt-16 anim-fade">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-8 py-3 rounded-full text-xs font-mono font-bold tracking-widest text-black bg-gold hover:bg-gold-light disabled:bg-gray-700 disabled:text-gray-500 transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] inline-flex items-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              LOAD MORE CLONE WATCHES
            </button>
            <p className="text-[10px] text-gray-500 font-mono mt-3 uppercase tracking-wider">
              SHOWING {watches.length} OF {totalCount} HIGH-QUALITY MODELS AVAILABLE
            </p>
          </div>
        )}

      </div>
    </section>
  )
}
