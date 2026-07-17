import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import gsap from 'gsap'
import { ArrowLeft, MessageCircle, Check, Compass, Loader2, ShieldCheck } from 'lucide-react'
import { getSelectedRep, getWhatsAppUrl } from '../utils/whatsapp'
import { translate } from '../utils/translate'

interface Watch {
  id: number
  name: string
  brand: string
  priceAED: string
  priceUSD: string
  url: string
  image: string
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
}

interface ProductDetailPageProps {
  salesReps?: any[]
  defaultWhatsAppNumber?: string
}

export default function ProductDetailPage({
  salesReps,
  defaultWhatsAppNumber = '971501234567'
}: ProductDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [watch, setWatch] = useState<Watch | null>(null)
  const [brandSuggestions, setBrandSuggestions] = useState<Watch[]>([])
  const [rangeSuggestions, setRangeSuggestions] = useState<Watch[]>([])
  const [activeTab, setActiveTab] = useState<'details' | 'specs'>('details')
  const [isZoomed, setIsZoomed] = useState(false)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentLang = localStorage.getItem('t24_lang') || 'en'

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
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load watch specifications:', err)
        setLoading(false)
        navigate('/')
      })
  }, [id, navigate])

  // Fetch related products (by Brand and by Range)
  useEffect(() => {
    if (!watch) return

    const lang = localStorage.getItem('t24_lang') || 'en'
    
    // 1. Fetch Suggestions By Brand
    fetch(`/api/products?brand=${encodeURIComponent(watch.brand)}&limit=8&lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.products) {
          const filtered = data.products
            .filter((p: Watch) => p.id !== watch.id)
            .slice(0, 4)
          setBrandSuggestions(filtered)
        }
      })
      .catch((err) => console.error('Failed to fetch brand suggestions:', err))

    // 2. Fetch Suggestions By Range (model variant or category fallback)
    const modelToQuery = watch.model || watch.name.replace(new RegExp(watch.brand, 'i'), '').trim().split(' ')[0]
    fetch(`/api/products?model=${encodeURIComponent(modelToQuery)}&limit=8&lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.products) {
          let filtered = data.products
            .filter((p: Watch) => p.id !== watch.id)
            .slice(0, 4)
          
          if (filtered.length < 3) {
            const aud = watch.audience || 'Mens'
            fetch(`/api/products?audience=${encodeURIComponent(aud)}&limit=12&lang=${lang}`)
              .then((r) => r.json())
              .then((d) => {
                if (d && d.products) {
                  const extra = d.products
                    .filter((p: Watch) => p.id !== watch.id && p.brand !== watch.brand)
                    .slice(0, 4 - filtered.length)
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

  // Format prefilled WhatsApp order text
  const triggerWhatsAppOrder = () => {
    const rep = getSelectedRep(salesReps, defaultWhatsAppNumber)
    const isAr = currentLang === 'ar'
    const messageText = isAr 
      ? `مرحباً T24 Watches! أنا مهتم بشراء هذه الساعة المميزة:\n\n` +
        `⌚ *اسم الساعة:* ${watch.name}\n` +
        `🏷️ *الماركة:* ${watch.brand}\n` +
        `💰 *السعر:* ${watch.priceAED} (${watch.priceUSD})\n` +
        `🔗 *رابط الموقع:* ${watch.url}\n\n` +
        `يرجى تأكيد أوقات الشحن في دول الخليج وخيارات الدفع عند الاستلام السريع. شكراً لك!`
      : `Hello T24 Watches! I am interested in purchasing this premium watch:\n\n` +
        `⌚ *Watch Name:* ${watch.name}\n` +
        `🏷️ *Brand:* ${watch.brand}\n` +
        `💰 *Price:* ${watch.priceAED} (${watch.priceUSD})\n` +
        `🔗 *Original Site Link:* ${watch.url}\n\n` +
        `Please confirm GCC shipping times and express COD payment options. Thank you!`
    const url = getWhatsAppUrl(rep.number, messageText)
    window.open(url, '_blank')
  }

  const caseMaterial = watch.casing || watch.case || '904L High-Tensile Oystersteel'

  return (
    <div ref={containerRef} className="min-h-screen bg-black pt-24 sm:pt-28 pb-20 text-white relative overflow-hidden">
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
          
          {/* LEFT COLUMN: Original Photo Frame */}
          <div className="lg:col-span-6 xl:col-span-5 relative group anim-img">
            <div className="relative rounded-2xl border border-white/5 bg-[#0d0d0f] p-6 xl:p-10 flex items-center justify-center aspect-square overflow-hidden shadow-2xl">
              
              {/* Gold frame corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold/30 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gold/30 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gold/30 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold/30 rounded-br-2xl" />

              {/* Original watch photo overlay */}
              <img 
                src={watch.image} 
                alt={watch.name}
                className={`max-h-[90%] max-w-[90%] object-contain select-none transition-all duration-700 ease-out ${
                  isZoomed ? 'scale-135 cursor-zoom-out' : 'scale-100 cursor-zoom-in group-hover:scale-105'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* Interactive Zoom Label */}
              <div className="absolute bottom-4 text-xs text-gray-500 font-mono select-none pointer-events-none opacity-60">
                {isZoomed ? translate('CLICK IMAGE TO ZOOM OUT', currentLang) : translate('HOVER OR CLICK TO ZOOM', currentLang)}
              </div>

              <div className="absolute top-6 left-6 flex flex-wrap gap-2 z-10">
                <span className="px-3.5 py-1 text-xs font-semibold tracking-wider text-black bg-gold rounded-full font-mono uppercase shadow-lg">
                  {watch.brand}
                </span>
                <span className="px-3.5 py-1 text-xs font-semibold tracking-wider text-white bg-black/60 backdrop-blur-sm border border-white/10 rounded-full font-mono uppercase shadow-lg">
                  {watch.model || watch.name.replace(new RegExp(watch.brand, 'i'), '').trim()}
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Luxury Dossier Sheets */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-8">
            
            {/* Title & Brand */}
            <div className="space-y-3 anim-fade">
              <div className="text-sm font-semibold tracking-widest text-gold font-mono uppercase">
                {watch.brand}
              </div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-white leading-tight">
                {watch.name}
              </h1>
              {/* Visible tags labeled with the watch model name */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/95 font-mono uppercase font-bold">
                  {translate("Model", currentLang)}: {watch.model || watch.name.replace(new RegExp(watch.brand, 'i'), '').trim() || 'Signature'}
                </span>
                <span className="px-3 py-1 bg-gold/15 border border-gold/30 rounded text-xs text-gold font-mono uppercase font-bold">
                  {translate("Master Copy", currentLang)}
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
              <span className="ml-2 px-2.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-black bg-white rounded uppercase">
                {translate("VAT INCLUDED", currentLang)}
              </span>
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
                    {watch.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {watch.features && watch.features.map((feature, idx) => (
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
                      <span className="font-bold text-sm tracking-wide">{watch.warranty ? watch.warranty : translate('2-YEAR SERVICE WARRANTY', currentLang)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 text-sm font-light">
                    {/* 2-Year Service Warranty explicitly at the top of specs grid */}
                    <div className="py-2.5 border-b border-gold/20 md:col-span-2 flex items-center justify-between">
                      <span className="text-gold font-mono uppercase text-[10px] font-bold tracking-wider">{translate("Service Warranty", currentLang)}</span>
                      <span className="font-bold text-gold font-mono text-xs bg-gold/10 border border-gold/30 px-3 py-1 rounded">{translate("2-YEAR SERVICE WARRANTY", currentLang)}</span>
                    </div>

                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Brand", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.brand}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Model", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.model || watch.name.replace(new RegExp(watch.brand, 'i'), '').trim() || 'Signature Series'}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Reference", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.reference || 'Signature Reference'}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Material", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.material || watch.casing || caseMaterial}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Size", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.size || 'Standard Size'}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Movement", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.movement}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Caliber", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.caliber || 'Auto-calibrated Mechanical'}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Bezel Configuration", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.bezel}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Crystal Glass", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.glass}</span>
                    </div>
                    <div className="py-2.5 border-b border-white/5">
                      <span className="block text-gray-500 font-mono uppercase text-[10px] mb-0.5">{translate("Water Testing", currentLang)}</span>
                      <span className="font-semibold text-gray-300 break-words">{watch.waterResistance}</span>
                    </div>
                  </div>
                </div>
              )}
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
            <h2 className="text-2xl font-light tracking-tight text-white mb-10 flex items-center gap-3">
              <Compass className="w-6 h-6 text-gold animate-spin-slow" />
              {translate("Suggestions by Brand", currentLang)}: <span className="text-gold font-mono uppercase">{watch.brand}</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {brandSuggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="group block p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-gold/30 transition-all duration-500 overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  <div className="aspect-square w-full rounded-xl bg-white/[0.01] border border-white/5 p-4 flex items-center justify-center overflow-hidden mb-4 relative">
                    <img 
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
              ))}
            </div>
          </div>
        )}

        {/* SUGGESTIONS BY RANGE */}
        {rangeSuggestions.length > 0 && (
          <div className="mt-20 border-t border-white/5 pt-16">
            <h2 className="text-2xl font-light tracking-tight text-white mb-10 flex items-center gap-3">
              <Compass className="w-6 h-6 text-gold" />
              {translate("Suggestions by Range", currentLang)}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {rangeSuggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="group block p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-gold/30 transition-all duration-500 overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  <div className="aspect-square w-full rounded-xl bg-white/[0.01] border border-white/5 p-4 flex items-center justify-center overflow-hidden mb-4 relative">
                    <img 
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
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
