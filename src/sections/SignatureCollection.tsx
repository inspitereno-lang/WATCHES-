import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Search, Compass, Loader2, SlidersHorizontal, X, Check, ChevronDown, ChevronUp } from 'lucide-react'
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
  catalogueEyebrow = 'CURATED WATCH DIRECTORY',
  catalogueHeading1 = 'THE SIGNATURE',
  catalogueHeading2 = 'CATALOGUE',
  catalogueDescription = 'Refined timepieces selected for balanced weight, smooth movement, and daily-wear precision.',
  activeAudienceFilter,
  onAudienceFilterChange,
}: SignatureCollectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL BRANDS')
  const [selectedAudienceState, setSelectedAudienceState] = useState<AudienceFilter>('ALL')
  const [selectedModel, setSelectedModel] = useState('')
  const [showMoreBrands, setShowMoreBrands] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [brandModels, setBrandModels] = useState<Record<string, string[]>>(BRAND_MODELS)

  const currentLang = localStorage.getItem('t24_lang') || 'en'
  const isRtl = currentLang === 'ar'

  const eyebrow = translate(catalogueEyebrow, currentLang)
  const heading1 = translate(catalogueHeading1, currentLang)
  const heading2 = translate(catalogueHeading2, currentLang)
  const description = translate(catalogueDescription, currentLang)

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

  useEffect(() => {
    if (!mobileFiltersOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileFiltersOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [mobileFiltersOpen])

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
        <div className="text-center mb-12 lg:mb-20">
          <p className="sig-label font-body text-xs tracking-[0.3em] text-gold mb-4 uppercase">
            {eyebrow}
          </p>
          <h2 className="sig-heading font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] font-light">
            {heading1}
            <br />
            <span className="text-gold font-bold">{heading2}</span>
          </h2>
          <p className="sig-sub font-body text-xs text-silver mt-6 tracking-widest max-w-lg mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Mobile Filters Toggle Button */}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={mobileFiltersOpen}
          onClick={() => setMobileFiltersOpen(true)}
          className="mb-6 flex w-full items-center justify-between rounded-xl border border-gold/20 bg-white/[0.03] p-4 text-start shadow-lg transition hover:border-gold/40 lg:hidden"
        >
          <span className="flex min-w-0 items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-gold" />
            <span className="truncate text-xs font-mono text-white uppercase tracking-wider">
              {translate("Filter by Brand", currentLang)}
            </span>
          </span>
          <span className="shrink-0 rounded-lg bg-gold px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-black font-mono">
            {translate("ALL", currentLang)}
          </span>
        </button>

        {/* Catalog Container Layout: Sidebar + Grid */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] gap-10 items-start max-w-7xl mx-auto">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-full bg-[#0d0d0f]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6 space-y-8 sticky top-28 z-20">
            {renderFiltersContent()}
          </aside>

          {/* Mobile Sidebar Overlay Drawer */}
          {mobileFiltersOpen && createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={translate("Filter by Brand", currentLang)}
              className={`fixed inset-0 flex bg-black/85 backdrop-blur-sm lg:hidden ${
                isRtl ? 'justify-start' : 'justify-end'
              }`}
              style={{ zIndex: 9999 }}
              onClick={() => setMobileFiltersOpen(false)}
            >
              <div
                dir={isRtl ? 'rtl' : 'ltr'}
                className={`flex h-[100dvh] w-full max-w-[420px] flex-col overflow-hidden bg-[#0d0d0f] shadow-2xl ${
                  isRtl ? 'border-r' : 'border-l'
                } border-white/10`}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0d0d0f]/95 px-5 py-4 backdrop-blur-xl">
                  <span className="flex items-center gap-2 text-sm font-mono text-white uppercase tracking-wider">
                    <SlidersHorizontal className="h-4 w-4 text-gold" />
                    {translate("Filter by Brand", currentLang)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-400 transition hover:border-gold/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6">
                  <div className="mx-auto w-full max-w-md">
                    {renderFiltersContent()}
                  </div>
                </div>

                <div className="shrink-0 border-t border-white/10 bg-[#0d0d0f]/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full rounded-xl bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-black font-mono transition hover:bg-gold-light"
                  >
                    {translate("View all watches", currentLang)}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Watch Cards Grid Container */}
          <div className="flex-1 space-y-8">
            {watches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
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
                      <div className="relative bg-[#0d0d0f]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:border-gold/30 shadow-2xl flex flex-col justify-between h-full">

                        {/* Watch Image Aspect Box */}
                        <div className="aspect-square overflow-hidden bg-[#0d0d0f] relative flex items-center justify-center p-6 xl:p-10">
                          <WatchImage
                            src={watch.image}
                            alt={displayName}
                            loading="lazy"
                            className="max-h-[95%] max-w-[95%] object-contain transition-transform duration-700 group-hover:scale-105 select-none"
                          />

                          <span className="absolute top-4 left-4 bg-black/85 backdrop-blur-md border border-gold/30 text-gold font-body text-[9px] font-bold tracking-[0.1em] px-2.5 py-1 rounded-full uppercase shadow-md font-mono">
                            {translate(getAudienceLabel(watch) === 'Womens' ? 'WOMENS' : 'MENS', currentLang)}
                          </span>

                          <span className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border border-white/10 text-white/70 font-body text-[8px] font-bold tracking-[0.1em] px-2.5 py-1 rounded-full uppercase shadow-md font-mono">
                            {displayBrand}
                          </span>

                          {/* Stock indicator badge */}
                          <span className="absolute bottom-4 right-4 text-[8px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                            {translate("IN STOCK", currentLang)}
                          </span>
                        </div>

                        {/* Info Section */}
                        <div className="p-6 flex flex-col justify-between flex-grow">
                          <div>
                            <p className="font-body text-[9px] tracking-[0.2em] text-gold mb-1.5 uppercase font-semibold font-mono">
                              {translate("SIGNATURE TIMEPIECE", currentLang)}
                            </p>
                            <h3 className="font-body text-base font-light tracking-wide text-white group-hover:text-gold transition-colors duration-300 line-clamp-2">
                              {displayName}
                            </h3>
                            {/* Visible Model name tag */}
                            <span className="inline-block mt-2 px-2 py-0.5 text-[8px] font-mono text-white/50 border border-white/10 rounded uppercase">
                              {displayModel}
                            </span>
                          </div>

                        <div className="mt-6 pt-4 border-t border-white/5">
                          <p className={`font-body text-[9px] tracking-wider text-silver/40 uppercase font-mono ${isRtl ? 'text-right' : 'text-left'}`}>
                            {translate("Exclusive Price", currentLang)}
                          </p>
                          <div
                            dir="ltr"
                            className={`mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 ${isRtl ? 'justify-end' : 'justify-start'}`}
                          >
                            <span className="font-body text-base text-gold font-bold font-mono whitespace-nowrap">
                              {watch.priceAED}
                            </span>
                            <span className="font-body text-[11px] text-silver/50 font-light font-mono whitespace-nowrap">
                              ({watch.priceUSD})
                            </span>
                          </div>
                          <span className={`mt-4 block font-body text-[10px] tracking-[0.15em] text-gold group-hover:underline font-mono uppercase whitespace-nowrap ${isRtl ? 'text-right' : 'text-left'}`}>
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
    </section>
  )
}
