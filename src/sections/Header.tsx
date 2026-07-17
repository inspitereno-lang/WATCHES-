import { useState, useEffect } from 'react'
import { Menu, X, MessageCircle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router'
import { translate } from '../utils/translate'
import { getSelectedRep, getWhatsAppUrl, type SalesRep } from '../utils/whatsapp'

const navLinks = [
  { label: 'COLLECTIONS', sectionId: 'collections' },
  { label: 'WATCHES', sectionId: 'store' },
  { label: 'TESTIMONIALS', sectionId: 'testimonials' },
]

interface HeaderProps {
  salesReps?: SalesRep[]
  defaultWhatsAppNumber?: string
  defaultWhatsAppMessage?: string
}

export default function Header({
  salesReps,
  defaultWhatsAppNumber = '971501234567',
  defaultWhatsAppMessage = "Hi T24 Watches! I'm visiting your website and would like to inquire about your premium watch collection."
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [currentLang, setCurrentLang] = useState('en')
  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null)

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
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr'
    setCurrentLang(nextLang)
    window.location.reload()
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
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

  const handleNavClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)

    if (sectionId === 'store') {
      navigate('/watches')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      if (location.pathname !== '/') {
        // Navigate to home page first, then scroll to section after render
        navigate('/')
        setTimeout(() => scrollToSection(sectionId), 400)
      } else {
        scrollToSection(sectionId)
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
            className="flex items-center gap-2 group"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className="text-gold transition-transform duration-300 group-hover:scale-110"
            >
              <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.8" fill="none" strokeDasharray="4 2" />
              <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <path
                d="M16 6V11M16 21V26M6 16H11M21 16H26"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path d="M16 11L19 16H13L16 11Z" fill="currentColor" />
              <circle cx="16" cy="16" r="2.5" fill="currentColor" />
            </svg>
            <div className="flex flex-col">
              <span className="font-cinzel text-base tracking-[0.25em] text-white leading-tight font-bold">
                T24 <span className="text-gold">WATCHES</span>
              </span>
              <span className="font-cinzel text-[8px] tracking-[0.45em] text-silver leading-tight uppercase">
                DUBAI WATCHES
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={`/#${link.sectionId}`}
                onClick={(e) => handleNavClick(e, link.sectionId)}
                className="nav-link font-body text-[11px] tracking-[0.15em] text-silver hover:text-white transition-colors duration-300"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-gold/30 bg-white/5 hover:bg-white/10 transition-all duration-300 font-mono text-[10px] text-white tracking-widest uppercase font-bold"
              aria-label="Change Language"
            >
              <span className={currentLang === 'en' ? 'text-gold' : 'text-gray-400'}>EN</span>
              <span className="text-gray-600">/</span>
              <span className={currentLang === 'ar' ? 'text-gold' : 'text-gray-400'}>AR</span>
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
              <span>
                {selectedRep 
                  ? `${translate('WHATSAPP', currentLang)}: ${selectedRep.name}`
                  : translate('WHATSAPP SUPPORT', currentLang)}
              </span>
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
        className={`lg:hidden absolute top-full left-0 right-0 bg-dark/95 backdrop-blur-lg border-b border-white/5 transition-all duration-500 overflow-hidden ${
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col py-6 px-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={`/#${link.sectionId}`}
              className="py-3 font-body text-sm tracking-[0.15em] text-silver hover:text-gold transition-colors duration-300 border-b border-white/5 block w-full"
              onClick={(e) => handleNavClick(e, link.sectionId)}
            >
              {translate(link.label, currentLang)}
            </a>
          ))}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => {
                handleWhatsAppChat()
                setMobileMenuOpen(false)
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 ${
                selectedRep?.isFeatured
                  ? 'bg-gold text-dark hover:bg-gold/90'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              } font-body text-xs tracking-wider rounded-full transition-colors`}
            >
              <MessageCircle size={16} />
              <span>
                {selectedRep 
                  ? `${translate('WHATSAPP', currentLang)}: ${selectedRep.name}`
                  : translate('WHATSAPP', currentLang)}
              </span>
            </button>
            <button
              onClick={() => {
                toggleLanguage()
                setMobileMenuOpen(false)
              }}
              className="px-6 py-3 border border-white/10 rounded-full text-xs font-mono font-bold text-white uppercase tracking-wider bg-white/5"
            >
              {currentLang === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
