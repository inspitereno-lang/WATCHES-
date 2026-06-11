import { useState, useEffect } from 'react'
import { Menu, X, MessageCircle } from 'lucide-react'

const navLinks = [
  { label: 'COLLECTIONS', href: '#collections' },
  { label: 'CLONE WATCHES', href: '#store' },
  { label: 'SPECIFICATIONS', href: '#matte-black' },
  { label: 'TESTIMONIALS', href: '#testimonials' },
  { label: 'OUR HERITAGE', href: '#heritage' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWhatsAppChat = () => {
    const message = encodeURIComponent("Hi T24 Watches! I'm visiting your website and would like to inquire about your premium 1:1 Swiss Clone watch collection.")
    window.open(`https://wa.me/971501234567?text=${message}`, '_blank')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-dark/95 backdrop-blur-md border-b border-white/5 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className="text-gold transition-transform duration-300 group-hover:scale-110"
            >
              {/* Sleek mechanical bezel + gear segment */}
              <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.8" fill="none" strokeDasharray="4 2" />
              <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <path
                d="M16 6V11M16 21V26M6 16H11M21 16H26"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M16 11L19 16H13L16 11Z"
                fill="currentColor"
              />
              <circle cx="16" cy="16" r="2.5" fill="currentColor" />
            </svg>
            <div className="flex flex-col">
              <span className="font-cinzel text-base tracking-[0.25em] text-white leading-tight font-bold">
                T24 <span className="text-gold">WATCHES</span>
              </span>
              <span className="font-cinzel text-[8px] tracking-[0.45em] text-silver leading-tight uppercase">
                DUBAI CLONE WATCHES
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link font-body text-[11px] tracking-[0.15em] text-silver hover:text-white transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Utility Icons */}
          <div className="flex items-center gap-4">
            {/* WhatsApp Concierge Button */}
            <button
              onClick={handleWhatsAppChat}
              className="hidden sm:flex items-center gap-2 px-4 py-1.8 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-full transition-all duration-300 font-body text-[10px] tracking-wider"
            >
              <MessageCircle size={14} className="animate-pulse" />
              <span>WHATSAPP SUPPORT</span>
            </button>
            
            <button
              onClick={handleWhatsAppChat}
              className="sm:hidden text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
            >
              <MessageCircle size={20} />
            </button>



            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-silver hover:text-white transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-dark/95 backdrop-blur-lg border-b border-white/5 transition-all duration-500 overflow-hidden ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col py-6 px-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="py-3 font-body text-sm tracking-[0.15em] text-silver hover:text-gold transition-colors duration-300 border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              handleWhatsAppChat()
              setMobileMenuOpen(false)
            }}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-body text-xs tracking-wider rounded-full transition-colors"
          >
            <MessageCircle size={16} />
            <span>ORDER VIA WHATSAPP</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
