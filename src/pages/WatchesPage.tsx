import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { 
  Crown, 
  SlidersHorizontal, 
  Search, 
  ChevronDown, 
  ArrowUpDown, 
  Check, 
  ShieldCheck, 
  RotateCcw,
  Loader2,
  X
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
  'Cartier',
  'Vacheron Constantin',
  'Omega',
  'IWC',
  'Breitling',
  'Chopard',
  'TAG Heuer'
]

const BRAND_MODELS: Record<string, string[]> = {
  'Rolex': ['Daytona', 'Submariner', 'Datejust', 'GMT-Master', 'Day-Date', 'Yacht-Master', 'Sea-Dweller', 'Sky-Dweller', 'Milgauss', 'Cellini'],
  'Audemars Piguet': ['Royal Oak', 'Royal Oak Offshore', 'Concept'],
  'Patek Philippe': ['Nautilus', 'Aquanaut', 'Complications'],
  'Richard Mille': ['RM 11-03', 'RM 35-02', 'RM 67-02', 'RM 21-02', 'RM 55'],
  'Hublot': ['Big Bang', 'Classic Fusion', 'Spirit of Big Bang'],
  'Cartier': ['Santos', 'Tank', 'Baignoire', 'Panthère'],
  'Vacheron Constantin': ['Patrimony', 'Overseas', 'Historiques']
}

