import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Search, Compass, Loader2, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Crown, ArrowRight } from 'lucide-react'
import { translate } from '../utils/translate'
import { WatchImage } from '../components/WatchImage'

gsap.registerPlugin(ScrollTrigger)

interface Watch {
  id: number
  name: string
  brand: string
  audience?: 'Ladies' | 'Gents' | 'Womens' | 'Mens'
  factory: string
  model?: string
  image: string
  thumbnail?: string
  images?: string[]
  priceAED: string
  priceUSD: string
  movement: string
  bezel: string
  glass: string
  waterResistance: string
  description: string
  features: string[]
  nameAr?: string
  brandAr?: string
  modelAr?: string
  movementAr?: string
  descriptionAr?: string
}

const PRIMARY_BRANDS = [
  'Richard Mille',
  'Audemars Piguet',
  'Patek Philippe',
  'Rolex',
  'Hublot',
  'Vacheron Constantin',
  'Omega',
  'Cartier'
]

const OTHER_BRANDS = [
  'Panerai',
  'IWC',
  'Breitling',
  'Roger Dubuis',
  'Chopard',
  'TAG Heuer'
]

const BRAND_MODELS: Record<string, string[]> = {
  'Richard Mille': ['RM 11-03', 'RM 35-02', 'RM 67-02', 'RM 21-02', 'RM 55'],
  'Audemars Piguet': ['Royal Oak', 'Royal Oak Offshore', 'Concept'],
  'Patek Philippe': ['Nautilus', 'Aquanaut', 'Complications', 'Twenty-4', 'Gondolo', 'Calatrava'],
  'Rolex': ['Daytona', 'Submariner', 'Datejust', 'GMT-Master', 'Day-Date', 'Yacht-Master', 'Sea-Dweller', 'Sky-Dweller', 'Milgauss', 'Cellini'],
  'Hublot': ['Big Bang', 'Classic Fusion', 'Spirit of Big Bang'],
  'Vacheron Constantin': ['Patrimony', 'Overseas', 'Historiques', 'Traditionnelle'],
  'Omega': ['Speedmaster', 'Seamaster', 'Constellation', 'De Ville'],
  'Cartier': ['Santos', 'Tank', 'Baignoire', 'Panthère', 'Ballon Bleu'],
  'Panerai': ['Luminor', 'Radiomir', 'Submersible'],
  'IWC': ['Portugieser', 'Pilot', 'Portofino', 'Ingenieur'],
  'Breitling': ['Navitimer', 'Chronomat', 'Superocean', 'Premier'],
  'Roger Dubuis': ['Excalibur', 'Knights of the Round Table', 'Velvet']
}

const AUDIENCES = ['ALL', 'Mens', 'Womens'] as const
type AudienceFilter = typeof AUDIENCES[number]

const getAudienceLabel = (watch: Watch) => {
  if (watch.audience === 'Ladies' || watch.audience === 'Womens') return 'Womens';
  return 'Mens';
}

interface SignatureCollectionProps {
  catalogueEyebrow?: string
  catalogueHeading1?: string
  catalogueHeading2?: string
  catalogueDescription?: string
  activeAudienceFilter?: AudienceFilter
  onAudienceFilterChange?: (audience: AudienceFilter) => void
}

