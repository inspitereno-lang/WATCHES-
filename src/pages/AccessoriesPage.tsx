import { useState, useEffect } from 'react'
import { MessageCircle, ShieldCheck, ArrowRight } from 'lucide-react'
import { translate } from '../utils/translate'
import { getSelectedRep, getWhatsAppUrl, type SalesRep } from '../utils/whatsapp'

interface Accessory {
  id: number
  name: string
  category: 'Straps' | 'Boxes' | 'Accessories'
  brandCompatibility: string
  priceAED: string
  priceUSD: string
  image: string
  images?: string[]
  material?: string
  description?: string
  inStock: boolean
  isVisible: boolean
}

interface AccessoriesPageProps {
  salesReps?: SalesRep[]
  defaultWhatsAppNumber?: string
}

const CATEGORIES = ['ALL', 'Straps', 'Boxes'] as const
type CategoryFilter = typeof CATEGORIES[number]

function AllIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function StrapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="10" height="7" rx="1.5" />
      <line x1="12" y1="4.5" x2="12" y2="4.51" strokeWidth="2.5" />
      <line x1="12" y1="7" x2="12" y2="7.01" strokeWidth="2.5" />
      <rect x="5.5" y="9.5" width="13" height="5" rx="2" strokeWidth="2" />
      <rect x="7" y="15" width="10" height="7" rx="1.5" />
      <line x1="12" y1="17.5" x2="12" y2="17.51" strokeWidth="2.5" />
      <line x1="12" y1="20" x2="12" y2="20.01" strokeWidth="2.5" />
    </svg>
  )
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11H20V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V11Z" />
      <path d="M3 11L7 3H17L21 11" />
      <rect x="10.5" y="9.5" width="3" height="3" rx="0.5" fill="currentColor" />
    </svg>
  )
}

export default function AccessoriesPage({
  salesReps,
  defaultWhatsAppNumber = '971501234567',
}: AccessoriesPageProps) {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const currentLang = localStorage.getItem('t24_lang') || 'en'
  const isRtl = currentLang === 'ar'

  useEffect(() => {
    setLoading(true)
    const url = selectedCategory === 'ALL'
      ? '/api/accessories'
      : `/api/accessories?category=${encodeURIComponent(selectedCategory)}`

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.accessories) {
          setAccessories(data.accessories.filter((a: any) => a.category !== 'Winders'))
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load accessories:', err)
        setLoading(false)
      })
  }, [selectedCategory])

  const handleWhatsAppOrder = (item: Accessory) => {
    const rep = getSelectedRep(salesReps, defaultWhatsAppNumber)
    const message = isRtl
      ? `مرحباً Dubai Watches Gallery! أنا مهتم بطلب هذا الملحق:\n\n` +
        `📦 *المنتج:* ${item.name}\n` +
        `🏷️ *الفئة:* ${item.category}\n` +
        `💰 *السعر:* ${item.priceAED} (${item.priceUSD})\n\n` +
        `يرجى تأكيد التوافر والتوصيل السريع.`
      : `Hello Dubai Watches Gallery! I am interested in purchasing this watch accessory:\n\n` +
        `📦 *Item:* ${item.name}\n` +
        `🏷️ *Category:* ${item.category}\n` +
        `💰 *Price:* ${item.priceAED} (${item.priceUSD})\n\n` +
        `Please confirm express delivery details.`

    const url = getWhatsAppUrl(rep.number, message)
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#070605] pt-28 pb-24 text-white relative isolate overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#d4af37]/5 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header Title Section - Simplified Clear Words */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#ebcb7a] text-xs font-mono tracking-widest uppercase font-bold mb-4 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <span>{translate("WATCH ACCESSORIES", currentLang)}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-light tracking-tight mb-4">
            {translate("STRAPS & LUXURY", currentLang)}{' '}
            <span className="bg-gradient-to-r from-[#d9a520] via-[#f3d078] to-[#d9a520] bg-clip-text text-transparent font-bold">
              {translate("BOXES", currentLang)}
            </span>
          </h1>

          <p className="font-body text-xs sm:text-sm text-silver/80 leading-relaxed max-w-xl mx-auto">
            {translate(
              "Complete your collection with premium replacement straps and authentic luxury watch presentation boxes.",
              currentLang
            )}
          </p>
        </div>

        {/* Category Selector Tabs with Custom Accurate SVGs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-12">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#d9a520] via-[#f3d078] to-[#d9a520] text-black border border-[#d4af37] shadow-[0_0_20px_rgba(217,165,32,0.4)] scale-105'
                    : 'bg-white/[0.03] border border-white/10 text-silver hover:text-white hover:border-[#d4af37]/40 hover:bg-white/5'
                }`}
              >
                {cat === 'ALL' && <AllIcon className="w-3.5 h-3.5" />}
                {cat === 'Straps' && <StrapIcon className="w-3.5 h-3.5" />}
                {cat === 'Boxes' && <BoxIcon className="w-3.5 h-3.5" />}
                <span>{translate(cat === 'ALL' ? 'ALL ACCESSORIES' : cat, currentLang)}</span>
              </button>
            )
          })}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : accessories.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl p-8">
            <p className="text-sm font-mono text-gray-400 uppercase tracking-widest">
              {translate("No accessories found in this category.", currentLang)}
            </p>
          </div>
        ) : (
          /* Accessories Grid with Authentic HD Images */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
            {accessories.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-[#111116] to-[#070709] p-5 shadow-xl hover:border-[#d4af37]/40 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.15)] transition-all duration-500 overflow-hidden"
              >
                {/* Visual Top Glow */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent group-hover:via-[#d4af37] transition-all duration-500" />

                <div>
                  {/* Image Container with deep black padding and subtle bezel */}
                  <div className="relative aspect-square w-full rounded-2xl bg-[#050507] border border-white/5 p-2 flex items-center justify-center overflow-hidden mb-4 shadow-inner">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-full max-w-full object-cover rounded-xl filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)] transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {/* Category & Compatibility Badges */}
                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-1 z-10">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-[#d4af37] text-black shadow-md">
                        {translate(item.category, currentLang)}
                      </span>
                    </div>

                    {item.brandCompatibility && item.brandCompatibility !== 'Universal' && (
                      <span className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider bg-black/80 backdrop-blur-sm border border-white/15 text-[#ebcb7a] uppercase z-10">
                        {item.brandCompatibility}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2 mb-4">
                    <h3 className="font-serif text-sm sm:text-base font-normal text-white group-hover:text-[#ebcb7a] line-clamp-2 transition-colors duration-300">
                      {item.name}
                    </h3>
                    {item.material && (
                      <p className="text-[11px] font-mono text-silver/70 line-clamp-1">
                        {translate("Material", currentLang)}: <span className="text-gray-300">{item.material}</span>
                      </p>
                    )}
                    {item.description && (
                      <p className="text-xs font-body text-silver/60 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price & Order Action */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-bold font-mono text-[#ebcb7a] block">
                        {item.priceAED}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">
                        {item.priceUSD}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {translate("In Stock", currentLang)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleWhatsAppOrder(item)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-[#d9a520] hover:via-[#f3d078] hover:to-[#d9a520] border border-white/10 hover:border-[#d4af37] text-silver hover:text-black font-mono text-[11px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm group/btn"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{translate("ORDER VIA WHATSAPP", currentLang)}</span>
                    <ArrowRight className={`w-3 h-3 transition-transform ${isRtl ? 'rotate-180 group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
