import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router'
import { X, MessageCircle, Clock, ShieldCheck, ArrowRight, ChevronRight, Crown, Sparkles } from 'lucide-react'
import { translate } from '../utils/translate'
import { getSelectedRep, getWhatsAppUrl, type SalesRep } from '../utils/whatsapp'
import { WatchImage } from './WatchImage'

interface EngagementPopupProps {
  watch?: {
    id: number
    name: string
    brand: string
    image: string
    priceAED: string
    priceUSD: string
  } | null
  salesReps?: SalesRep[]
  footerWhatsAppNumber?: string
}

export function EngagementPopup({
  watch: propWatch,
  salesReps,
  footerWhatsAppNumber = '971501234567',
}: EngagementPopupProps) {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [currentWatch, setCurrentWatch] = useState<any>(propWatch || null)
  const currentLang = localStorage.getItem('t24_lang') || 'en'
  const isRtl = currentLang === 'ar'

  const isProductPage = location.pathname.startsWith('/product/')
  const productId = isProductPage ? location.pathname.split('/')[2] : null

  // Fetch watch details if on product page and propWatch is not provided directly
  useEffect(() => {
    if (propWatch) {
      setCurrentWatch(propWatch)
      return
    }

    if (isProductPage && productId && !isNaN(Number(productId))) {
      fetch(`/api/products/${productId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setCurrentWatch(data)
        })
        .catch(() => {})
    } else {
      setCurrentWatch(null)
    }
  }, [propWatch, isProductPage, productId])

  // 20-Second Global Timer
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return

    const storageKey = isProductPage && productId
      ? `t24_inquiry_popup_dismissed_${productId}`
      : 't24_global_concierge_dismissed'

    const isDismissed = sessionStorage.getItem(storageKey)
    if (isDismissed) return

    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 20000)

    return () => clearTimeout(timer)
  }, [location.pathname, isProductPage, productId])

  const handleClose = () => {
    setIsOpen(false)
    const storageKey = isProductPage && productId
      ? `t24_inquiry_popup_dismissed_${productId}`
      : 't24_global_concierge_dismissed'
    sessionStorage.setItem(storageKey, 'true')
  }

  const handleWhatsAppAction = () => {
    const rep = getSelectedRep(salesReps, footerWhatsAppNumber)
    let message = ''

    if (isProductPage && currentWatch) {
      message = `Hi Dubai Watches Gallery! I am interested in this luxury timepiece: ${currentWatch.name} (${currentWatch.priceAED} / ${currentWatch.priceUSD}). Please provide availability and express delivery details.`
    } else {
      message = `Hi Dubai Watches Gallery! I am browsing your luxury collection and would like assistance to source a 1:1 Super Clone timepiece.`
    }

    const url = getWhatsAppUrl(rep.number, message)
    window.open(url, '_blank')
    handleClose()
  }

  // Keyboard close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl transition-all duration-300 animate-in fade-in"
      onClick={handleClose}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className="relative w-full max-w-[440px] bg-gradient-to-b from-[#0e0e12] via-[#09090c] to-[#050507] border border-[#d4af37]/35 rounded-[32px] p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(212,175,55,0.12)] overflow-hidden scale-100 animate-in zoom-in-95 duration-200 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Background Ambient Radiance */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-[#d4af37]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-[#d4af37]/10 blur-3xl pointer-events-none" />
        
        {/* Luxury Gold Border Highlight on Top */}
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#ebcb7a] to-transparent" />

        {/* Dubai Skyline Background Silhouette (Burj Khalifa & Burj Al Arab) */}
        <div className={`absolute top-0 bottom-0 pointer-events-none select-none opacity-25 sm:opacity-35 z-0 ${isRtl ? 'left-0' : 'right-0'}`}>
          <svg
            className="h-full w-auto max-w-[200px] object-cover"
            viewBox="0 0 200 480"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="skylineGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3d078" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#d4af37" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8a6b18" stopOpacity="0.1" />
              </linearGradient>
              <pattern id="islamicPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M10 0L20 10L10 20L0 10Z" fill="none" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.15" />
              </pattern>
            </defs>

            {/* Subtle luxury geometric background pattern */}
            <rect width="200" height="480" fill="url(#islamicPattern)" />

            {/* Burj Khalifa Silhouette */}
            <path
              d="M135 40 L135 60 L133 90 L136 90 L136 140 L131 160 L138 160 L138 220 L128 250 L142 250 L142 330 L125 360 L148 360 L148 480 L115 480 L115 360 L125 360 L125 250 L130 250 L130 160 L133 160 L133 90 L134 60 L134 40 Z"
              fill="url(#skylineGold)"
            />
            {/* Burj Khalifa Spire / Antenna Tip */}
            <line x1="134.5" y1="15" x2="134.5" y2="40" stroke="#f3d078" strokeWidth="1.5" />
            <circle cx="134.5" cy="15" r="1.5" fill="#f3d078" />

            {/* Burj Al Arab Silhouette */}
            <path
              d="M165 240 C175 280, 185 330, 182 390 L155 390 L155 240 Z"
              fill="url(#skylineGold)"
              opacity="0.9"
            />
            <path
              d="M154 235 L154 390 L150 390 L150 240 Z"
              fill="url(#skylineGold)"
            />
            {/* Helipad */}
            <ellipse cx="178" cy="275" rx="7" ry="2" fill="#f3d078" />

            {/* Dubai Skyline City High-Rise Silhouettes */}
            <rect x="90" y="320" width="18" height="160" fill="url(#skylineGold)" opacity="0.6" />
            <rect x="70" y="350" width="15" height="130" fill="url(#skylineGold)" opacity="0.5" />
            <rect x="45" y="380" width="20" height="100" fill="url(#skylineGold)" opacity="0.4" />
          </svg>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-5 p-2 rounded-full text-gray-400 hover:text-white bg-black/60 hover:bg-[#1a1a22] border border-white/10 hover:border-gold/40 transition-all duration-200 z-30 cursor-pointer shadow-lg hover:scale-105 ${
            isRtl ? 'left-5' : 'right-5'
          }`}
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Centered Brand Monogram & Crown */}
        <div className="relative z-10 flex items-center justify-center mb-5">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#d4af37]/60 to-[#d4af37]" />
            <div className="flex flex-col items-center">
              <Crown className="w-4 h-4 text-[#ebcb7a] mb-0.5" />
              <span className="font-serif text-xs tracking-[0.28em] font-bold text-[#ebcb7a]">
                DWG
              </span>
            </div>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent via-[#d4af37]/60 to-[#d4af37]" />
          </div>
        </div>

        {/* Status Badges */}
        <div className="relative z-10 flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161208]/90 border border-[#d4af37]/40 text-[#ebcb7a] text-[10px] font-mono tracking-widest uppercase font-bold shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Crown className="w-3 h-3 text-[#ebcb7a]" />
            {translate("DUBAI WATCHES GALLERY", currentLang)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            {translate("Online Now", currentLang)}
          </span>
        </div>

        {/* Dynamic Content */}
        <div className="relative z-10">
          {isProductPage && currentWatch ? (
            <div>
              <h3 className="font-serif text-xl sm:text-[22px] text-white font-normal tracking-tight leading-snug mb-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {translate("Interested in this Timepiece?", currentLang)}
              </h3>
              <p className="font-body text-[11px] text-silver/80 leading-relaxed mb-4 font-light drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
                {translate("Our Dubai team is online to share live HD wrist videos, confirm exact weight specifications, and arrange same-day delivery.", currentLang)}
              </p>

              {/* Timepiece Luxury Card */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#0c0c10]/85 border border-[#d4af37]/25 backdrop-blur-md mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                <div className="w-16 h-16 rounded-xl bg-[#050507] border border-white/5 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner">
                  <WatchImage
                    src={currentWatch.image}
                    alt={currentWatch.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-[#ebcb7a] block truncate">
                    {currentWatch.brand || 'SUPER CLONE'}
                  </span>
                  <h4 className="font-serif text-xs text-white font-medium line-clamp-1 mt-0.5">
                    {currentWatch.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-xs font-mono font-bold text-[#ebcb7a]">{currentWatch.priceAED}</span>
                    <span className="text-[10px] font-mono text-gray-400">({currentWatch.priceUSD})</span>
                  </div>
                </div>
              </div>

              {/* Feature Badges (Removed Video, Focus on 1:1 Super Clone & Same-Day Delivery) */}
              <div className="grid grid-cols-2 gap-2 mb-5 text-[10px] font-mono text-gray-300">
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-2 rounded-xl backdrop-blur-sm">
                  <ShieldCheck className="w-4 h-4 text-[#ebcb7a] shrink-0" />
                  <span className="truncate">{translate("1:1 Super Clone", currentLang)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-2 rounded-xl backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{translate("Same-Day Delivery", currentLang)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-serif text-xl sm:text-[22px] text-white font-normal tracking-tight leading-snug mb-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {translate("Looking for a Specific Model?", currentLang)}
              </h3>
              <p className="font-body text-[11px] text-silver/80 leading-relaxed mb-4 font-light drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
                {translate("Whether you're looking for a Daytona, Royal Oak, Nautilus, or Richard Mille, our Dubai team can source and deliver your desired watch today.", currentLang)}
              </p>

              {/* Brand Pills */}
              <div className="p-3.5 rounded-2xl bg-[#0c0c10]/85 border border-[#d4af37]/25 mb-4">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#ebcb7a] font-semibold mb-2">
                  {translate("Instant Sourcing Available", currentLang)}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['Rolex', 'Audemars Piguet', 'Patek Philippe', 'Richard Mille', 'Hublot', 'Vacheron Constantin'].map((brand) => (
                    <span
                      key={brand}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/90 font-mono"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Guarantees */}
              <div className="grid grid-cols-2 gap-2 mb-5 text-[10px] font-mono text-gray-300">
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-2 rounded-xl backdrop-blur-sm">
                  <ShieldCheck className="w-4 h-4 text-[#ebcb7a] shrink-0" />
                  <span className="truncate">{translate("2-Year Warranty", currentLang)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-2 rounded-xl backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{translate("Cash on Delivery", currentLang)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Premium Gold WhatsApp CTA Button */}
          <div className="space-y-3">
            <button
              onClick={handleWhatsAppAction}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[#090704] bg-gradient-to-r from-[#d9a520] via-[#f3d078] to-[#d9a520] hover:from-[#e8c264] hover:via-[#fbe5a2] hover:to-[#e8c264] font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_8px_30px_rgba(217,165,32,0.45),0_0_20px_rgba(243,208,120,0.3)] hover:shadow-[0_12px_40px_rgba(217,165,32,0.65),0_0_30px_rgba(243,208,120,0.5)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group relative overflow-hidden"
            >
              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0">
                <MessageCircle className="w-3.5 h-3.5 fill-[#f3d078] text-black" />
              </div>
              <span className="font-bold tracking-[0.12em]">{translate("Chat on WhatsApp", currentLang)}</span>
              <ArrowRight className={`w-4 h-4 text-black transition-transform duration-300 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </button>

            {/* Subtle Diamond Divider & Dismiss Link */}
            <div className="flex flex-col items-center pt-1">
              <div className="flex items-center justify-center gap-2 mb-1.5 opacity-60">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#ebcb7a]" />
                <Sparkles className="w-2.5 h-2.5 text-[#ebcb7a]" />
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#ebcb7a]" />
              </div>
              
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-1 py-1 text-center text-[11px] font-mono text-gray-400 hover:text-[#ebcb7a] transition-colors duration-150 cursor-pointer group"
              >
                <span>{translate("Continue Browsing", currentLang)}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-gray-500 group-hover:text-[#ebcb7a] transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
