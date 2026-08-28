import { useState, useEffect } from 'react'
import { Menu, X, MessageCircle } from 'lucide-react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleNavClick = (e: React.MouseEvent, link: (typeof navLinks)[number]) => {
    e.preventDefault()
    setMobileMenuOpen(false)

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-dark/95 backdrop-blur-md border-b border-white/5 shadow-lg'
          : 'bg-black/95 border-b border-white/5 sm:bg-transparent sm:border-transparent'
      }`}
    >
      <div className="w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
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
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03] sm:h-16"
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
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 hover:border-gold/30 bg-white/5 hover:bg-white/10 transition-all duration-300 font-mono text-[10px] text-white tracking-wider uppercase font-bold cursor-pointer"
              aria-label="Change Language"
            >
              <span className={currentLang === 'en' ? 'text-gold font-bold' : 'text-gray-400 hover:text-white'}>English</span>
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
              className={`sm:hidden transition-colors duration-300 ${
                selectedRep?.isFeatured ? 'text-gold hover:text-gold/80' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <MessageCircle size={20} />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-silver hover:text-white transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-[#070707] border-b border-white/10 shadow-2xl transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-[380px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col px-6 pb-5 pt-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.path || `/#${link.sectionId}`}
              className={`py-3 font-body text-sm tracking-[0.15em] transition-colors duration-300 border-b border-white/5 block w-full ${
                isLinkActive(link) ? 'text-gold font-bold' : 'text-silver hover:text-gold'
              }`}
              onClick={(e) => handleNavClick(e, link)}
            >
              {translate(link.label, currentLang)}
            </a>
          ))}
          <div className="mt-4">
            <button
              onClick={() => {
                handleWhatsAppChat()
                setMobileMenuOpen(false)
              }}
              className={`flex w-full items-center justify-center gap-2 py-3 ${
                selectedRep?.isFeatured
                  ? 'bg-gold text-dark hover:bg-gold/90'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              } font-body text-xs tracking-wider rounded-full transition-colors`}
            >
              <MessageCircle size={16} />
              <span>{translate('WHATSAPP SUPPORT', currentLang)}</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
