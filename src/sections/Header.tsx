import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router'
import { translate } from '../utils/translate'
import { getSelectedRep, getWhatsAppUrl, type SalesRep } from '../utils/whatsapp'

const navLinks: Array<{ label: string; path?: string; sectionId?: string }> = [
  { label: 'HOME', path: '/' },
  { label: 'COLLECTIONS', path: '/collections' },
  { label: 'WATCHES', path: '/watches' },
  { label: 'ACCESSORIES', path: '/accessories' },
  { label: 'BLOG', path: '/blog' },
]

interface HeaderProps {
  salesReps?: SalesRep[]
  defaultWhatsAppNumber?: string
  defaultWhatsAppMessage?: string
}

export default function Header({
  salesReps,
  defaultWhatsAppNumber = '971501234567',
  defaultWhatsAppMessage = "Hi Dubai Watches Gallery! I'm visiting your website and would like to inquire about your premium collection."
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('t24_lang') || 'en')
  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null)

  const isLinkActive = (link: (typeof navLinks)[number]) => {
    if (link.path === '/') {
      return location.pathname === '/'
    }
    return link.path && (location.pathname === link.path || location.pathname.startsWith(`${link.path}/`))
  }

  useEffect(() => {
    setSelectedRep(getSelectedRep(salesReps, defaultWhatsAppNumber))
  }, [salesReps, defaultWhatsAppNumber])

  useEffect(() => {
    const lang = localStorage.getItem('t24_lang') || 'en'
    setCurrentLang(lang)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [])

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'ar' : 'en'
    localStorage.setItem('t24_lang', nextLang)
    document.documentElement.classList.add('language-leaving')
    window.setTimeout(() => window.location.reload(), 160)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleNavClick = (e: React.MouseEvent, link: (typeof navLinks)[number]) => {
    e.preventDefault()

    if (link.path) {
      navigate(link.path)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (link.sectionId) {
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => scrollToSection(link.sectionId!), 400)
      } else {
        scrollToSection(link.sectionId)
      }
    }
  }

  const handleWhatsAppChat = () => {
    const rep = selectedRep || getSelectedRep(salesReps, defaultWhatsAppNumber)
    const url = getWhatsAppUrl(rep.number, defaultWhatsAppMessage)
    window.open(url, '_blank')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'sm:bg-black/95 sm:backdrop-blur-md sm:border-b sm:border-white/10 sm:shadow-2xl'
          : 'sm:bg-transparent sm:border-transparent'
      }`}
    >
      {/* Top Row: Logo, Language, WhatsApp */}
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-14 sm:h-20">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            aria-label="Dubai Watches Gallery home"
            className="group flex h-full items-center"
          >
            <img
              src="/dubai-watches-gallery-logo.png"
              alt="Dubai Watches Gallery"
              className="h-9 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.path || `/#${link.sectionId}`}
                onClick={(e) => handleNavClick(e, link)}
                className={`nav-link font-body text-[10px] tracking-[0.14em] transition-colors duration-300 ${
                  isLinkActive(link)
                    ? 'text-gold font-bold'
                    : 'text-silver hover:text-white'
                }`}
              >
                {translate(link.label, currentLang)}
              </a>
            ))}
          </nav>

          {/* Utility Icons */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-white/10 hover:border-gold/30 bg-white/5 hover:bg-white/10 transition-all duration-300 font-mono text-[9px] sm:text-[10px] text-white tracking-wider uppercase font-bold cursor-pointer shadow-sm"
              aria-label="Change Language"
            >
              <span className={currentLang === 'en' ? 'text-gold font-bold' : 'text-gray-400 hover:text-white'}>ENGLISH</span>
              <span className="text-gray-600">/</span>
              <span className={currentLang === 'ar' ? 'text-gold font-bold' : 'text-gray-400 hover:text-white'}>العربية</span>
            </button>

            {/* WhatsApp Concierge Button */}
            <button
              onClick={handleWhatsAppChat}
              className={`hidden sm:flex items-center gap-2 px-4 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 border ${
                selectedRep?.isFeatured 
                  ? 'border-gold/50 text-gold hover:border-gold hover:bg-gold/20' 
                  : 'border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white'
              } rounded-full transition-all duration-300 font-body text-[10px] tracking-wider`}
            >
              <MessageCircle size={14} className={selectedRep?.isFeatured ? 'text-gold' : 'animate-pulse'} />
              <span>{translate('WHATSAPP SUPPORT', currentLang)}</span>
            </button>

            <button
              onClick={handleWhatsAppChat}
              aria-label="WhatsApp Concierge"
              className={`sm:hidden p-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 transition-colors duration-300 ${
                selectedRep?.isFeatured ? 'text-gold hover:text-gold/80 border-gold/30 bg-gold/10' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <MessageCircle size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Nav Row (Direct Desktop-Style Horizontal Links, No Hamburger) */}
      <div className="lg:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl px-2 py-2">
        <nav className="flex items-center justify-around gap-1 overflow-x-auto scrollbar-none px-1">
          {navLinks.map((link) => {
            const active = isLinkActive(link)
            return (
              <a
                key={link.label}
                href={link.path || `/#${link.sectionId}`}
                onClick={(e) => handleNavClick(e, link)}
                className={`relative px-2 py-1 font-body text-[10px] tracking-[0.12em] font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'text-gold font-bold'
                    : 'text-[#8e8e93] hover:text-white'
                }`}
              >
                {translate(link.label, currentLang)}
                {active && (
                  <span className="absolute bottom-0 left-1.5 right-1.5 h-[2px] bg-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                )}
              </a>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
