import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
}

const defaultFooterLinks: LinkGroup[] = [
  {
    title: 'COLLECTIONS',
    links: ['Rolex 1:1 Clones', 'Patek Philippe Clones', 'Audemars Piguet Clones', 'Richard Mille Clones', 'Vacheron Constantin'],
  },
  {
    title: 'OUR SPECIFICATIONS',
    links: ['Clone Caliber Movement', '904L Anti-Corrosive Steel', 'Bespoke Bezel Finishes', 'Ultra-Clear Sapphire Glass'],
  },
  {
    title: 'CUSTOMER SERVICE',
    links: ['WhatsApp Order Desk', 'QC Photo Review', 'GCC Secure Delivery', 'Secure Packaging'],
  },
  {
    title: 'T24 REPLICA ASSURANCE',
    links: ['1:1 Weight Guarantee', 'AAA+ Precision Sweeping', 'Indistinguishable Engravings', 'Dual Waterproof Seals'],
  },
]

export default function Footer({
  footerHeading = 'CONTACT US',
  footerWhatsAppNumber = '971501234567',
  footerWhatsAppMessage = "Hi T24 Watches! I'm visiting your website and would like to inquire about your premium 1:1 Swiss Clone watch collection.",
  footerLinks = defaultFooterLinks,
  footerCopyright = '© 2026 T24 Watches Dubai. All rights reserved. 1:1 Swiss Clone replica timepieces.',
}: FooterProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const linksList = footerLinks && footerLinks.length > 0 ? footerLinks : defaultFooterLinks

  const handleWhatsAppChat = () => {
    const message = encodeURIComponent(footerWhatsAppMessage)
    window.open(`https://wa.me/${footerWhatsAppNumber}?text=${message}`, '_blank')
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const heading = section.querySelector('.footer-heading')
      const links = section.querySelector('.footer-links')
      const bottom = section.querySelector('.footer-bottom')

      gsap.set(heading, { opacity: 0, y: 30 })
      gsap.set(links, { opacity: 0, y: 40 })
      gsap.set(bottom, { opacity: 0 })

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
  }, [linksList])

  return (
    <footer ref={sectionRef} className="relative">
      {/* Mountain Banner Image */}
      <div className="relative h-[300px] lg:h-[400px] overflow-hidden">
        <img
          src="/swiss-alps.jpg"
          alt="Swiss Alps"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />

        {/* Contact Us text overlay */}
        <div className="absolute bottom-12 left-6 lg:left-12 xl:left-20">
          <button
            onClick={handleWhatsAppChat}
            className="group flex flex-col items-start text-left focus:outline-none"
          >
            <h2 className="footer-heading font-display text-4xl sm:text-5xl lg:text-6xl text-white group-hover:text-gold transition-colors duration-300 uppercase font-light">
              {footerHeading}
            </h2>
            <div className="flex items-center gap-2 mt-2 text-silver group-hover:text-white transition-colors duration-300">
              <svg
                className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors animate-pulse"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.863-9.864.001-2.639-1.02-5.12-2.875-6.98C16.398 1.9 13.916.861 11.277.86 5.838.86 1.417 5.276 1.415 10.722c-.001 1.547.414 3.053 1.202 4.412l-.993 3.63 3.733-.979c1.378.752 2.82 1.151 4.29 1.151zM17.13 14.51c-.305-.153-1.808-.891-2.088-.992-.28-.102-.485-.153-.688.153-.203.305-.788.992-.966 1.196-.177.203-.355.228-.66.076-.305-.153-1.288-.475-2.454-1.516-.908-.81-1.52-1.81-1.698-2.115-.178-.305-.019-.47.133-.621.137-.136.305-.355.457-.533.153-.177.203-.355.457-.533.153-.177.203-.305.305-.508.102-.203.051-.381-.025-.533-.076-.153-.688-1.66-.943-2.274-.249-.597-.502-.516-.688-.526-.178-.009-.381-.011-.584-.011-.203 0-.533.076-.812.381-.28.305-1.067 1.042-1.067 2.541 0 1.498 1.092 2.946 1.244 3.15 0 .076 2.15 3.284 5.207 4.603.727.314 1.295.502 1.737.643.73.232 1.394.199 1.918.121.584-.087 1.808-.737 2.062-1.449.254-.712.254-1.322.178-1.449-.076-.127-.28-.203-.584-.356z" />
              </svg>
              <span className="font-body text-xs tracking-[0.15em] font-medium font-mono">
                CHAT VIA WHATSAPP
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-dark py-16 lg:py-20">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          {/* Links Grid */}
          <div className="footer-links grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
            {linksList.map((group, idx) => (
              <div key={idx}>
                <h4 className="font-body text-[10px] tracking-[0.2em] text-gold mb-4 uppercase font-semibold">
                  {group.title}
                </h4>
                <ul className="space-y-2.5">
                  {group.links && group.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="footer-link font-body text-xs text-silver hover:text-white transition-colors duration-300"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Payment Icons & Copyright */}
          <div className="footer-bottom flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
            {/* Secure Payment Methods */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-gold tracking-widest uppercase">
                CASH ON DELIVERY (GCC)
              </span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-gold tracking-widest uppercase">
                USDT / CRYPTO
              </span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-gold tracking-widest uppercase">
                BANK TRANSFER
              </span>
            </div>

            {/* Copyright */}
            <p className="font-body text-[10px] text-silver tracking-wider">
              {footerCopyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
