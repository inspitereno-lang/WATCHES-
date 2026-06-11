import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import gsap from 'gsap'
import { ArrowLeft, MessageCircle, Check, Layers, Gauge, Compass, Loader2 } from 'lucide-react'

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
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [watch, setWatch] = useState<Watch | null>(null)
  const [relatedWatches, setRelatedWatches] = useState<Watch[]>([])
  const [activeTab, setActiveTab] = useState<'details' | 'specs'>('details')
  const [isZoomed, setIsZoomed] = useState(false)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch watch details from database
  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/products/${id}`)
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

  // Fetch related products of the same brand
  useEffect(() => {
    if (!watch) return

    fetch(`/api/products?brand=${encodeURIComponent(watch.brand)}&limit=5`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.products) {
          // Exclude the current watch and take top 4
          const filtered = data.products
            .filter((p: Watch) => p.id !== watch.id)
            .slice(0, 4)
          setRelatedWatches(filtered)
        }
      })
      .catch((err) => console.error('Failed to fetch related watches:', err))
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
          <p className="font-mono text-sm tracking-widest text-silver">RETRIEVING SPECIFICATIONS...</p>
        </div>
      </div>
    )
  }

  if (!watch) return null

  // Format prefilled WhatsApp order text
  const triggerWhatsAppOrder = () => {
    const defaultNumber = '971501234567' // Standard Dubai concierge hotline
    const message = encodeURIComponent(
      `Hello T24 Watches! I am interested in purchasing this premium 1:1 Swiss Clone watch:\n\n` +
      `⌚ *Watch Name:* ${watch.name}\n` +
      `🏭 *Factory Spec:* ${watch.factory}\n` +
      `💰 *Price:* ${watch.priceAED} (${watch.priceUSD})\n` +
      `🔗 *Original Site Link:* ${watch.url}\n\n` +
      `Please confirm GCC shipping times and express COD payment options. Thank you!`
    )
    window.open(`https://wa.me/${defaultNumber}?text=${message}`, '_blank')
  }

  const caseMaterial = watch.casing || watch.case || '904L High-Tensile Oystersteel'

  return (
    <div ref={containerRef} className="min-h-screen bg-[#070708] pt-28 pb-20 text-white relative overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Back navigation control */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gold transition-colors duration-300 mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" />
          BACK TO ALL COLLECTIONS
        </Link>

        {/* Core Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">
          
          {/* LEFT COLUMN: Original Photo Frame */}
          <div className="lg:col-span-6 xl:col-span-5 relative group anim-img">
            <div className="relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 xl:p-10 flex items-center justify-center aspect-square overflow-hidden shadow-2xl">
              
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
                {isZoomed ? 'CLICK IMAGE TO ZOOM OUT' : 'HOVER OR CLICK TO ZOOM'}
              </div>

              {/* Top corner factory tag */}
              <span className="absolute top-6 left-6 px-3.5 py-1 text-xs font-semibold tracking-wider text-black bg-gold rounded-full font-mono uppercase shadow-lg">
                {watch.factory}
              </span>
            </div>

            {/* Micro spec bullet list */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex items-center gap-3">
                <Gauge className="w-5 h-5 text-gold shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-500 font-mono tracking-wider">MOVEMENT</div>
                  <div className="text-xs font-semibold truncate text-gray-300">Swiss Clone</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex items-center gap-3">
                <Layers className="w-5 h-5 text-gold shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-500 font-mono tracking-wider">STEEL GRADE</div>
                  <div className="text-xs font-semibold truncate text-gray-300">904L Oystersteel</div>
                </div>
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
            </div>

            {/* Price Tags */}
            <div className="flex flex-wrap items-baseline gap-4 py-4 px-6 rounded-2xl bg-gold/5 border border-gold/10 inline-block w-fit anim-fade">
              <span className="text-3xl font-light text-gold tracking-tight">{watch.priceAED}</span>
              <span className="text-sm text-gray-400 font-mono">/ {watch.priceUSD}</span>
              <span className="ml-2 px-2.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-black bg-white rounded uppercase">
                VAT INCLUDED
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
                  Dossier Description
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
                  Technical Specifications
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
                  
                  {/* Replica features checklists */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm font-light">
                  <div className="py-2 border-b border-white/5 flex justify-between">
                    <span className="text-gray-500 font-mono uppercase text-[11px]">Factory Build</span>
                    <span className="font-semibold text-gray-300">{watch.factory}</span>
                  </div>
                  <div className="py-2 border-b border-white/5 flex justify-between">
                    <span className="text-gray-500 font-mono uppercase text-[11px]">Clone Movement</span>
                    <span className="font-semibold text-gray-300 truncate max-w-[180px]">{watch.movement}</span>
                  </div>
                  <div className="py-2 border-b border-white/5 flex justify-between">
                    <span className="text-gray-500 font-mono uppercase text-[11px]">Casing Material</span>
                    <span className="font-semibold text-gray-300">{caseMaterial}</span>
                  </div>
                  <div className="py-2 border-b border-white/5 flex justify-between">
                    <span className="text-gray-500 font-mono uppercase text-[11px]">Bezel Configuration</span>
                    <span className="font-semibold text-gray-300 truncate max-w-[180px]">{watch.bezel}</span>
                  </div>
                  <div className="py-2 border-b border-white/5 flex justify-between">
                    <span className="text-gray-500 font-mono uppercase text-[11px]">Crystal Glass</span>
                    <span className="font-semibold text-gray-300 truncate max-w-[180px]">{watch.glass}</span>
                  </div>
                  <div className="py-2 border-b border-white/5 flex justify-between">
                    <span className="text-gray-500 font-mono uppercase text-[11px]">Water Testing</span>
                    <span className="font-semibold text-gray-300">{watch.waterResistance}</span>
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
                ORDER SECURELY VIA WHATSAPP
                <span className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black animate-ping" />
              </button>
            </div>

          </div>

        </div>

        {/* RELATED PRODUCTS */}
        {relatedWatches.length > 0 && (
          <div className="mt-28 border-t border-white/10 pt-20">
            <h2 className="text-2xl font-light tracking-tight text-white mb-10 flex items-center gap-3">
              <Compass className="w-6 h-6 text-gold" />
              EXPLORE MORE FROM <span className="text-gold font-mono uppercase">{watch.brand}</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedWatches.map((item) => (
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
                      {item.factory}
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
