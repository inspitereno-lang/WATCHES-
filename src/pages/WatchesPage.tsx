import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router'
import { 
  Crown, 
  Search, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  ArrowUpDown, 
  Check, 
  ShieldCheck, 
  RotateCcw,
  SlidersHorizontal,
  Loader2
} from 'lucide-react'
import { translate } from '../utils/translate'
import { WatchImage } from '../components/WatchImage'

interface Watch {
  id: number
  name: string
  brand: string
  image: string
  thumbnail?: string
  images?: string[]
  priceAED: string
  priceUSD: string
  movement?: string
  glass?: string
  bezel?: string
  factory?: string
  model?: string
  audience?: string
  nameAr?: string
  brandAr?: string
  modelAr?: string
  movementAr?: string
  descriptionAr?: string
}

const PRIMARY_BRANDS = [
  'ALL BRANDS',
  'Richard Mille',
  'Audemars Piguet',
  'Patek Philippe',
  'Rolex',
  'Hublot',
  'Vacheron Constantin',
  'Omega',
  'Cartier',
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

export default function WatchesPage() {
  const currentLang = localStorage.getItem('t24_lang') || 'en'
  
  // Dynamic categories
  const [brands, setBrands] = useState<string[]>(PRIMARY_BRANDS)
  const [brandModels, setBrandModels] = useState<Record<string, string[]>>(BRAND_MODELS)

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

  // Catalog state
  const [watches, setWatches] = useState<Watch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL BRANDS')
  const [selectedAudience, setSelectedAudience] = useState<'ALL' | 'Womens' | 'Mens'>('ALL')
  const [selectedModel, setSelectedModel] = useState('')
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc'>('default')
  const [counts, setCounts] = useState({ all: 0, mens: 0, womens: 0 })
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filter Dropdowns visibility
  const brandScrollRef = useRef<HTMLDivElement>(null)
  const catalogueRef = useRef<HTMLDivElement>(null)
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false)
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)

  const scrollToCatalogue = () => {
    if (catalogueRef.current) {
      const yOffset = -85
      const y = catalogueRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const handleAudienceClick = (aud: 'ALL' | 'Womens' | 'Mens') => {
    setSelectedAudience(aud)
    setPage(1)
    setTimeout(() => {
      scrollToCatalogue()
    }, 40)
  }

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


  // Fetch Catalog Watches
  const fetchWatchesData = async (
    brand: string,
    audience: string,
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
      const res = await fetch(`/api/products?brand=${brandQuery}&audience=${audienceQuery}&search=${searchQuery}&model=${modelQuery}&page=${pageNum}&limit=12&lang=${lang}`)
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
      console.error('Failed to fetch watches:', err)
    }
    setLoading(false)
  }

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchWatchesData(selectedBrand, selectedAudience, searchTerm, selectedModel, 1, false)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, selectedBrand, selectedAudience, selectedModel])

  const loadMoreWatches = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchWatchesData(selectedBrand, selectedAudience, searchTerm, selectedModel, nextPage, true)
  }


  // Client-side Price Sorting
  const processedWatches = [...watches].sort((a, b) => {
    if (sortBy === 'priceAsc') {
      const priceA = parseFloat(a.priceAED.replace(/[^0-9.]/g, '')) || 0
      const priceB = parseFloat(b.priceAED.replace(/[^0-9.]/g, '')) || 0
      return priceA - priceB
    }
    if (sortBy === 'priceDesc') {
      const priceA = parseFloat(a.priceAED.replace(/[^0-9.]/g, '')) || 0
      const priceB = parseFloat(b.priceAED.replace(/[^0-9.]/g, '')) || 0
      return priceB - priceA
    }
    return 0
  })

  const resetFilters = () => {
    setSelectedBrand('ALL BRANDS')
    setSelectedModel('')
    setSelectedAudience('ALL')
    setSearchTerm('')
    setSortBy('default')
  }

  const activeFilterCount =
    Number(selectedBrand !== 'ALL BRANDS') +
    Number(Boolean(selectedModel)) +
    Number(selectedAudience !== 'ALL') +
    Number(sortBy !== 'default')

  return (
    <div className="bg-[#070708] min-h-screen text-white pt-8 sm:pt-16 pb-12 sm:pb-20 selection:bg-gold/30 selection:text-white">
      {/* Dynamic luxury background */}
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gold/5 blur-[150px] rounded-full" />
        <div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/[0.02] blur-[150px] rounded-full" />
      </div>

      {/* Hero section with Luxury Showcase Banner & Brand Pills */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-4 sm:pt-4 sm:pb-8 text-center">

        {/* Luxury Men & Women Dual Showcase Feature */}
        <div className="pt-2 sm:pt-4 max-w-7xl mx-auto text-left">
          <div className="relative rounded-2xl sm:rounded-3xl border border-gold/30 bg-[#0d0d0f] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] min-h-[420px] sm:min-h-[460px] lg:min-h-[500px] flex flex-col justify-between p-4 sm:p-7 lg:p-9 group">
            
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
                <div className={`relative w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center transition-all duration-300 ${
                  selectedAudience === 'Mens'
                    ? 'filter drop-shadow-[0_0_15px_rgba(212,175,55,0.7)]'
                    : 'group-hover/him:filter group-hover/him:drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                }`}>
                  <svg className="w-11 h-11 sm:w-13 sm:h-13" viewBox="0 0 48 48" fill="none">
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
                <span className={`font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase font-bold transition-colors ${
                  selectedAudience === 'Mens' ? 'text-gold drop-shadow-md' : 'text-gold/90 group-hover/him:text-gold'
                }`}>
                  {translate("FOR HIM", currentLang)}
                </span>
                <span className="text-[9px] font-mono text-silver/60 -mt-1">({counts.mens || 214})</span>
              </button>

              {/* FOR HER / FOR WOMEN */}
              <button
                type="button"
                onClick={() => handleAudienceClick(selectedAudience === 'Womens' ? 'ALL' : 'Womens')}
                className="group/her flex flex-col items-center gap-1.5 focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95 text-right"
              >
                <div className={`relative w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center transition-all duration-300 ${
                  selectedAudience === 'Womens'
                    ? 'filter drop-shadow-[0_0_15px_rgba(212,175,55,0.7)]'
                    : 'group-hover/her:filter group-hover/her:drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                }`}>
                  <svg className="w-11 h-11 sm:w-13 sm:h-13" viewBox="0 0 48 48" fill="none">
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
                <span className={`font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase font-bold transition-colors ${
                  selectedAudience === 'Womens' ? 'text-gold drop-shadow-md' : 'text-gold/90 group-hover/her:text-gold'
                }`}>
                  {translate("FOR HER", currentLang)}
                </span>
                <span className="text-[9px] font-mono text-silver/60 -mt-1">({counts.womens || 13})</span>
              </button>

            </div>

            {/* Center Content: Special Selection, Premium Watches For Him & Her, Model Counter */}
            <div className="relative z-10 text-center my-auto py-4 sm:py-6 px-4">
              
              {/* Eyebrow Filigree */}
              <div className="flex items-center justify-center gap-3 mb-1">
                <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
                <p className="font-mono text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-[#e8c264] font-semibold">
                  {translate("SPECIAL SELECTION", currentLang)}
                </p>
                <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
              </div>
              
              {/* Crown Icon */}
              <div className="flex items-center justify-center mb-1.5">
                <Crown className="w-4 h-4 text-gold/90" />
              </div>

              {/* Headings */}
              <h3 className="font-display text-2xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide leading-tight">
                {translate("PREMIUM WATCHES", currentLang)}
              </h3>
              <h4 className="font-display text-2xl sm:text-4xl lg:text-5xl text-gold font-bold tracking-wider leading-tight mt-0.5 sm:mt-1">
                {translate("FOR HIM & HER", currentLang)}
              </h4>

              {/* Center Octagonal Framed Counter Box */}
              <div 
                onClick={() => handleAudienceClick('ALL')}
                className="mt-4 relative inline-flex flex-col items-center cursor-pointer group/center transition-all duration-300 hover:scale-105"
              >
                <div className="relative px-6 py-2.5 sm:px-8 sm:py-3 flex flex-col items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full text-gold/60 group-hover/center:text-gold transition-colors filter drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]" viewBox="0 0 120 70" preserveAspectRatio="none">
                    <polygon points="16,2 104,2 118,18 118,52 104,68 16,68 2,52 2,18" fill="rgba(10,10,12,0.85)" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <div className="relative z-10 text-center">
                    <span className="font-display text-2xl sm:text-3xl lg:text-4xl text-gold font-bold tracking-tight">
                      {selectedAudience === 'Mens' ? (counts.mens || 214) : selectedAudience === 'Womens' ? (counts.womens || 13) : (counts.all || 227)}
                    </span>
                    <p className="font-mono text-[8px] sm:text-[9px] tracking-[0.25em] text-white/90 uppercase font-semibold mt-0.5">
                      {translate("EXCLUSIVE MODELS", currentLang)}
                    </p>
                  </div>
                </div>
                <p className="font-body text-[10px] sm:text-[11px] text-silver/75 font-light tracking-wider mt-2.5 italic text-center max-w-xs leading-tight">
                  {translate("Timeless craftsmanship. Iconic design. Infinite prestige.", currentLang)}
                </p>
              </div>
            </div>

            {/* Bottom Row: Watch Model Annotations & Explore Action Buttons */}
            <div className="relative z-10 flex items-end justify-between gap-4 pt-3">
              
              {/* Bottom Left Watch Label + Explore Men's Button */}
              <div className="text-left select-none space-y-2">
                <div>
                  <p className="font-mono text-[10px] sm:text-xs font-bold text-white tracking-widest uppercase">
                    RICHARD MILLE
                  </p>
                  <p className="font-mono text-[8px] sm:text-[10px] text-silver/60 tracking-wider uppercase">
                    RM 011
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAudienceClick('Mens')}
                  className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-[9px] sm:text-[11px] font-mono tracking-wider uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
                    selectedAudience === 'Mens'
                      ? 'bg-gold text-black border-gold font-bold shadow-[0_0_15px_rgba(212,175,55,0.5)]'
                      : 'bg-black/65 text-silver hover:text-gold border-white/20 hover:border-gold shadow-md hover:shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  }`}
                >
                  <span>{translate("EXPLORE MEN'S", currentLang)}</span>
                  <ChevronRight className="w-3 h-3 text-gold" />
                </button>
              </div>

              {/* Bottom Right Watch Label + Explore Women's Button */}
              <div className="text-right select-none space-y-2">
                <div>
                  <p className="font-mono text-[10px] sm:text-xs font-bold text-white tracking-widest uppercase">
                    AUDEMARS PIGUET
                  </p>
                  <p className="font-mono text-[8px] sm:text-[10px] text-gold/80 tracking-wider uppercase">
                    ROYAL OAK DIAMOND
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAudienceClick('Womens')}
                  className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-[9px] sm:text-[11px] font-mono tracking-wider uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
                    selectedAudience === 'Womens'
                      ? 'bg-gold text-black border-gold font-bold shadow-[0_0_15px_rgba(212,175,55,0.5)]'
                      : 'bg-black/65 text-silver hover:text-gold border-white/20 hover:border-gold shadow-md hover:shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  }`}
                >
                  <span>{translate("EXPLORE WOMEN'S", currentLang)}</span>
                  <ChevronRight className="w-3 h-3 text-gold" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Brand visual pills row - Exact Desktop-matched Design */}
        <div className="pt-6 sm:pt-8 max-w-5xl mx-auto">
          {/* Mobile Scroll Header with Arrows */}
          <div className="flex md:hidden items-center justify-between pb-2 px-1">
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

          {/* Brand Pills */}
          <div 
            ref={brandScrollRef}
            className="flex items-center md:flex-wrap md:justify-center gap-2 overflow-x-auto scrollbar-none pb-1 scroll-smooth"
          >
            {brands.map((brand) => {
              const isSelected = selectedBrand === brand;
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => {
                    setSelectedBrand(brand)
                    setSelectedModel('')
                    setPage(1)
                  }}
                  className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-mono tracking-widest uppercase transition-all duration-300 border ${
                    isSelected
                      ? 'bg-gold border-gold text-black font-semibold shadow-[0_2px_12px_rgba(212,175,55,0.3)]'
                      : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:border-gold/30'
                  }`}
                >
                  {brand === 'ALL BRANDS' ? translate('ALL BRANDS', currentLang) : translate(brand, currentLang)}
                </button>
              )
            })}
          </div>
        </div>
      </section>


      {/* Main E-Commerce Catalogue Controls */}
      <section ref={catalogueRef} id="catalogue-browse" className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 scroll-mt-24">

        {/* Mobile Inline Filter Controls - Fast, 1-View Desktop-like Experience */}
        <div className="mb-6 space-y-2.5 rounded-2xl border border-white/10 bg-[#070708]/95 p-3 shadow-2xl backdrop-blur-xl md:hidden">
          {/* Top Row: Search & Reset */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="search"
                aria-label={translate("Search Timepieces", currentLang)}
                placeholder={translate("Search by model, brand, category...", currentLang)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-xs text-white outline-none transition focus:border-gold font-mono placeholder:text-gray-500"
              />
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                aria-label={translate("Reset Filters", currentLang)}
                title={translate("Reset Filters", currentLang)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold transition active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Middle Row: Audience & Sort Selectors */}
          <div className="flex items-center justify-between gap-2">
            {/* Audience Pills */}
            <div className="flex items-center gap-1 bg-white/[0.02] border border-white/10 rounded-xl p-0.5">
              {(['ALL', 'Mens', 'Womens'] as const).map((aud) => {
                const isSelected = selectedAudience === aud;
                return (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => {
                      setSelectedAudience(aud);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                      isSelected
                        ? 'bg-gold text-black font-bold shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {translate(aud === 'ALL' ? 'ALL' : aud === 'Womens' ? 'WOMENS' : 'MENS', currentLang)}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                aria-label={translate("Sort By", currentLang)}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'default' | 'priceAsc' | 'priceDesc')}
                className="rounded-xl border border-white/10 bg-[#151518] px-3 py-1.5 text-[10px] text-gold outline-none focus:border-gold font-mono uppercase tracking-wider"
              >
                <option value="default">{translate("Sort: Default", currentLang)}</option>
                <option value="priceAsc">{translate("Price: Low → High", currentLang)}</option>
                <option value="priceDesc">{translate("Price: High → Low", currentLang)}</option>
              </select>
            </div>
          </div>

          {/* Model Filter Pills (if selected brand has models) */}
          {selectedBrand !== 'ALL BRANDS' && brandModels[selectedBrand] && brandModels[selectedBrand].length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 anim-fade">
              <button
                type="button"
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
                    type="button"
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

        {/* Sticky Filters Panel */}
        <div className="sticky top-20 z-30 mb-8 hidden items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#070708]/90 p-4 shadow-2xl backdrop-blur-md md:flex">
          
          {/* Left search */}
          <div className="relative w-full md:w-80">
            <input 
              type="text"
              placeholder={translate("Search by model, brand, category, or style...", currentLang)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/[0.02] border border-white/10 hover:border-gold/20 focus:border-gold focus:outline-none transition-all duration-300 rounded-xl text-white font-mono"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
          </div>

          {/* Center / Dropdown selectors */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            {/* Brand Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setBrandDropdownOpen(!brandDropdownOpen)
                  setModelDropdownOpen(false)
                  setSortDropdownOpen(false)
                }}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-gold/30 text-xs font-mono flex items-center gap-2 transition-all duration-300"
              >
                <span>{translate("Brand", currentLang)}:</span>
                <span className="text-gold uppercase font-bold">{selectedBrand === 'ALL BRANDS' ? translate('ALL', currentLang) : translate(selectedBrand, currentLang)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {brandDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#0d0d0f] shadow-2xl p-2 z-40 max-h-60 overflow-y-auto custom-scrollbar">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => {
                        setSelectedBrand(brand)
                        setSelectedModel('')
                        setBrandDropdownOpen(false)
                        setPage(1)
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/[0.02] hover:text-gold rounded-lg flex items-center justify-between text-gray-300"
                    >
                      <span>{brand === 'ALL BRANDS' ? translate('ALL BRANDS', currentLang) : translate(brand, currentLang)}</span>
                      {selectedBrand === brand && <Check className="w-3.5 h-3.5 text-gold" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model Dropdown (Contextual) */}
            <div className="relative">
              <button 
                disabled={selectedBrand === 'ALL BRANDS' || !brandModels[selectedBrand]}
                onClick={() => {
                  setModelDropdownOpen(!modelDropdownOpen)
                  setBrandDropdownOpen(false)
                  setSortDropdownOpen(false)
                }}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-gold/30 disabled:opacity-40 disabled:pointer-events-none text-xs font-mono flex items-center gap-2 transition-all duration-300"
              >
                <span>{translate("Model", currentLang)}:</span>
                <span className="text-gold uppercase font-bold">{selectedModel || translate('ALL', currentLang)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {modelDropdownOpen && selectedBrand !== 'ALL BRANDS' && brandModels[selectedBrand] && (
                <div className="absolute left-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#0d0d0f] shadow-2xl p-2 z-40 max-h-60 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => {
                      setSelectedModel('')
                      setModelDropdownOpen(false)
                      setPage(1)
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/[0.02] hover:text-gold rounded-lg flex items-center justify-between text-gray-300"
                  >
                    <span>{translate('ALL', currentLang)}</span>
                    {!selectedModel && <Check className="w-3.5 h-3.5 text-gold" />}
                  </button>
                  {brandModels[selectedBrand].map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model)
                        setModelDropdownOpen(false)
                        setPage(1)
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/[0.02] hover:text-gold rounded-lg flex items-center justify-between text-gray-300"
                    >
                      <span>{model}</span>
                      {selectedModel === model && <Check className="w-3.5 h-3.5 text-gold" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audience/Gender Filters */}
            <div className="flex bg-white/[0.02] border border-white/10 rounded-xl p-0.5">
              {(['ALL', 'Mens', 'Womens'] as const).map((aud) => (
                <button
                  key={aud}
                  onClick={() => {
                    setSelectedAudience(aud)
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all duration-300 ${
                    selectedAudience === aud 
                      ? 'bg-gold/10 text-gold font-bold' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {translate(aud === 'ALL' ? 'ALL' : aud === 'Womens' ? 'WOMENS' : 'MENS', currentLang)}
                </button>
              ))}
            </div>

          </div>

          {/* Right Sorting & Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Price Sort Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setSortDropdownOpen(!sortDropdownOpen)
                  setBrandDropdownOpen(false)
                  setModelDropdownOpen(false)
                }}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-gold/30 text-xs font-mono flex items-center gap-2 transition-all duration-300"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <span>{translate("Sort By", currentLang)}:</span>
                <span className="text-gold font-bold">
                  {sortBy === 'default' && translate('Default', currentLang)}
                  {sortBy === 'priceAsc' && translate("Price: Low to High", currentLang)}
                  {sortBy === 'priceDesc' && translate("Price: High to Low", currentLang)}
                </span>
              </button>

              {sortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0d0d0f] shadow-2xl p-2 z-40">
                  <button
                    onClick={() => {
                      setSortBy('default')
                      setSortDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/[0.02] rounded-lg flex items-center justify-between text-gray-300"
                  >
                    <span>{translate("Default", currentLang)}</span>
                    {sortBy === 'default' && <Check className="w-3.5 h-3.5 text-gold" />}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('priceAsc')
                      setSortDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/[0.02] rounded-lg flex items-center justify-between text-gray-300"
                  >
                    <span>{translate("Price: Low to High", currentLang)}</span>
                    {sortBy === 'priceAsc' && <Check className="w-3.5 h-3.5 text-gold" />}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('priceDesc')
                      setSortDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/[0.02] rounded-lg flex items-center justify-between text-gray-300"
                  >
                    <span>{translate("Price: High to Low", currentLang)}</span>
                    {sortBy === 'priceDesc' && <Check className="w-3.5 h-3.5 text-gold" />}
                  </button>
                </div>
              )}
            </div>

            {/* Clear Button */}
            <button 
              onClick={resetFilters}
              title={translate("Reset Filters", currentLang)}
              className="p-2.5 rounded-xl border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 text-gray-400 hover:text-red-400 transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs font-mono text-gray-400">
            {translate("SHOWING", currentLang)} <span className="text-gold font-bold">{processedWatches.length}</span> {translate("OF", currentLang)} <span className="text-white font-bold">{totalCount}</span> {translate("MASTER TIMEPIECES", currentLang)}
          </p>
          <div className="flex max-w-full items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] text-emerald-400 font-mono sm:text-[10px]">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="leading-relaxed">{translate("SWISS QC STANDARDS GUARANTEED", currentLang)}</span>
          </div>
        </div>

        {/* Watch Grid - Borderless Luxury Style */}
        {processedWatches.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6 lg:gap-8">
            {processedWatches.map((watch) => {
              const isAr = currentLang === 'ar';
              const displayName = isAr && watch.nameAr ? watch.nameAr : watch.name;
              const displayBrand = isAr && watch.brandAr ? watch.brandAr : watch.brand;
              const displayMovement = isAr && watch.movementAr ? watch.movementAr : (watch.movement || "Automatic Swiss Clone");

              return (
                <Link 
                  key={watch.id}
                  to={`/product/${watch.id}`}
                  className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl bg-[#0c0c0e]/80 border border-white/[0.03] hover:border-gold/30 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden"
                >
                  {/* Image Section with hover glow */}
                  <div className="relative aspect-square w-full bg-[#09090b] flex items-center justify-center p-2 sm:p-6 overflow-hidden">
                    {/* Subtle golden radial blur on hover */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <WatchImage 
                      src={watch.image} 
                      alt={displayName} 
                      className="max-h-[90%] max-w-[90%] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-700 ease-out select-none"
                      loading="lazy"
                    />
                    
                    {/* Absolute Badge elements */}
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/80 border border-white/10 text-white/90 font-mono text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md uppercase tracking-wider max-w-[48%] truncate">
                      {displayBrand}
                    </span>

                    {watch.audience && (
                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gold/10 border border-gold/20 text-gold font-mono text-[7px] sm:text-[8px] px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md uppercase font-bold tracking-wider">
                        {translate(watch.audience === 'Ladies' || watch.audience === 'Womens' ? 'WOMENS' : 'MENS', currentLang)}
                      </span>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="p-2.5 sm:p-5 flex-grow flex flex-col justify-between space-y-2 sm:space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-body text-[11px] sm:text-[13px] text-gray-300 group-hover:text-white font-medium line-clamp-2 transition-colors duration-300 tracking-wide leading-snug uppercase">
                        {displayName}
                      </h3>
                      <p className="text-[8px] sm:text-[10px] font-mono text-gray-500 uppercase tracking-wider truncate">
                        {displayMovement}
                      </p>
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-[7px] sm:text-[8px] font-mono text-gray-500 uppercase tracking-widest">{translate("Exclusive Price", currentLang)}</p>
                        <p className="text-xs sm:text-sm font-mono text-gold font-bold">{watch.priceAED}</p>
                      </div>
                      
                      <span className="hidden sm:flex text-[9px] font-mono text-gray-400 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 items-center gap-1">
                        {translate("VIEW SPECS", currentLang)} &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-24 border border-white/5 rounded-2xl bg-white/[0.01] max-w-lg mx-auto">
              <SlidersHorizontal className="w-8 h-8 text-gold mx-auto mb-4 opacity-50" />
              <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">
                {translate("NO WATCHES MATCHING YOUR SEARCH. PLEASE BROWSE ALL BRAND PILLS.", currentLang)}
              </p>
            </div>
          )
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        )}

        {/* Load More Button */}
        {watches.length > 0 && page < totalPages && !loading && (
          <div className="text-center mt-16">
            <button
              onClick={loadMoreWatches}
              className="px-8 py-3 rounded-full text-xs font-mono font-bold tracking-widest text-black bg-gold hover:bg-gold-light transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.2)]"
            >
              {translate("LOAD MORE WATCHES", currentLang)}
            </button>
            <p className="text-[10px] text-gray-500 font-mono mt-3 uppercase tracking-wider">
              {translate("SHOWING", currentLang)} {watches.length} {translate("OF", currentLang)} {totalCount} {translate("HIGH-QUALITY MODELS AVAILABLE", currentLang)}
            </p>
          </div>
        )}

      </section>
    </div>
  )
}
