import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate, Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, MessageCircle, Check, Compass, Loader2, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { getSelectedRep, getWhatsAppUrl } from '../utils/whatsapp'

gsap.registerPlugin(ScrollTrigger)
import { translate } from '../utils/translate'
import { WatchImage } from '../components/WatchImage'
import { ShippingLogosBar } from '../components/ShippingLogos'

interface Watch {
  id: number
  name: string
  brand: string
  priceAED: string
  priceUSD: string
  url: string
  image: string
  thumbnail?: string
  images?: string[]
  factory: string
  movement: string
  casing?: string
  case?: string
  bezel: string
  glass: string
  waterResistance: string
  description: string
  features: string[]
  model?: string
  reference?: string
  material?: string
  size?: string
  caliber?: string
  warranty?: string
  audience?: 'Ladies' | 'Gents' | 'Womens' | 'Mens'
  nameAr?: string
  brandAr?: string
  modelAr?: string
  materialAr?: string
  movementAr?: string
  casingAr?: string
  bezelAr?: string
  glassAr?: string
  waterResistanceAr?: string
  descriptionAr?: string
  featuresAr?: string[]
  warrantyAr?: string
}

interface ProductDetailPageProps {
  salesReps?: any[]
  defaultWhatsAppNumber?: string
}

const SUGGESTION_BRANDS = [
  'Patek Philippe',
  'Audemars Piguet',
  'Rolex',
  'Richard Mille',
] as const

const MIXED_BRANDS = 'MIXED'