export default function WatchesPage() {
  const currentLang = localStorage.getItem('t24_lang') || 'ar'
  
  // Catalog state
  const [watches, setWatches] = useState<Watch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL BRANDS')
  const [selectedAudience, setSelectedAudience] = useState<'ALL' | 'Womens' | 'Mens'>('ALL')
  const [selectedModel, setSelectedModel] = useState('')
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc'>('default')
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filter Dropdowns visibility
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false)
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)


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
      const lang = localStorage.getItem('t24_lang') || 'ar'
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

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileFiltersOpen])

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
    <div className="bg-[#070708] min-h-screen text-white pt-24 pb-20 selection:bg-gold/30 selection:text-white">
      {/* Dynamic luxury background */}
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gold/5 blur-[150px] rounded-full" />
        <div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/[0.02] blur-[150px] rounded-full" />
      </div>

      {/* Hero section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold text-[10px] tracking-[0.25em] font-mono uppercase">
          <Crown className="w-3.5 h-3.5" />
          {translate("The Master Collection", currentLang)}
        </div>
        <h1 className="font-display text-4xl sm:text-7xl font-extralight tracking-tight leading-none text-white uppercase">
          THE SIGNATURE <br />
          <span className="text-gold font-bold font-display">{translate("CATALOGUE", currentLang)}</span>
        </h1>
        <p className="max-w-2xl mx-auto font-body text-xs sm:text-sm text-silver/70 tracking-widest leading-relaxed">
          {translate("Explore our comprehensive index of 1:1 luxury replica watches. Configured with genuine weights, exact dimensions, and premium materials to ensure zero distinction from local boutiques.", currentLang)}
        </p>

        {/* Brand visual pills row */}
        <div className="flex flex-wrap justify-center gap-2 pt-6 max-w-4xl mx-auto">
          {PRIMARY_BRANDS.slice(0, 7).map((brand) => {
            const isSelected = selectedBrand === brand;
            return (
              <button
                key={brand}
                onClick={() => {
                  setSelectedBrand(brand)
                  setSelectedModel('')
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-mono tracking-widest uppercase transition-all duration-300 border ${
                  isSelected
                    ? 'bg-gold border-gold text-black font-semibold'
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:border-gold/30'
                }`}
              >
                {brand === 'ALL BRANDS' ? translate('ALL BRANDS', currentLang) : brand}
              </button>
            )
          })}
        </div>
      </section>


      {/* Main E-Commerce Catalogue Controls */}
      <section className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Mobile search and filter sheet trigger */}
        <div className="sticky top-20 z-30 mb-6 space-y-3 rounded-2xl border border-white/10 bg-[#070708]/95 p-3 shadow-2xl backdrop-blur-xl md:hidden">
          <div className="relative">
            <input
              type="search"
              aria-label={translate("Search Timepieces", currentLang)}
              placeholder={translate("Search by model, brand, category, or style...", currentLang)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-xs text-white outline-none transition focus:border-gold font-mono"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={mobileFiltersOpen}
              onClick={() => setMobileFiltersOpen(true)}
              className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs font-bold text-gold font-mono"
            >
              <span className="flex min-w-0 items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 shrink-0" />
                <span className="truncate">{translate("Filter by Brand", currentLang)}</span>
              </span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] text-black">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={resetFilters}
              aria-label={translate("Reset Filters", currentLang)}
              title={translate("Reset Filters", currentLang)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:border-red-500/30 hover:text-red-400"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {mobileFiltersOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={translate("Filter by Brand", currentLang)}
            className={`fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm md:hidden ${
              currentLang === 'ar' ? 'justify-start' : 'justify-end'
            }`}
            onClick={() => setMobileFiltersOpen(false)}
          >
            <div
              className="flex h-full w-[min(90vw,360px)] flex-col overflow-hidden border-white/10 bg-[#0d0d0f] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-gold" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                    {translate("Filter by Brand", currentLang)}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
                <label className="block space-y-2">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-gold font-mono">
                    {translate("Brand", currentLang)}
                  </span>
                  <select
                    aria-label={translate("Brand", currentLang)}
                    value={selectedBrand}
                    onChange={(event) => {
                      setSelectedBrand(event.target.value)
                      setSelectedModel('')
                      setPage(1)
                    }}
                    className="w-full rounded-xl border border-white/10 bg-[#151518] px-4 py-3 text-sm text-white outline-none focus:border-gold font-mono"
                  >
                    {PRIMARY_BRANDS.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand === 'ALL BRANDS' ? translate('ALL BRANDS', currentLang) : brand}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-gold font-mono">
                    {translate("Model", currentLang)}
                  </span>
                  <select
                    aria-label={translate("Model", currentLang)}
                    value={selectedModel}
                    disabled={selectedBrand === 'ALL BRANDS' || !BRAND_MODELS[selectedBrand]}
                    onChange={(event) => {
                      setSelectedModel(event.target.value)
                      setPage(1)
                    }}
                    className="w-full rounded-xl border border-white/10 bg-[#151518] px-4 py-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-40 focus:border-gold font-mono"
                  >
                    <option value="">{translate('ALL', currentLang)}</option>
                    {(BRAND_MODELS[selectedBrand] || []).map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </label>

                <div className="space-y-2">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-gold font-mono">
                    {translate("Collection", currentLang)}
                  </span>
                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-1">
                    {(['ALL', 'Mens', 'Womens'] as const).map((audience) => (
                      <button
                        type="button"
                        key={audience}
                        onClick={() => {
                          setSelectedAudience(audience)
                          setPage(1)
                        }}
                        className={`min-w-0 rounded-lg px-2 py-2.5 text-[10px] uppercase transition font-mono ${
                          selectedAudience === audience
                            ? 'bg-gold text-black font-bold'
                            : 'text-gray-400'
                        }`}
                      >
                        {translate(audience === 'ALL' ? 'ALL' : audience === 'Womens' ? 'WOMENS' : 'MENS', currentLang)}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block space-y-2">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-gold font-mono">
                    {translate("Sort By", currentLang)}
                  </span>
                  <select
                    aria-label={translate("Sort By", currentLang)}
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                    className="w-full rounded-xl border border-white/10 bg-[#151518] px-4 py-3 text-sm text-white outline-none focus:border-gold font-mono"
                  >
                    <option value="default">{translate('ALL', currentLang)}</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-white/10 bg-[#0d0d0f] p-4">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 text-gray-400"
                  aria-label={translate("Reset Filters", currentLang)}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-xl bg-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-black font-mono"
                >
                  {translate("View all watches", currentLang)}
                </button>
              </div>
            </div>
          </div>
        )}

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
                <span className="text-gold uppercase font-bold">{selectedBrand === 'ALL BRANDS' ? translate('ALL', currentLang) : selectedBrand}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {brandDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#0d0d0f] shadow-2xl p-2 z-40 max-h-60 overflow-y-auto custom-scrollbar">
                  {PRIMARY_BRANDS.map((brand) => (
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
                      <span>{brand === 'ALL BRANDS' ? translate('ALL BRANDS', currentLang) : brand}</span>
                      {selectedBrand === brand && <Check className="w-3.5 h-3.5 text-gold" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model Dropdown (Contextual) */}
            <div className="relative">
              <button 
                disabled={selectedBrand === 'ALL BRANDS' || !BRAND_MODELS[selectedBrand]}
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

              {modelDropdownOpen && selectedBrand !== 'ALL BRANDS' && BRAND_MODELS[selectedBrand] && (
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
                  {BRAND_MODELS[selectedBrand].map((model) => (
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
                  {sortBy === 'default' && translate('ALL', currentLang)}
                  {sortBy === 'priceAsc' && "Price: Low to High"}
                  {sortBy === 'priceDesc' && "Price: High to Low"}
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
                    <span>Default</span>
                    {sortBy === 'default' && <Check className="w-3.5 h-3.5 text-gold" />}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('priceAsc')
                      setSortDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/[0.02] rounded-lg flex items-center justify-between text-gray-300"
                  >
                    <span>Price: Low to High</span>
                    {sortBy === 'priceAsc' && <Check className="w-3.5 h-3.5 text-gold" />}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('priceDesc')
                      setSortDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/[0.02] rounded-lg flex items-center justify-between text-gray-300"
                  >
                    <span>Price: High to Low</span>
                    {sortBy === 'priceDesc' && <Check className="w-3.5 h-3.5 text-gold" />}
                  </button>
                </div>
              )}
            </div>

            {/* Clear Button */}
            <button 
              onClick={resetFilters}
              title="Reset Filters"
              className="p-2.5 rounded-xl border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 text-gray-400 hover:text-red-400 transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs font-mono text-gray-400">
            SHOWING <span className="text-gold font-bold">{processedWatches.length}</span> OF <span className="text-white font-bold">{totalCount}</span> MASTER TIMEPIECES
          </p>
          <div className="flex max-w-full items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] text-emerald-400 font-mono sm:text-[10px]">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="leading-relaxed">SWISS QC STANDARDS GUARANTEED</span>
          </div>
        </div>

        {/* Watch Grid - Borderless Luxury Style */}
        {processedWatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {processedWatches.map((watch) => {
              const isAr = currentLang === 'ar';
              const displayName = isAr && watch.nameAr ? watch.nameAr : watch.name;
              const displayBrand = isAr && watch.brandAr ? watch.brandAr : watch.brand;
              const displayMovement = isAr && watch.movementAr ? watch.movementAr : (watch.movement || "Automatic Swiss Clone");

              return (
                <Link 
                  key={watch.id}
                  to={`/product/${watch.id}`}
                  className="group relative flex flex-col justify-between rounded-2xl bg-[#0c0c0e]/80 border border-white/[0.03] hover:border-gold/30 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden"
                >
                  {/* Image Section with hover glow */}
                  <div className="relative aspect-square w-full bg-[#09090b] flex items-center justify-center p-6 overflow-hidden">
                    {/* Subtle golden radial blur on hover */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <WatchImage 
                      src={watch.image} 
                      alt={displayName} 
                      className="max-h-[90%] max-w-[90%] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-700 ease-out select-none"
                      loading="lazy"
                    />
                    
                    {/* Absolute Badge elements */}
                    <span className="absolute top-3 left-3 bg-black/80 border border-white/10 text-white/90 font-mono text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {displayBrand}
                    </span>

                    {watch.audience && (
                      <span className="absolute top-3 right-3 bg-gold/10 border border-gold/20 text-gold font-mono text-[8px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">
                        {translate(watch.audience === 'Ladies' || watch.audience === 'Womens' ? 'WOMENS' : 'MENS', currentLang)}
                      </span>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-body text-xs sm:text-[13px] text-gray-300 group-hover:text-white font-medium line-clamp-2 transition-colors duration-300 tracking-wide leading-relaxed uppercase">
                        {displayName}
                      </h3>
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                        {displayMovement}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{translate("Exclusive Price", currentLang)}</p>
                        <p className="text-sm font-mono text-gold font-bold">{watch.priceAED}</p>
                      </div>
                      
                      <span className="text-[9px] font-mono text-gray-400 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 flex items-center gap-1">
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
