import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { translate } from '../utils/translate'
import { getSelectedRep, getWhatsAppUrl, type SalesRep } from '../utils/whatsapp'
import { ShippingLogosBar } from '../components/ShippingLogos'

gsap.registerPlugin(ScrollTrigger)

interface LinkGroup {
  title: string
  links: string[]
}

interface FooterProps {
  footerHeading?: string
  footerWhatsAppNumber?: string
  footerWhatsAppMessage?: string
  footerLinks?: LinkGroup[]
  footerCopyright?: string
  footerContactImage?: string
  salesReps?: SalesRep[]
}

const essentialFooterLinks = [
  { label: 'HOME', to: '/' },
  { label: 'WATCHES', to: '/watches' },
  { label: 'COLLECTIONS', to: '/collections' },
  { label: 'ACCESSORIES', to: '/accessories' },
  { label: 'JOURNAL', to: '/blog' },
] as const

export default function Footer({
  footerHeading: _footerHeading = 'CONTACT US',
  footerWhatsAppNumber = '971501234567',
  footerWhatsAppMessage = "Hi Dubai Watches Gallery! I'm visiting your website and would like to inquire about your premium watch collection.",
  footerCopyright = '© 2026 Dubai Watches Gallery. All rights reserved. Premium timepieces.',
  footerContactImage = '/images/contact-dubai-banner.jpg',
  salesReps,
}: FooterProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const currentLang = localStorage.getItem('t24_lang') || 'en'

  const contactBannerSrc =
    !footerContactImage || footerContactImage.includes('hk3mfvm17mljab3czc5h')
      ? '/images/contact-dubai-banner.jpg'
      : footerContactImage

  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null)

  useEffect(() => {
    setSelectedRep(getSelectedRep(salesReps, footerWhatsAppNumber))
  }, [salesReps, footerWhatsAppNumber])

  const handleWhatsAppChat = () => {
    const rep = selectedRep || getSelectedRep(salesReps, footerWhatsAppNumber)
    const url = getWhatsAppUrl(rep.number, footerWhatsAppMessage)
    window.open(url, '_blank')
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const heading = section.querySelector('.footer-heading')
      const links = section.querySelector('.footer-links')
      const bottom = section.querySelector('.footer-bottom')

      if (heading) {
        gsap.set(heading, { opacity: 0, y: 30 })
        gsap.to(heading, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        })
      }

      gsap.set(links, { opacity: 0, y: 40 })
      gsap.set(bottom, { opacity: 0 })

      gsap.to(links, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 50%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(bottom, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: bottom,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <footer ref={sectionRef} className="relative">
      {/* Dubai Sunset Skyline & Watch Contact Banner with 16:9 responsive ratio */}
      <div 
        onClick={handleWhatsAppChat}
        className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[2.4/1] min-h-[240px] sm:min-h-[340px] lg:min-h-[420px] max-h-[560px] overflow-hidden group cursor-pointer"
      >
        <img
          src={contactBannerSrc}
          alt="Dubai The Watch - Contact Us"
          className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.02] select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-transparent pointer-events-none" />

        {/* Interactive WhatsApp Action Pill Badge */}
        <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-12 lg:left-20 z-10">
          <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-gold/50 hover:border-gold text-white transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.8)] group-hover:scale-105">
            <svg
              className="w-4 h-4 text-emerald-400 animate-pulse"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.863-9.864.001-2.639-1.02-5.12-2.875-6.98C16.398 1.9 13.916.861 11.277.86 5.838.86 1.417 5.276 1.415 10.722c-.001 1.547.414 3.053 1.202 4.412l-.993 3.63 3.733-.979c1.378.752 2.82 1.151 4.29 1.151zM17.13 14.51c-.305-.153-1.808-.891-2.088-.992-.28-.102-.485-.153-.688.153-.203.305-.788.992-.966 1.196-.177.203-.355.228-.66.076-.305-.153-1.288-.475-2.454-1.516-.908-.81-1.52-1.81-1.698-2.115-.178-.305-.019-.47.133-.621.137-.136.305-.355.457-.533.153-.177.203-.355.457-.533.153-.177.203-.305.305-.508.102-.203.051-.381-.025-.533-.076-.153-.688-1.66-.943-2.274-.249-.597-.502-.516-.688-.526-.178-.009-.381-.011-.584-.011-.203 0-.533.076-.812.381-.28.305-1.067 1.042-1.067 2.541 0 1.498 1.092 2.946 1.244 3.15 0 .076 2.15 3.284 5.207 4.603.727.314 1.295.502 1.737.643.73.232 1.394.199 1.918.121.584-.087 1.808-.737 2.062-1.449.254-.712.254-1.322.178-1.449-.076-.127-.28-.203-.584-.356z" />
            </svg>
            <span className="font-mono text-[11px] sm:text-xs tracking-[0.15em] font-semibold text-white group-hover:text-gold transition-colors">
              {translate('CHAT VIA WHATSAPP', currentLang)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-dark py-16 lg:py-20">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          {/* Essential navigation only: every item maps to a real app route. */}
          <nav className="footer-links mb-14" aria-label="Footer navigation">
            <h4 className="font-body text-[10px] tracking-[0.25em] text-gold mb-5 uppercase font-semibold">
              {translate('EXPLORE', currentLang)}
            </h4>
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {essentialFooterLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="footer-link inline-block font-body text-xs tracking-[0.12em] text-silver hover:text-gold transition-colors duration-300"
                  >
                    {translate(link.label, currentLang)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Payment Badges, Shipping Partners & Copyright */}
          <div className="footer-bottom pt-8 border-t border-white/10 flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
              {/* Payment Methods */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-gold tracking-widest uppercase font-semibold shadow-sm">
                  {translate('CASH ON DELIVERY (GCC)', currentLang)}
                </span>
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-gold tracking-widest uppercase font-semibold shadow-sm">
                  {translate('USD / CARD PAYMENTS', currentLang)}
                </span>
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-gold tracking-widest uppercase font-semibold shadow-sm">
                  {translate('BANK TRANSFER', currentLang)}
                </span>
              </div>

              {/* Official Logistics Partners */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-silver/80">
                  {translate('Official Logistics Partners', currentLang)}:
                </span>
                <ShippingLogosBar />
              </div>
            </div>

            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5 text-center sm:text-left">
              <p className="font-body text-[10px] text-silver tracking-wider">
                {translate(footerCopyright, currentLang)}
              </p>
              <p className="font-mono text-[9px] text-gray-500 tracking-widest uppercase">
                {translate('Global Insured Delivery via DHL • FedEx • UPS', currentLang)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