export default function ProductDetailPage({
  salesReps,
  defaultWhatsAppNumber = '971501234567'
}: ProductDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [watch, setWatch] = useState<Watch | null>(null)
  const [activeImage, setActiveImage] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>(MIXED_BRANDS)
  const [brandSuggestions, setBrandSuggestions] = useState<Watch[]>([])
  const [rangeSuggestions, setRangeSuggestions] = useState<Watch[]>([])
  const [activeTab, setActiveTab] = useState<'details' | 'specs'>('details')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isHoveringImage, setIsHoveringImage] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentLang = localStorage.getItem('t24_lang') || 'en'

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxOpen])

  // Keyboard navigation for lightbox (Escape to close, arrows to cycle)
  useEffect(() => {
    if (!lightboxOpen || !watch) return
    const imgs = watch.images && watch.images.length > 0 ? watch.images : [watch.image]
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false)
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + imgs.length) % imgs.length)
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % imgs.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, watch])

  // Refresh ScrollTrigger when content finishes loading to ensure footer and other elements animate correctly
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [loading, brandSuggestions, rangeSuggestions])

  const brandContainerRef = useRef<HTMLDivElement>(null)
  const rangeContainerRef = useRef<HTMLDivElement>(null)
  const [isBrandHovered, setIsBrandHovered] = useState(false)
  const [isRangeHovered, setIsRangeHovered] = useState(false)

  const marqueeBrandSlides = [...brandSuggestions, ...brandSuggestions]
  const marqueeRangeSlides = [...rangeSuggestions, ...rangeSuggestions]

  // Continuous linear scrolling for Brand suggestions
  useEffect(() => {
    const container = brandContainerRef.current
    if (!container || brandSuggestions.length === 0) return

    let animationId: number
    const speed = 0.8

    const updateScroll = () => {
      if (!isBrandHovered) {
        container.scrollLeft += speed
        const halfWidth = container.scrollWidth / 2
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft = container.scrollLeft - halfWidth
        }
      }
      animationId = requestAnimationFrame(updateScroll)
    }

    animationId = requestAnimationFrame(updateScroll)
    return () => cancelAnimationFrame(animationId)
  }, [isBrandHovered, brandSuggestions])

  // Continuous linear scrolling for Range suggestions
  useEffect(() => {
    const container = rangeContainerRef.current
    if (!container || rangeSuggestions.length === 0) return

    let animationId: number
    const speed = 0.8

    const updateScroll = () => {
      if (!isRangeHovered) {
        container.scrollLeft += speed
        const halfWidth = container.scrollWidth / 2
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft = container.scrollLeft - halfWidth
        }
      }
      animationId = requestAnimationFrame(updateScroll)
    }

    animationId = requestAnimationFrame(updateScroll)
    return () => cancelAnimationFrame(animationId)
  }, [isRangeHovered, rangeSuggestions])

  const scrollBrandNext = () => {
    const container = brandContainerRef.current
    if (!container) return
    setIsBrandHovered(true)
    container.scrollBy({ left: 300, behavior: 'smooth' })
    setTimeout(() => {
      setIsBrandHovered(false)
    }, 800)
  }

  const scrollBrandPrev = () => {
    const container = brandContainerRef.current
    if (!container) return
    setIsBrandHovered(true)
    if (container.scrollLeft <= 5) {
      container.scrollLeft = container.scrollWidth / 2
    }
    container.scrollBy({ left: -300, behavior: 'smooth' })
    setTimeout(() => {
      setIsBrandHovered(false)
    }, 800)
  }

  const scrollRangeNext = () => {
    const container = rangeContainerRef.current
    if (!container) return
    setIsRangeHovered(true)
    container.scrollBy({ left: 300, behavior: 'smooth' })
    setTimeout(() => {
      setIsRangeHovered(false)
    }, 800)
  }

  const scrollRangePrev = () => {
    const container = rangeContainerRef.current
    if (!container) return
    setIsRangeHovered(true)
    if (container.scrollLeft <= 5) {
      container.scrollLeft = container.scrollWidth / 2
    }
    container.scrollBy({ left: -300, behavior: 'smooth' })
    setTimeout(() => {
      setIsRangeHovered(false)
    }, 800)
  }

  // Fetch watch details from database
  useEffect(() => {
    if (!id) return
    setLoading(true)
    const lang = localStorage.getItem('t24_lang') || 'en'
    fetch(`/api/products/${id}?lang=${lang}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found')
        return res.json()
      })
      .then((data) => {
        setWatch(data)
        setActiveImage(data.image || '')
        setSelectedBrand(MIXED_BRANDS)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load watch specifications:', err)
        setLoading(false)
        navigate('/')
      })
  }, [id, navigate])

  // Fetch the backend-curated brand mix or one selected brand.
  useEffect(() => {
    if (!watch) return
    const lang = localStorage.getItem('t24_lang') || 'en'
    const params = new URLSearchParams({
      productId: String(watch.id),
      brand: selectedBrand,
      limit: '16',
      lang,
    })

    fetch(`/api/products/suggestions?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load brand suggestions')
        return res.json()
      })
      .then((data) => setBrandSuggestions(data.products || []))
      .catch((err) => {
        console.error('Failed to fetch brand suggestions:', err)
        setBrandSuggestions([])
      })
  }, [watch, selectedBrand])

  // Suggestions By Range (model variant or category fallback)
  useEffect(() => {
    if (!watch) return
    const lang = localStorage.getItem('t24_lang') || 'en'
    const modelToQuery = watch.model || watch.name.replace(new RegExp(watch.brand, 'i'), '').trim().split(' ')[0]
    fetch(`/api/products?model=${encodeURIComponent(modelToQuery)}&limit=12&lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.products) {
          let filtered = data.products
            .filter((p: Watch) => p.id !== watch.id)
            .slice(0, 8)
          
          if (filtered.length < 3) {
            const aud = watch.audience || 'Mens'
            fetch(`/api/products?audience=${encodeURIComponent(aud)}&limit=12&lang=${lang}`)
              .then((r) => r.json())
              .then((d) => {
                if (d && d.products) {
                  const extra = d.products
                    .filter((p: Watch) => p.id !== watch.id && p.brand !== watch.brand)
                    .slice(0, 8 - filtered.length)
                  filtered = [...filtered, ...extra]
                  setRangeSuggestions(filtered)
                }
              })
              .catch((err) => console.error('Failed fallback range query:', err))
          } else {
            setRangeSuggestions(filtered)
          }
        }
      })
      .catch((err) => console.error('Failed to fetch range suggestions:', err))
  }, [watch])

  // GSAP Entrance Animations
  useEffect(() => {
    if (!watch || loading) return

    const ctx = gsap.context(() => {
      // Fade in animations
      gsap.fromTo('.anim-fade', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out' }
      )
      
      // Scale-in image
      gsap.fromTo('.anim-img',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'power3.out' }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [watch, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <p className="font-mono text-sm tracking-widest text-silver">{translate("RETRIEVING SPECIFICATIONS...", currentLang)}</p>
        </div>
      </div>
    )
  }

  if (!watch) return null

  const isAr = currentLang === 'ar'
  const displayName = isAr && watch.nameAr ? watch.nameAr : watch.name
  const displayBrand = isAr && watch.brandAr ? watch.brandAr : watch.brand
  const displayModel = isAr && watch.modelAr ? watch.modelAr : (watch.model || watch.name.replace(new RegExp(watch.brand, 'i'), '').trim() || 'Signature Series')
  const caseMaterial = watch.casing || watch.case || '904L High-Tensile Oystersteel'
  const displayMaterial = isAr && watch.materialAr ? watch.materialAr : (watch.material || watch.casing || caseMaterial)
  const displayMovement = isAr && watch.movementAr ? watch.movementAr : watch.movement
  const displayBezel = isAr && watch.bezelAr ? watch.bezelAr : watch.bezel
  const displayGlass = isAr && watch.glassAr ? watch.glassAr : watch.glass
  const displayWater = isAr && watch.waterResistanceAr ? watch.waterResistanceAr : watch.waterResistance
  const displayDescription = isAr && watch.descriptionAr ? watch.descriptionAr : watch.description
  const displayFeatures = isAr && watch.featuresAr && watch.featuresAr.length > 0 ? watch.featuresAr : (watch.features || [])
  const displayWarranty = isAr && watch.warrantyAr ? watch.warrantyAr : (watch.warranty || '2-Year Service Warranty')

  // Format prefilled WhatsApp order text
  const triggerWhatsAppOrder = () => {
    const rep = getSelectedRep(salesReps, defaultWhatsAppNumber)
    const messageText = isAr 
      ? `مرحباً Dubai Watches Gallery! أنا مهتم بشراء هذه الساعة المميزة:\n\n` +
        `⌚ *اسم الساعة:* ${displayName}\n` +
        `🏷️ *الماركة:* ${displayBrand}\n` +
        `💰 *السعر:* ${watch.priceAED} (${watch.priceUSD})\n` +
        `🔗 *رابط الموقع:* ${watch.url}\n\n` +
        `يرجى تأكيد أوقات الشحن في دول الخليج وخيارات الدفع عند الاستلام السريع. شكراً لك!`
      : `Hello Dubai Watches Gallery! I am interested in purchasing this premium watch:\n\n` +
        `⌚ *Watch Name:* ${watch.name}\n` +
        `🏷️ *Brand:* ${watch.brand}\n` +
        `💰 *Price:* ${watch.priceAED} (${watch.priceUSD})\n` +
        `🔗 *Original Site Link:* ${watch.url}\n\n` +
        `Please confirm GCC shipping times and express COD payment options. Thank you!`
    const url = getWhatsAppUrl(rep.number, messageText)
    window.open(url, '_blank')
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black pt-28 sm:pt-32 pb-20 text-white relative overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Back navigation control */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gold transition-colors duration-300 mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" />
          {translate("BACK TO ALL COLLECTIONS", currentLang)}
        </Link>

        {/* Core Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16 items-start">
          
          {/* LEFT COLUMN: Image Viewer */}
          <div className="lg:col-span-6 xl:col-span-5 relative anim-img">

            {/* ── Main Image with Hover Magnifier ── */}
            <div
              ref={imageContainerRef}
              className="relative rounded-2xl border border-white/5 bg-[#0d0d0f] flex items-center justify-center aspect-square overflow-hidden shadow-2xl cursor-zoom-in select-none group"
              onMouseMove={(e) => {
                const rect = imageContainerRef.current?.getBoundingClientRect()
                if (!rect) return
                const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
                const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
                setMousePos({ x, y })
              }}
              onMouseEnter={() => setIsHoveringImage(true)}
              onMouseLeave={() => setIsHoveringImage(false)}
              onClick={() => {
                const imgs = watch.images && watch.images.length > 0 ? watch.images : [watch.image]
                const idx = imgs.indexOf(activeImage || watch.image)
                setLightboxIndex(idx >= 0 ? idx : 0)
                setLightboxOpen(true)
              }}
            >
              {/* Gold corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold/30 rounded-tl-2xl pointer-events-none z-10" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gold/30 rounded-tr-2xl pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gold/30 rounded-bl-2xl pointer-events-none z-10" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold/30 rounded-br-2xl pointer-events-none z-10" />

              {/* Watch image */}
              <WatchImage
                src={activeImage || watch.image}
                alt={watch.name}
                className="max-h-[88%] max-w-[88%] object-contain transition-transform duration-500 ease-out pointer-events-none"
                style={{ transform: isHoveringImage ? 'scale(1.04)' : 'scale(1)' }}
              />

              {/* Magnifier lens — follows cursor */}
              {isHoveringImage && (
                <div
                  className="pointer-events-none absolute z-20 rounded-full border-2 border-gold/70 shadow-[0_0_0_2px_rgba(212,175,55,0.25),0_12px_36px_rgba(0,0,0,0.9)] overflow-hidden"
                  style={{
                    width: 150,
                    height: 150,
                    left: `calc(${mousePos.x}% - 75px)`,
                    top: `calc(${mousePos.y}% - 75px)`,
                    backgroundImage: `url(${activeImage || watch.image})`,
                    backgroundSize: '350%',
                    backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#0d0d0f',
                  }}
                />
              )}

              {/* Brand badges */}
              <div className="absolute top-5 left-5 flex flex-wrap gap-2 z-10 pointer-events-none">
                <span className="px-3 py-1 text-[10px] font-bold tracking-wider text-black bg-gold rounded-full font-mono uppercase shadow-lg">
                  {displayBrand}
                </span>
              </div>

              {/* Hint label */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 pointer-events-none">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest bg-black/85 border border-gold/40 text-gold px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  {isHoveringImage ? (
                    <><span>🔍</span> {translate("Click to expand", currentLang)}</>
                  ) : (
                    <><span>✦</span> {translate("Hover to zoom · Click to expand", currentLang)}</>
                  )}
                </span>
              </div>
            </div>

            {/* ── Gallery Thumbnails ── */}
            {watch.images && watch.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {watch.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImage(img)
                      setLightboxIndex(idx)
                    }}
                    className={`w-20 h-20 rounded-xl border p-2 bg-[#0d0d0f] flex items-center justify-center transition-all duration-300 shrink-0 hover:scale-105 cursor-pointer ${
                      (activeImage || watch.image) === img
                        ? 'border-gold shadow-md shadow-gold/25'
                        : 'border-white/5 hover:border-gold/30'
                    }`}
                  >
                    <WatchImage
                      src={img}
                      alt={`${watch.name} view ${idx + 1}`}
                      className="max-h-full max-w-full object-contain rounded-lg pointer-events-none"
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Luxury Dossier Sheets */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-8">
            
            {/* Title & Brand */}
            <div className="space-y-3 anim-fade">
              <div className="text-sm font-semibold tracking-widest text-gold font-mono uppercase">
                {displayBrand}
              </div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-white leading-tight">
                {displayName}
              </h1>
              {/* Visible tags labeled with the watch model name */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/95 font-mono uppercase font-bold">
                  {translate("Model", currentLang)}: {displayModel}
                </span>
                <span className="px-3 py-1 bg-gold/15 border border-gold/30 rounded text-xs text-gold font-mono uppercase font-bold">
                  {translate("Super Clone", currentLang)}
                </span>
                <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded text-xs text-emerald-400 font-mono uppercase font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)] flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {translate("Same-Day Free Delivery", currentLang)}
                </span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-silver/60 font-mono uppercase">
                  Superclone Dubai
                </span>
              </div>
            </div>

            {/* Price Tags */}
            <div className="flex flex-wrap items-baseline gap-4 py-4 px-6 rounded-2xl bg-gold/5 border border-gold/10 inline-block w-fit anim-fade">
              <span className="text-3xl font-light text-gold tracking-tight">{watch.priceAED}</span>
              <span className="text-sm text-gray-400 font-mono">/ {watch.priceUSD}</span>
            </div>

            {/* Tabs Control */}
            <div className="border-b border-white/10 anim-fade">
              <div className="flex gap-8 text-sm">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-4 tracking-wider uppercase font-mono relative transition-colors duration-300 ${
                    activeTab === 'details' ? 'text-gold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {translate("DOSSIER DESCRIPTION", currentLang)}
                  {activeTab === 'details' && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-4 tracking-wider uppercase font-mono relative transition-colors duration-300 ${
                    activeTab === 'specs' ? 'text-gold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {translate("TECHNICAL SPECIFICATIONS", currentLang)}
                  {activeTab === 'specs' && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold" />
                  )}
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="min-h-[140px] anim-fade">
              {activeTab === 'details' ? (
                <div className="space-y-6">
                  <p className="text-gray-400 leading-relaxed font-light text-base">
                    {displayDescription}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {displayFeatures && displayFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-sm text-gray-300">
                        <Check className="w-4.5 h-4.5 text-gold shrink-0 bg-gold/10 p-0.5 rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Warranty Callout at the top */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gold/10 border border-gold/30 text-gold anim-fade">
                    <ShieldCheck className="w-6 h-6 text-gold shrink-0 animate-pulse" />
                    <div>
                      <span className="block text-[9px] text-[#ebcb7a]/70 font-mono uppercase tracking-widest">{translate("Protection standard", currentLang)}</span>
                      <span className="font-bold text-sm tracking-wide">{displayWarranty}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 text-sm font-light">
                    {/* 2-Year Service Warranty explicitly at the top of specs grid */}
                    <div className="py-2.5 border-b border-gold/20 md:col-span-2 flex items-center justify-between">
                      <span className="text-gold font-mono uppercase text-[10px] font-bold tracking-wider">{translate("Service Warranty", currentLang)}</span>
                      <span className="font-bold text-gold font-mono text-xs bg-gold/10 border border-gold/30 px-3 py-1 rounded">{displayWarranty}</span>
                    </div>

                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Brand", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{displayBrand}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Model", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{displayModel}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Reference", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.reference || 'Signature Reference'}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Material", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{displayMaterial}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Size", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.size || 'Standard Size'}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Movement", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{displayMovement}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Caliber", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.caliber || 'Auto-calibrated Mechanical'}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Bezel Configuration", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{displayBezel}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Crystal Glass", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{displayGlass}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Water Testing", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{displayWater}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Illuminating Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 anim-fade">
              {/* Same Day Delivery */}
              <div className="relative overflow-hidden rounded-xl border border-gold/20 bg-gold/[0.02] p-3 flex flex-col items-center text-center group transition-all duration-300 hover:border-gold/50 hover:bg-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.02)] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-2 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                  {/* Clock with Speed Lines */}
                  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                    <polyline points="12 6 12 12 16 12"/>
                    <line x1="2" y1="12" x2="4" y2="12"/>
                  </svg>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-white font-mono uppercase tracking-wider">{translate("SAME-DAY FREE DELIVERY", currentLang)}</span>
                <span className="text-[8px] sm:text-[9px] text-gold font-mono mt-0.5 uppercase tracking-widest font-semibold">{translate("LOCAL COURIER USP", currentLang)}</span>
              </div>

              {/* Fast Delivery */}
              <div className="relative overflow-hidden rounded-xl border border-gold/20 bg-gold/[0.02] p-3 flex flex-col items-center text-center group transition-all duration-300 hover:border-gold/50 hover:bg-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.02)] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-2 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                  {/* Lightning Bolt */}
                  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-white font-mono uppercase tracking-wider">{translate("FAST GLOBAL SHIPPING", currentLang)}</span>
                <span className="text-[8px] sm:text-[9px] text-gold font-mono mt-0.5 uppercase tracking-widest font-semibold">{translate("DHL, FEDEX & UPS", currentLang)}</span>
              </div>

              {/* Free Shipping */}
              <div className="relative overflow-hidden rounded-xl border border-gold/20 bg-gold/[0.02] p-3 flex flex-col items-center text-center group transition-all duration-300 hover:border-gold/50 hover:bg-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.02)] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-2 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                  {/* Shipping Truck */}
                  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-white font-mono uppercase tracking-wider">{translate("DUTY-FREE GUARANTEE", currentLang)}</span>
                <span className="text-[8px] sm:text-[9px] text-gold font-mono mt-0.5 uppercase tracking-widest font-semibold">{translate("SECURE INSURED PARTNERS", currentLang)}</span>
              </div>
            </div>

            {/* Official Logistics Partners Bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
              <span className="text-[9px] font-mono uppercase tracking-widest text-silver">
                {translate("Official Couriers", currentLang)}:
              </span>
              <ShippingLogosBar />
            </div>

            {/* Direct WhatsApp Call to Action Button */}
            <div className="space-y-4 anim-fade pt-4">
              <button
                onClick={triggerWhatsAppOrder}
                className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-xl text-black bg-[#25D366] hover:bg-[#20ba56] transition-all duration-300 font-semibold tracking-wider shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_25px_rgba(37,211,102,0.4)] group relative overflow-hidden"
              >
                <MessageCircle className="w-6 h-6 fill-black" />
                {translate("ORDER SECURELY VIA WHATSAPP", currentLang)}
                <span className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black animate-ping" />
              </button>
            </div>

          </div>

        </div>

        {/* SUGGESTIONS BY BRAND */}
        {brandSuggestions.length > 0 && (
          <div className="mt-28 border-t border-white/10 pt-20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-light tracking-tight text-white flex items-center gap-3">
                <Compass className="w-6 h-6 text-gold animate-spin-slow shrink-0" />
                <span>
                  {translate("Suggestions by Brand", currentLang)}: <span className="text-gold font-mono uppercase font-bold">
                    {selectedBrand === MIXED_BRANDS
                      ? translate("MIXED BRANDS", currentLang)
                      : selectedBrand}
                  </span>
                </span>
              </h2>
              {/* Navigation Arrows */}
              <div className="flex gap-2 self-end sm:self-auto">
                <button 
                  onClick={scrollBrandPrev}
                  className="w-10 h-10 rounded-full border border-white/10 bg-black/80 hover:bg-gold hover:text-black hover:border-gold flex items-center justify-center transition-all duration-300 z-10 group cursor-pointer"
                  aria-label="Previous Brand Suggestions"
                >
                  <ChevronLeft className="w-5 h-5 text-white group-hover:text-black" />
                </button>
                <button 
                  onClick={scrollBrandNext}
                  className="w-10 h-10 rounded-full border border-white/10 bg-black/80 hover:bg-gold hover:text-black hover:border-gold flex items-center justify-center transition-all duration-300 z-10 group cursor-pointer"
                  aria-label="Next Brand Suggestions"
                >
                  <ChevronRight className="w-5 h-5 text-white group-hover:text-black" />
                </button>
              </div>
            </div>

            {/* Backend-driven mixed and brand-specific suggestion filters */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-3 mb-6 pt-1">
                <button
                  onClick={() => {
                    setSelectedBrand(MIXED_BRANDS)
                    if (brandContainerRef.current) brandContainerRef.current.scrollLeft = 0
                  }}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase transition-all duration-300 cursor-pointer ${
                    selectedBrand === MIXED_BRANDS
                      ? 'bg-gold text-black border border-gold shadow-[0_0_15px_rgba(217,165,32,0.4)] scale-105'
                      : 'bg-white/5 border border-white/10 text-silver/80 hover:text-white hover:border-gold/40 hover:bg-white/10'
                  }`}
                >
                  {translate("MIXED BRANDS", currentLang)}
                </button>

                {SUGGESTION_BRANDS.map((b) => {
                  const isActive = selectedBrand === b
                  return (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBrand(b)
                        if (brandContainerRef.current) brandContainerRef.current.scrollLeft = 0
                      }}
                      className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-gold text-black border border-gold shadow-[0_0_15px_rgba(217,165,32,0.4)] scale-105'
                          : 'bg-white/5 border border-white/10 text-silver/80 hover:text-white hover:border-gold/40 hover:bg-white/10'
                      }`}
                    >
                      {translate(b, currentLang)}
                    </button>
                  )
                })}
            </div>
            
            <div className="relative w-full overflow-hidden">
              <div 
                ref={brandContainerRef}
                onMouseEnter={() => setIsBrandHovered(true)}
                onMouseLeave={() => setIsBrandHovered(false)}
                className="flex flex-row flex-nowrap gap-6 py-2 overflow-x-auto scrollbar-none"
              >
                {marqueeBrandSlides.map((item, idx) => (
                  <div 
                    key={idx}
                    className="shrink-0 w-[240px] p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-gold/30 transition-all duration-500 shadow-lg flex flex-col justify-between group"
                  >
                    <Link to={`/product/${item.id}`} className="block h-full flex flex-col justify-between">
                      <div className="aspect-square w-full rounded-xl bg-white/[0.01] border border-white/5 p-4 flex items-center justify-center overflow-hidden mb-4 relative">
                        <WatchImage 
                          src={item.image} 
                          alt={item.name} 
                          className="max-h-[90%] max-w-[90%] object-contain transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-mono text-black bg-gold rounded font-bold uppercase">
                          {item.brand}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-300 group-hover:text-white line-clamp-2 transition-colors duration-300">
                          {item.name}
                        </h3>
                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-sm font-semibold text-gold font-mono">{item.priceAED}</span>
                          <span className="text-[11px] text-gray-500 font-mono">{item.priceUSD}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUGGESTIONS BY RANGE */}
        {rangeSuggestions.length > 0 && (
          <div className="mt-20 border-t border-white/5 pt-16">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-light tracking-tight text-white flex items-center gap-3">
                <Compass className="w-6 h-6 text-gold" />
                {translate("Suggestions by Range", currentLang)}
              </h2>
              {/* Navigation Arrows */}
              <div className="flex gap-2">
                <button 
                  onClick={scrollRangePrev}
                  className="w-10 h-10 rounded-full border border-white/10 bg-black/80 hover:bg-gold hover:text-black hover:border-gold flex items-center justify-center transition-all duration-300 z-10 group"
                  aria-label="Previous Range Suggestions"
                >
                  <ChevronLeft className="w-5 h-5 text-white group-hover:text-black" />
                </button>
                <button 
                  onClick={scrollRangeNext}
                  className="w-10 h-10 rounded-full border border-white/10 bg-black/80 hover:bg-gold hover:text-black hover:border-gold flex items-center justify-center transition-all duration-300 z-10 group"
                  aria-label="Next Range Suggestions"
                >
                  <ChevronRight className="w-5 h-5 text-white group-hover:text-black" />
                </button>
              </div>
            </div>
            
            <div className="relative w-full overflow-hidden">
              <div 
                ref={rangeContainerRef}
                onMouseEnter={() => setIsRangeHovered(true)}
                onMouseLeave={() => setIsRangeHovered(false)}
                className="flex flex-row flex-nowrap gap-6 py-2 overflow-x-auto scrollbar-none"
              >
                {marqueeRangeSlides.map((item, idx) => (
                  <div 
                    key={idx}
                    className="shrink-0 w-[240px] p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-gold/30 transition-all duration-500 shadow-lg flex flex-col justify-between group"
                  >
                    <Link to={`/product/${item.id}`} className="block h-full flex flex-col justify-between">
                      <div className="aspect-square w-full rounded-xl bg-white/[0.01] border border-white/5 p-4 flex items-center justify-center overflow-hidden mb-4 relative">
                        <WatchImage 
                          src={item.image} 
                          alt={item.name} 
                          className="max-h-[90%] max-w-[90%] object-contain transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-mono text-black bg-gold rounded font-bold uppercase">
                          {item.brand}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-300 group-hover:text-white line-clamp-2 transition-colors duration-300">
                          {item.name}
                        </h3>
                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-sm font-semibold text-gold font-mono">{item.priceAED}</span>
                          <span className="text-[11px] text-gray-500 font-mono">{item.priceUSD}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── FULLSCREEN LIGHTBOX (Rendered in Portal to prevent CSS transform trap) ── */}
      {lightboxOpen && createPortal(
        (() => {
          const imgs = watch.images && watch.images.length > 0 ? watch.images : [watch.image]
          const current = imgs[lightboxIndex] || watch.image
          return (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={watch.name}
              className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 select-none w-screen h-screen"
              onClick={() => setLightboxOpen(false)}
            >
              {/* Close button */}
              <button
                type="button"
                aria-label="Close"
                className="absolute top-6 right-6 w-12 h-12 rounded-full border border-white/20 bg-black/70 hover:bg-gold hover:text-black flex items-center justify-center text-white text-2xl transition-all duration-200 z-50 cursor-pointer shadow-xl hover:scale-105"
                onClick={() => setLightboxOpen(false)}
              >
                ✕
              </button>

              {/* Prev arrow */}
              {imgs.length > 1 && (
                <button
                  type="button"
                  aria-label="Previous image"
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 bg-black/70 hover:bg-gold hover:border-gold flex items-center justify-center text-white hover:text-black transition-all duration-200 z-50 cursor-pointer shadow-xl hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex((lightboxIndex - 1 + imgs.length) % imgs.length)
                  }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Main lightbox image container */}
              <div
                className="w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center relative z-20 pointer-events-none"
              >
                <WatchImage
                  src={current}
                  alt={watch.name}
                  className="max-w-full max-h-[80vh] w-auto h-auto object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] pointer-events-auto rounded-xl animate-[fadeInScale_0.2s_ease-out]"
                />
              </div>

              {/* Next arrow */}
              {imgs.length > 1 && (
                <button
                  type="button"
                  aria-label="Next image"
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 bg-black/70 hover:bg-gold hover:border-gold flex items-center justify-center text-white hover:text-black transition-all duration-200 z-50 cursor-pointer shadow-xl hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex((lightboxIndex + 1) % imgs.length)
                  }}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Dot indicators & Counter */}
              {imgs.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50 bg-black/80 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm shadow-xl">
                  {imgs.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`View image ${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setLightboxIndex(i)
                      }}
                      className={`transition-all duration-200 rounded-full cursor-pointer ${
                        i === lightboxIndex
                          ? 'bg-gold w-6 h-2.5 shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                          : 'bg-white/40 hover:bg-white/80 w-2.5 h-2.5'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-mono text-gray-300 ml-2 border-l border-white/20 pl-3">
                    {lightboxIndex + 1} / {imgs.length}
                  </span>
                </div>
              )}
            </div>
          )
        })(),
        document.body
      )}

    </div>
  )
}