export default function SignatureCollection({
  catalogueEyebrow: _catalogueEyebrow,
  catalogueHeading1: _catalogueHeading1,
  catalogueHeading2: _catalogueHeading2,
  catalogueDescription: _catalogueDescription,
  activeAudienceFilter,
  onAudienceFilterChange,
}: SignatureCollectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const catalogueRef = useRef<HTMLDivElement>(null)
  const brandScrollRef = useRef<HTMLDivElement>(null)

  const scrollToCatalogue = () => {
    if (catalogueRef.current) {
      const yOffset = -85
      const y = catalogueRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handleAudienceClick = (aud: AudienceFilter) => {
    setSelectedAudience(aud)
    setPage(1)
    setTimeout(() => {
      scrollToCatalogue()
    }, 40)
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL BRANDS')
  const [selectedAudienceState, setSelectedAudienceState] = useState<AudienceFilter>('ALL')
  const [selectedModel, setSelectedModel] = useState('')
  const [showMoreBrands, setShowMoreBrands] = useState(false)
  const [brandModels, setBrandModels] = useState<Record<string, string[]>>(BRAND_MODELS)

  const scrollBrandsNext = () => {
    if (brandScrollRef.current) {
      brandScrollRef.current.scrollBy({ left: 160, behavior: 'smooth' })
    }
  }

  const scrollBrandsPrev = () => {
    if (brandScrollRef.current) {
      brandScrollRef.current.scrollBy({ left: -160, behavior: 'smooth' })
    }
  }

  const currentLang = localStorage.getItem('t24_lang') || 'en'
  const isRtl = currentLang === 'ar'



  // Dynamic categories
  const [brands, setBrands] = useState<string[]>(['ALL BRANDS', ...PRIMARY_BRANDS, ...OTHER_BRANDS])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        if (res.ok) {
          const data = await res.json()
          if (data.brands) setBrands(data.brands)
          if (data.brandModels) setBrandModels(data.brandModels)
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }
    fetchCategories()
  }, [])

  const cleanBrands = brands.filter(b => b !== 'ALL BRANDS')
  const primaryBrandsList = cleanBrands.slice(0, 8)
  const otherBrandsList = cleanBrands.slice(8)

  const selectedAudience = activeAudienceFilter !== undefined ? activeAudienceFilter : selectedAudienceState
  const setSelectedAudience = (aud: AudienceFilter) => {
    if (onAudienceFilterChange) {
      onAudienceFilterChange(aud)
    } else {
      setSelectedAudienceState(aud)
    }
  }
  
  // Dynamic backend pagination states
  const [watches, setWatches] = useState<Watch[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ all: 0, womens: 0, mens: 0 })

  // Fetch watches from MongoDB Atlas via MERN API
  const fetchWatches = async (
    brand: string,
    audience: AudienceFilter,
    search: string,
    model: string,
    pageNum: number,
    append = false
  ) => {
    setLoading(true)
    try {
      const brandQuery = brand === 'ALL BRANDS' ? '' : encodeURIComponent(brand)
      const audienceQuery = audience === 'ALL' ? '' : encodeURIComponent(audience)
      const searchQuery = encodeURIComponent(search)
      const modelQuery = encodeURIComponent(model)
      const lang = localStorage.getItem('t24_lang') || 'en'
      const res = await fetch(`/api/products?brand=${brandQuery}&audience=${audienceQuery}&search=${searchQuery}&model=${modelQuery}&page=${pageNum}&limit=6&lang=${lang}`)
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
        if (data.counts) {
          setCounts({
            all: data.counts.all || 0,
            womens: data.counts.womens || 0,
            mens: data.counts.mens || 0
          })
        }
      }
    } catch (err) {
      console.error('Failed to fetch watches from API:', err)
    }
    setLoading(false)
  }

  // Handle Brand Select and reset model
  const handleBrandSelect = (brandName: string) => {
    setSelectedBrand(brandName)
    setSelectedModel('')
    setPage(1)
  }

  // Handle Search Input & Brand Pill Debounced Fetching
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1)
      fetchWatches(selectedBrand, selectedAudience, searchTerm, selectedModel, 1, false)
    }, 350) // 350ms debounce to limit DB query overload

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, selectedBrand, selectedAudience, selectedModel])

  // Load next page
  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchWatches(selectedBrand, selectedAudience, searchTerm, selectedModel, nextPage, true)
  }

  // GSAP scroll reveals
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const banner = section.querySelector('.signature-showcase-banner')
      if (banner) {
        gsap.fromTo(
          banner,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )
      }
    }, section)

    return () => ctx.revert()
  }, [])

  const renderFiltersContent = () => (
    <div className="space-y-6 text-left">
      {/* Search Input */}
      <div>
        <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8c264] mb-3">
          {translate("Search Timepieces", currentLang)}
        </h4>
        <div className="relative">
          <input
            type="text"
            placeholder={translate("Search by model, brand, category, or style...", currentLang)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-3 text-xs bg-white/[0.02] border border-white/10 hover:border-gold/30 focus:border-gold focus:outline-none transition-all duration-300 rounded-lg text-white font-mono ${
              isRtl ? 'pl-10 pr-4' : 'pl-4 pr-10'
            }`}
          />
          {loading ? (
            <Loader2 className={`absolute top-1/2 -translate-y-1/2 text-gold w-3.5 h-3.5 animate-spin ${isRtl ? 'left-3' : 'right-3'}`} />
          ) : (
            <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5 ${isRtl ? 'left-3' : 'right-3'}`} />
          )}
        </div>
      </div>

      {/* Collection / Audience Selection */}
      <div>
        <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8c264] mb-3">
          {translate("Collection", currentLang)}
        </h4>
        <div className="flex flex-col gap-2">
          {AUDIENCES.map((aud) => {
            const countValue = 
              aud === 'ALL' ? counts.all :
              aud === 'Womens' ? counts.womens : counts.mens;
            const isSelected = selectedAudience === aud;
            return (
              <button
                key={aud}
                onClick={() => {
                  setSelectedAudience(aud)
                  setPage(1)
                }}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-mono transition-all duration-300 ${
                  isSelected
                    ? 'bg-gold/10 border border-gold/40 text-gold font-bold'
                    : 'bg-white/[0.01] border border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                }`}
              >
                <span>
                  {aud === 'ALL' 
                    ? translate("ALL CATEGORIES", currentLang) 
                    : translate(aud === 'Womens' ? 'WOMENS' : 'MENS', currentLang)}
                </span>
                <span className="text-[10px] text-gray-500 font-light font-mono">
                  ({countValue})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category: Brands */}
      <div>
        <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8c264] mb-3">
          {translate("Filter by Brand", currentLang)}
        </h4>
        <div className="flex flex-col gap-2">
          {/* ALL BRANDS option */}
          <button
            onClick={() => handleBrandSelect('ALL BRANDS')}
            className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-mono transition-all duration-300 ${
              selectedBrand === 'ALL BRANDS'
                ? 'bg-gold/10 border border-gold/40 text-gold font-bold'
                : 'bg-white/[0.01] border border-white/5 text-gray-400 hover:text-white hover:border-white/10'
            }`}
          >
            <span>{translate("ALL BRANDS", currentLang)}</span>
            {selectedBrand === 'ALL BRANDS' && <Check className="w-3.5 h-3.5 text-gold" />}
          </button>

          {/* Primary Brands */}
          {primaryBrandsList.map((brand) => {
            const isSelected = selectedBrand === brand;
            return (
              <button
                key={brand}
                onClick={() => handleBrandSelect(brand)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-mono transition-all duration-300 ${
                  isSelected
                    ? 'bg-gold/10 border border-gold/40 text-gold font-bold'
                    : 'bg-white/[0.01] border border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                }`}
              >
                <span>{brand}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-gold" />}
              </button>
            );
          })}

          {/* More Brands Collapsible */}
          <div className="pt-1">
            <button
              onClick={() => setShowMoreBrands(!showMoreBrands)}
              className="flex items-center justify-between w-full px-4 py-2 rounded-lg text-xs font-mono text-gray-400 hover:text-white transition-all duration-300 bg-white/[0.01] border border-white/5"
            >
              <span>{translate("More Brands", currentLang)}</span>
              {showMoreBrands ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showMoreBrands && (
              <div className="pl-3 pr-1 mt-2 space-y-1.5 border-l border-white/5 max-h-[180px] overflow-y-auto custom-scrollbar">
                {otherBrandsList.map((brand) => {
                  const isSelected = selectedBrand === brand;
                  return (
                    <button
                      key={brand}
                      onClick={() => handleBrandSelect(brand)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-[11px] font-mono transition-all duration-300 ${
                        isSelected
                          ? 'bg-gold/10 text-gold font-bold'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <span>{brand}</span>
                      {isSelected && <Check className="w-3 h-3 text-gold" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-category: Variants/Types */}
      <div>
        <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8c264] mb-3">
          {translate("Filter by Model", currentLang)}
        </h4>
        {selectedBrand !== 'ALL BRANDS' && brandModels[selectedBrand] ? (
          <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
            {brandModels[selectedBrand].map((model) => {
              const isSelected = selectedModel === model;
              return (
                <button
                  key={model}
                  onClick={() => {
                    setSelectedModel(isSelected ? '' : model)
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono transition-all duration-300 border ${
                    isSelected
                      ? 'bg-gold border-gold text-black font-semibold shadow-[0_4px_12px_rgba(212,175,55,0.2)]'
                      : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:border-gold/20'
                  }`}
                >
                  {model}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] font-mono text-gray-500 italic leading-relaxed">
            {translate("Select a brand to view available model variants.", currentLang)}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <section
      ref={sectionRef}
      id="store"
      className="relative bg-dark border-t border-b border-white/5 pt-3 pb-12 sm:pt-6 sm:pb-20 lg:pt-8 lg:pb-28 overflow-hidden"
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

      <div className="relative z-10 w-full px-3.5 sm:px-6 lg:px-12 xl:px-20">
        
        {/* MOBILE VIEW (< md): Compact Header + Dual Side-by-Side Gender Cards */}
        <div className="block md:hidden text-left mb-4">
          
          {/* Header Title & Subtitle */}
          <div className="px-1 pt-1 pb-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-[2px] w-5 bg-gold rounded-full" />
              <h2 className="font-display text-2xl font-light tracking-wide text-white uppercase">
                {translate("WATCHES", currentLang)}
              </h2>
            </div>
            <p className="font-body text-[11px] text-silver/70 font-light tracking-wide pl-7">
              {translate("Timeless craftsmanship for every moment.", currentLang)}
            </p>
          </div>

          {/* Dual 2-Column Side-by-Side Gender Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 mb-3.5">
            
            {/* Card 1: FOR MEN */}
            <button
              type="button"
              onClick={() => {
                handleAudienceClick(selectedAudience === 'Mens' ? 'ALL' : 'Mens')
                scrollToCatalogue()
              }}
              className={`relative group/mcard aspect-[4/3.5] min-h-[145px] sm:min-h-[170px] rounded-2xl overflow-hidden border transition-all duration-300 active:scale-95 text-left ${
                selectedAudience === 'Mens'
                  ? 'border-gold shadow-[0_0_20px_rgba(212,175,55,0.5)] ring-1 ring-gold'
                  : 'border-gold/30 bg-[#0e0e11] hover:border-gold/60'
              }`}
            >
              <img
                src="/images/card-him.jpg"
                alt="For Men"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover/mcard:scale-105 select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 pointer-events-none" />
              
              {/* Mars ♂ Top Badge */}
              <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/75 backdrop-blur-md border border-gold/50 text-gold shadow-md">
                <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 48 48" fill="none">
                  <circle cx="21" cy="27" r="6" className="stroke-gold" strokeWidth="3" />
                  <path d="M25.5 22.5L33 15M33 15H27M33 15V21" className="stroke-gold" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Bottom Label, Model Count & Action Arrow */}
              <div className="absolute bottom-2.5 sm:bottom-3 inset-x-2.5 sm:inset-x-3 flex items-end justify-between gap-2">
                <div>
                  <p className="font-mono text-xs sm:text-sm font-bold tracking-wider text-white uppercase leading-none drop-shadow-sm">
                    {translate("FOR MEN", currentLang)}
                  </p>
                  <p className="font-mono text-[10px] sm:text-xs text-gold/90 font-medium mt-1">
                    {counts.mens || 214} {translate("Models", currentLang)}
                  </p>
                </div>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                  selectedAudience === 'Mens'
                    ? 'bg-gold text-black shadow-md'
                    : 'bg-gold/20 backdrop-blur-sm border border-gold/40 text-gold group-hover/mcard:bg-gold group-hover/mcard:text-black'
                }`}>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
            </button>

            {/* Card 2: FOR WOMEN */}
            <button
              type="button"
              onClick={() => {
                handleAudienceClick(selectedAudience === 'Womens' ? 'ALL' : 'Womens')
                scrollToCatalogue()
              }}
              className={`relative group/wcard aspect-[4/3.5] min-h-[145px] sm:min-h-[170px] rounded-2xl overflow-hidden border transition-all duration-300 active:scale-95 text-left ${
                selectedAudience === 'Womens'
                  ? 'border-gold shadow-[0_0_20px_rgba(212,175,55,0.5)] ring-1 ring-gold'
                  : 'border-gold/30 bg-[#0e0e11] hover:border-gold/60'
              }`}
            >
              <img
                src="/images/card-her.jpg"
                alt="For Women"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover/wcard:scale-105 select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 pointer-events-none" />
              
              {/* Venus ♀ Top Badge */}
              <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/75 backdrop-blur-md border border-gold/50 text-gold shadow-md">
                <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="19" r="6" className="stroke-gold" strokeWidth="3" />
                  <path d="M24 25V35M19 30H29" className="stroke-gold" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Bottom Label, Model Count & Action Arrow */}
              <div className="absolute bottom-2.5 sm:bottom-3 inset-x-2.5 sm:inset-x-3 flex items-end justify-between gap-2">
                <div>
                  <p className="font-mono text-xs sm:text-sm font-bold tracking-wider text-white uppercase leading-none drop-shadow-sm">
                    {translate("FOR WOMEN", currentLang)}
                  </p>
                  <p className="font-mono text-[10px] sm:text-xs text-gold/90 font-medium mt-1">
                    {counts.womens || 13} {translate("Models", currentLang)}
                  </p>
                </div>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                  selectedAudience === 'Womens'
                    ? 'bg-gold text-black shadow-md'
                    : 'bg-gold/20 backdrop-blur-sm border border-gold/40 text-gold group-hover/wcard:bg-gold group-hover/wcard:text-black'
                }`}>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
            </button>

          </div>
        </div>

        {/* DESKTOP VIEW (≥ md): Luxury Men & Women Dual Showcase Feature */}
        <div className="signature-showcase-banner mb-6 sm:mb-10 max-w-7xl mx-auto hidden md:block">
          <div className="relative rounded-3xl border border-gold/30 bg-[#0d0d0f] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] min-h-[460px] lg:min-h-[500px] flex flex-col justify-between p-7 lg:p-9 group">
            
            {/* Responsive Background Luxury Photo with Smooth Lighting */}
            <picture className="absolute inset-0 w-full h-full pointer-events-none">
              <source media="(max-width: 767px)" srcSet="/curated-men-women-banner-mobile.jpg" />
              <source media="(min-width: 768px)" srcSet="/curated-men-women-banner-desktop.png" />
              <img 
                src="/curated-men-women-banner-desktop.png" 
                alt="Premium Watches For Him & Her"
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.02] select-none"
              />
            </picture>
            
            {/* Subtle Vignette for Text Contrast while keeping watches luminous */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{
                background: 'radial-gradient(ellipse 55% 70% at 50% 50%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 65%, transparent 100%)'
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

            {/* Top Row: Octagonal Gold Wireframe Gender Badges */}
            <div className="relative z-10 flex items-start justify-between gap-4">
              
              {/* FOR HIM / FOR MEN */}
              <button
                type="button"
                onClick={() => handleAudienceClick(selectedAudience === 'Mens' ? 'ALL' : 'Mens')}
                className="group/him flex flex-col items-center gap-1.5 focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95 text-left"
              >
                <div className={`relative w-13 h-13 flex items-center justify-center transition-all duration-300 ${
                  selectedAudience === 'Mens'
                    ? 'filter drop-shadow-[0_0_15px_rgba(212,175,55,0.7)]'
                    : 'group-hover/him:filter group-hover/him:drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                }`}>
                  <svg className="w-13 h-13" viewBox="0 0 48 48" fill="none">
                    <polygon 
                      points="14,4 34,4 44,14 44,34 34,44 14,44 4,34 4,14" 
                      className={`transition-colors duration-300 ${
                        selectedAudience === 'Mens'
                          ? 'fill-gold/30 stroke-gold'
                          : 'fill-black/60 stroke-gold/60 group-hover/him:stroke-gold group-hover/him:fill-black/80'
                      }`}
                      strokeWidth="1.5" 
                    />
                    {/* Male Mars Symbol ♂ */}
                    <circle cx="21" cy="27" r="6" className={selectedAudience === 'Mens' ? 'stroke-black' : 'stroke-gold'} strokeWidth="2" />
                    <path d="M25.5 22.5L33 15M33 15H27M33 15V21" className={selectedAudience === 'Mens' ? 'stroke-black' : 'stroke-gold'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className={`font-mono text-xs tracking-[0.2em] uppercase font-bold transition-colors ${
                  selectedAudience === 'Mens' ? 'text-gold drop-shadow-md' : 'text-gold/90 group-hover/him:text-gold'
                }`}>
                  {translate("FOR MEN", currentLang)}
                </span>
                <span className="text-[9px] font-mono text-silver/60 -mt-1">({counts.mens || 214})</span>
              </button>

              {/* FOR LADIES / FOR WOMEN */}
              <button
                type="button"
                onClick={() => handleAudienceClick(selectedAudience === 'Womens' ? 'ALL' : 'Womens')}
                className="group/her flex flex-col items-center gap-1.5 focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95 text-right"
              >
                <div className={`relative w-13 h-13 flex items-center justify-center transition-all duration-300 ${
                  selectedAudience === 'Womens'
                    ? 'filter drop-shadow-[0_0_15px_rgba(212,175,55,0.7)]'
                    : 'group-hover/her:filter group-hover/her:drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                }`}>
                  <svg className="w-13 h-13" viewBox="0 0 48 48" fill="none">
                    <polygon 
                      points="14,4 34,4 44,14 44,34 34,44 14,44 4,34 4,14" 
                      className={`transition-colors duration-300 ${
                        selectedAudience === 'Womens'
                          ? 'fill-gold/30 stroke-gold'
                          : 'fill-black/60 stroke-gold/60 group-hover/her:stroke-gold group-hover/her:fill-black/80'
                      }`}
                      strokeWidth="1.5" 
                    />
                    {/* Female Venus Symbol ♀ */}
                    <circle cx="24" cy="19" r="6" className={selectedAudience === 'Womens' ? 'stroke-black' : 'stroke-gold'} strokeWidth="2" />
                    <path d="M24 25V35M19 30H29" className={selectedAudience === 'Womens' ? 'stroke-black' : 'stroke-gold'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className={`font-mono text-xs tracking-[0.2em] uppercase font-bold transition-colors ${
                  selectedAudience === 'Womens' ? 'text-gold drop-shadow-md' : 'text-gold/90 group-hover/her:text-gold'
                }`}>
                  {translate("FOR WOMEN", currentLang)}
                </span>
                <span className="text-[9px] font-mono text-silver/60 -mt-1">({counts.womens || 13})</span>
              </button>

            </div>

            {/* Center Content: Special Selection, Premium Watches For Him & Her, Model Counter */}
            <div className="relative z-10 text-center my-auto py-6 px-4">
              
              {/* Eyebrow Filigree */}
              <div className="flex items-center justify-center gap-3 mb-1">
                <span className="h-[1px] w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#e8c264] font-semibold">
                  {translate("SPECIAL SELECTION", currentLang)}
                </p>
                <span className="h-[1px] w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
              </div>
              
              {/* Crown Icon */}
              <div className="flex items-center justify-center mb-1.5">
                <Crown className="w-4 h-4 text-gold/90" />
              </div>

              {/* Headings */}
              <h3 className="font-display text-4xl lg:text-5xl text-white font-light tracking-wide leading-tight">
                {translate("PREMIUM WATCHES", currentLang)}
              </h3>
              <h4 className="font-display text-4xl lg:text-5xl text-gold font-bold tracking-wider leading-tight mt-1">
                {translate("FOR MEN & WOMEN", currentLang)}
              </h4>

              {/* Center Octagonal Framed Counter Box */}
              <div 
                onClick={() => handleAudienceClick('ALL')}
                className="mt-4 relative inline-flex flex-col items-center cursor-pointer group/center transition-all duration-300 hover:scale-105"
              >
                <div className="relative px-8 py-3 flex flex-col items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full text-gold/60 group-hover/center:text-gold transition-colors filter drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]" viewBox="0 0 120 70" preserveAspectRatio="none">
                    <polygon points="16,2 104,2 118,18 118,52 104,68 16,68 2,52 2,18" fill="rgba(10,10,12,0.85)" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <div className="relative z-10 text-center">
                    <span className="font-display text-3xl lg:text-4xl text-gold font-bold tracking-tight">
                      {selectedAudience === 'Mens' ? (counts.mens || 214) : selectedAudience === 'Womens' ? (counts.womens || 13) : (counts.all || 227)}
                    </span>
                    <p className="font-mono text-[9px] tracking-[0.25em] text-white/90 uppercase font-semibold mt-0.5">
                      {translate("EXCLUSIVE MODELS", currentLang)}
                    </p>
                  </div>
                </div>
                <p className="font-body text-[11px] text-silver/75 font-light tracking-wider mt-2.5 italic text-center max-w-xs leading-tight">
                  {translate("Timeless craftsmanship. Iconic design. Infinite prestige.", currentLang)}
                </p>
              </div>
            </div>

            {/* Bottom Row: Watch Model Annotations & Explore Action Buttons */}
            <div className="relative z-10 flex items-end justify-between gap-4 pt-3">
              
              {/* Bottom Left Watch Label (Desktop only) + Large Mobile Explore Men's Button */}
              <div className="text-left select-none space-y-2">
                <div>
                  <p className="font-mono text-xs font-bold text-white tracking-widest uppercase">
                    RICHARD MILLE
                  </p>
                  <p className="font-mono text-[10px] text-silver/60 tracking-wider uppercase">
                    RM 011
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAudienceClick('Mens')}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-mono font-semibold tracking-wider uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer shadow-lg active:scale-95 ${
                    selectedAudience === 'Mens'
                      ? 'bg-gold text-black border-gold shadow-[0_0_18px_rgba(212,175,55,0.6)]'
                      : 'bg-black/75 text-white hover:text-gold border-white/25 hover:border-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                  }`}
                >
                  <span>{translate("EXPLORE MEN'S", currentLang)}</span>
                  <ChevronRight className="w-3 h-3 text-gold" />
                </button>
              </div>

              {/* Bottom Right Watch Label (Desktop only) + Large Mobile Explore Women's Button */}
              <div className="text-right select-none space-y-2">
                <div>
                  <p className="font-mono text-xs font-bold text-white tracking-widest uppercase">
                    AUDEMARS PIGUET
                  </p>
                  <p className="font-mono text-[10px] text-gold/80 tracking-wider uppercase">
                    ROYAL OAK DIAMOND
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAudienceClick('Womens')}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-mono font-semibold tracking-wider uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer shadow-lg active:scale-95 ${
                    selectedAudience === 'Womens'
                      ? 'bg-gold text-black border-gold shadow-[0_0_18px_rgba(212,175,55,0.6)]'
                      : 'bg-black/75 text-white hover:text-gold border-white/25 hover:border-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                  }`}
                >
                  <span>{translate("EXPLORE WOMEN'S", currentLang)}</span>
                  <ChevronRight className="w-3 h-3 text-gold" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Anchor and Container for catalogue browsing */}
        <div ref={catalogueRef} id="catalogue-browse" className="w-full scroll-mt-20">

          {/* Mobile Inline Filter Controls - Fast, 1-View Desktop Experience */}
          <div className="lg:hidden mb-6 space-y-2.5">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder={translate("Search by model, brand, category...", currentLang)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full py-2 px-3.5 text-xs bg-[#0d0d0f]/90 border border-white/10 hover:border-gold/30 focus:border-gold focus:outline-none transition-all duration-300 rounded-xl text-white font-mono placeholder:text-gray-500 shadow-sm ${
                isRtl ? 'pl-9 pr-3.5' : 'pl-3.5 pr-9'
              }`}
            />
            {loading ? (
              <Loader2 className={`absolute top-1/2 -translate-y-1/2 text-gold w-3.5 h-3.5 animate-spin ${isRtl ? 'left-3' : 'right-3'}`} />
            ) : (
              <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5 ${isRtl ? 'left-3' : 'right-3'}`} />
            )}
          </div>

          {/* Collection / Audience Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {AUDIENCES.map((aud) => {
              const countValue = 
                aud === 'ALL' ? counts.all :
                aud === 'Womens' ? counts.womens : counts.mens;
              const isSelected = selectedAudience === aud;
              return (
                <button
                  key={aud}
                  onClick={() => {
                    setSelectedAudience(aud);
                    setPage(1);
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gold text-black font-bold shadow-[0_2px_10px_rgba(212,175,55,0.3)]'
                      : 'bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span>
                    {aud === 'ALL' 
                      ? translate("ALL", currentLang) 
                      : translate(aud === 'Womens' ? 'WOMENS' : 'MENS', currentLang)}
                  </span>
                  <span className={`text-[9px] ${isSelected ? 'text-black/80 font-bold' : 'text-gray-500'}`}>
                    ({countValue})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Brand Filter Header & Scroll Arrows */}
          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-2">
              <span className="h-[1px] w-4 bg-[#e8c264]" />
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e8c264]">
                {translate("Filter by Brand", currentLang)}
              </p>
            </div>
            <div className="flex items-center gap-1.5" dir="ltr">
              <button
                type="button"
                onClick={scrollBrandsPrev}
                aria-label="Scroll brands left"
                className="w-6 h-6 rounded-full border border-white/10 bg-black/80 hover:border-gold hover:text-gold flex items-center justify-center text-gray-400 transition-all active:scale-95 shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={scrollBrandsNext}
                aria-label="Scroll brands right"
                className="w-6 h-6 rounded-full border border-white/10 bg-black/80 hover:border-gold hover:text-gold flex items-center justify-center text-gray-400 transition-all active:scale-95 shadow-sm"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Brand Filter Horizontal Scrolling Pills */}
          <div 
            ref={brandScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 scroll-smooth"
          >
            {/* ALL BRANDS */}
            <button
              onClick={() => handleBrandSelect('ALL BRANDS')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all duration-300 ${
                selectedBrand === 'ALL BRANDS'
                  ? 'bg-gold/20 border border-gold text-gold font-bold shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {translate("ALL BRANDS", currentLang)}
            </button>

            {/* All Brands Pills */}
            {[...primaryBrandsList, ...otherBrandsList].map((brand) => {
              const isSelected = selectedBrand === brand;
              return (
                <button
                  key={brand}
                  onClick={() => handleBrandSelect(brand)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all duration-300 ${
                    isSelected
                      ? 'bg-gold/20 border border-gold text-gold font-bold shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                      : 'bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>

          {/* Model Filter Pills (if selected brand has models) */}
          {selectedBrand !== 'ALL BRANDS' && (brandModels[selectedBrand]?.length ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5 pb-1 anim-fade">
              <button
                onClick={() => {
                  setSelectedModel('');
                  setPage(1);
                }}
                className={`shrink-0 px-2.5 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider transition-all ${
                  selectedModel === ''
                    ? 'bg-gold/20 border border-gold/40 text-gold font-bold'
                    : 'bg-white/[0.02] border border-white/5 text-gray-500 hover:text-gray-300'
                }`}
              >
                {translate("All Models", currentLang)}
              </button>
              {brandModels[selectedBrand].map((model) => {
                const isSelected = selectedModel === model;
                return (
                  <button
                    key={model}
                    onClick={() => {
                      setSelectedModel(model);
                      setPage(1);
                    }}
                    className={`shrink-0 px-2.5 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider transition-all ${
                      isSelected
                        ? 'bg-gold/20 border border-gold/40 text-gold font-bold'
                        : 'bg-white/[0.02] border border-white/5 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {model}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Catalog Container Layout: Sidebar + Grid */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] gap-10 items-start max-w-7xl mx-auto">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-full bg-[#0d0d0f]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6 space-y-8 sticky top-28 z-20">
            {renderFiltersContent()}
          </aside>

          {/* Watch Cards Grid Container */}
          <div className="flex-1 space-y-8">
            {watches.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
                {watches.map((watch) => {
                  const isAr = currentLang === 'ar';
                  const displayName = isAr && watch.nameAr ? watch.nameAr : watch.name;
                  const displayBrand = isAr && watch.brandAr ? watch.brandAr : watch.brand;
                  const displayModel = isAr && watch.modelAr ? watch.modelAr : (watch.model || watch.name.replace(new RegExp(watch.brand, 'i'), '').trim() || 'Super Clone');

                  return (
                    <Link
                      key={watch.id}
                      to={`/product/${watch.id}`}
                      className="collection-card group cursor-pointer watch-card block"
                    >
                      <div className="relative bg-[#0d0d0f]/60 backdrop-blur-sm border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 hover:border-gold/30 shadow-2xl flex flex-col justify-between h-full">

                        {/* Watch Image Aspect Box */}
                        <div className="aspect-square overflow-hidden bg-[#0d0d0f] relative flex items-center justify-center p-2 sm:p-6 xl:p-10">
                          <WatchImage
                            src={watch.image}
                            alt={displayName}
                            loading="lazy"
                            className="max-h-[95%] max-w-[95%] object-contain transition-transform duration-700 group-hover:scale-105 select-none"
                          />

                          <span className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/85 backdrop-blur-md border border-gold/30 text-gold font-body text-[7px] sm:text-[9px] font-bold tracking-[0.05em] sm:tracking-[0.1em] px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase shadow-md font-mono">
                            {translate(getAudienceLabel(watch) === 'Womens' ? 'WOMENS' : 'MENS', currentLang)}
                          </span>

                          <span className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/70 backdrop-blur-md border border-white/10 text-white/70 font-body text-[7px] sm:text-[8px] font-bold tracking-[0.05em] sm:tracking-[0.1em] px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase shadow-md font-mono max-w-[48%] truncate">
                            {displayBrand}
                          </span>

                          {/* Stock indicator badge */}
                          <span className="hidden sm:block absolute bottom-4 right-4 text-[8px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                            {translate("IN STOCK", currentLang)}
                          </span>
                        </div>

                        {/* Info Section */}
                        <div className="p-2.5 sm:p-6 flex flex-col justify-between flex-grow">
                          <div>
                            <p className="font-body text-[7px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] text-gold mb-1 sm:mb-1.5 uppercase font-semibold font-mono">
                              {translate("SIGNATURE TIMEPIECE", currentLang)}
                            </p>
                            <h3 className="font-body text-xs sm:text-base font-light tracking-wide text-white group-hover:text-gold transition-colors duration-300 line-clamp-2 leading-tight">
                              {displayName}
                            </h3>
                            {/* Visible Model name tag */}
                            <span className="hidden sm:inline-block mt-2 px-2 py-0.5 text-[8px] font-mono text-white/50 border border-white/10 rounded uppercase">
                              {displayModel}
                            </span>
                          </div>

                        <div className="mt-2 sm:mt-6 pt-2 sm:pt-4 border-t border-white/5">
                          <p className={`font-body text-[7px] sm:text-[9px] tracking-wider text-silver/40 uppercase font-mono ${isRtl ? 'text-right' : 'text-left'}`}>
                            {translate("Exclusive Price", currentLang)}
                          </p>
                          <div
                            dir="ltr"
                            className={`mt-0.5 sm:mt-1 flex flex-wrap items-baseline gap-x-1.5 sm:gap-x-3 gap-y-0.5 ${isRtl ? 'justify-end' : 'justify-start'}`}
                          >
                            <span className="font-body text-xs sm:text-base text-gold font-bold font-mono whitespace-nowrap">
                              {watch.priceAED}
                            </span>
                            <span className="font-body text-[8px] sm:text-[11px] text-silver/50 font-light font-mono whitespace-nowrap">
                              ({watch.priceUSD})
                            </span>
                          </div>
                          <span className={`mt-1.5 sm:mt-4 block font-body text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.15em] text-gold group-hover:underline font-mono uppercase whitespace-nowrap ${isRtl ? 'text-right' : 'text-left'}`}>
                            {isRtl && <span aria-hidden="true">&larr; </span>}
                            {translate("VIEW SPECS", currentLang)}
                            {!isRtl && <span aria-hidden="true"> &rarr;</span>}
                          </span>
                        </div>
                      </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-20 max-w-md mx-auto">
                  <Compass className="w-8 h-8 text-gold mx-auto mb-4 opacity-50" />
                  <p className="text-sm font-light text-gray-500 font-mono leading-relaxed uppercase">
                    {translate("NO WATCHES MATCHING YOUR SEARCH. PLEASE BROWSE ALL BRAND PILLS.", currentLang)}
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
                  {translate("LOAD MORE WATCHES", currentLang)}
                </button>
                <p className="text-[10px] text-gray-500 font-mono mt-3 uppercase tracking-wider">
                  {translate("SHOWING", currentLang)} {watches.length} {translate("OF", currentLang)} {totalCount} {translate("HIGH-QUALITY MODELS AVAILABLE", currentLang)}
                </p>
              </div>
            )}
          </div>

        </div>

        </div>

      </div>
    </section>
  )
}
