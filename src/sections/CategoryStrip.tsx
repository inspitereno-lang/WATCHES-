import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface CategoryStripProps {
  onSelectCategory?: (category: 'Mens' | 'Womens') => void
}

export default function CategoryStrip({ onSelectCategory }: CategoryStripProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const heading = section.querySelector('.cat-heading')
      const sub = section.querySelector('.cat-sub')
      const cards = section.querySelectorAll('.cat-card')

      gsap.set([heading, sub], { opacity: 0, y: 20 })
      gsap.set(cards, { opacity: 0, scale: 0.95 })

      gsap.to([heading, sub], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(cards, {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  const handleCategoryClick = (category: 'Mens' | 'Womens') => {
    if (onSelectCategory) {
      onSelectCategory(category)
    }
    // Scroll smoothly to store
    const storeSection = document.getElementById('store')
    if (storeSection) {
      storeSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      ref={sectionRef}
      id="categories"
      className="relative bg-dark border-t border-b border-white/5 py-20 lg:py-28 overflow-hidden"
    >
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] left-1/4 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[120px] opacity-40" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="cat-sub font-mono text-[10px] tracking-[0.3em] text-gold mb-3 uppercase">
            MASTER PIECE CATALOGUE
          </p>
          <h2 className="cat-heading font-display text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-tight">
            CURATED FOR <span className="text-gold font-bold">DISTINCTION</span>
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* Mens Card */}
          <div
            onClick={() => handleCategoryClick('Mens')}
            className="cat-card group relative h-[380px] rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-b from-[#141416] to-[#08080a] hover:border-gold/30 transition-all duration-500 cursor-pointer shadow-2xl flex flex-col justify-end p-8"
          >
            {/* Visual background pattern / overlay */}
            <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-700 pointer-events-none bg-[url('https://res.cloudinary.com/dwqxzzqpn/image/upload/v1783924974/t24_watches_defaults/watch-architecture.webp')]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <span className="inline-block px-3 py-1 text-[9px] font-mono tracking-widest text-gold bg-gold/10 border border-gold/20 rounded-full uppercase">
                Collection
              </span>
              <h3 className="font-display text-2xl lg:text-3xl font-light text-white tracking-wide">
                MENS <span className="text-gold font-bold">TIMEPIECES</span>
              </h3>
              <p className="text-xs text-silver font-light tracking-wider leading-relaxed max-w-sm">
                Engineered for presence. Featuring high-durability 904L Oystersteel, automatic mechanical sweep calibers, and balanced chronographs.
              </p>
              <div className="pt-2 flex items-center gap-2 text-gold font-mono text-[10px] tracking-widest font-bold uppercase group-hover:translate-x-1.5 transition-transform duration-300">
                EXPLORE MENS DIRECTORY &rarr;
              </div>
            </div>
          </div>

          {/* Womens Card */}
          <div
            onClick={() => handleCategoryClick('Womens')}
            className="cat-card group relative h-[380px] rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-b from-[#141416] to-[#08080a] hover:border-gold/30 transition-all duration-500 cursor-pointer shadow-2xl flex flex-col justify-end p-8"
          >
            {/* Visual background pattern / overlay */}
            <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-700 pointer-events-none bg-[url('https://res.cloudinary.com/dwqxzzqpn/image/upload/v1783924974/t24_watches_defaults/watch-architecture.webp')]" style={{ filter: 'hue-rotate(240deg)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <span className="inline-block px-3 py-1 text-[9px] font-mono tracking-widest text-gold bg-gold/10 border border-gold/20 rounded-full uppercase">
                Collection
              </span>
              <h3 className="font-display text-2xl lg:text-3xl font-light text-white tracking-wide">
                WOMENS <span className="text-gold font-bold">TIMEPIECES</span>
              </h3>
              <p className="text-xs text-silver font-light tracking-wider leading-relaxed max-w-sm">
                Sculpted elegance. Showcasing refined sizes, diamond-encrusted dials, mother of pearl finishes, and high-precision sweep movements.
              </p>
              <div className="pt-2 flex items-center gap-2 text-gold font-mono text-[10px] tracking-widest font-bold uppercase group-hover:translate-x-1.5 transition-transform duration-300">
                EXPLORE WOMENS DIRECTORY &rarr;
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
