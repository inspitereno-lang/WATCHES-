import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star, Quote } from 'lucide-react'
import { translate } from '../utils/translate'

gsap.registerPlugin(ScrollTrigger)

interface Testimonial {
  id: number
  name: string
  location: string
  role: string
  watchBought: string
  rating: number
  quote: string
  avatar?: string
}

const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Fahad Al-Mansoori',
    location: 'Dubai Marina, UAE',
    role: 'Watch Collector',
    watchBought: 'Rolex Daytona Panda',
    rating: 5,
    quote: 'Absolutely mind-blowing. I own a genuine Datejust, but I wanted a Daytona for daily wear without the risk. The weight, bezel luster, and mechanical chronograph sweep are identical. Hand-delivered in Dubai within 4 hours!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 2,
    name: 'Lucas Sterling',
    location: 'London, UK',
    role: 'Finance Director',
    watchBought: 'Patek Philippe Nautilus 5711',
    rating: 5,
    quote: 'I was skeptical about the 8.3mm thickness, but the proportions are excellent. It fits beautifully on wrist. The blue-grey gradient dial shifts beautifully in direct light. Direct WhatsApp ordering was fast and smooth.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    location: 'Los Angeles, USA',
    role: 'Creative Director',
    watchBought: 'Rolex Datejust 41 Wimbledon',
    rating: 5,
    quote: 'The Wimbledon slate Roman dial is a masterpiece of precision. The fluted bezel catches light beautifully. Incredible premium customer service from their Dubai desk!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 4,
    name: 'Khalid Bin-Fahd',
    location: 'Riyadh, Saudi Arabia',
    role: 'Business Owner',
    watchBought: 'Audemars Piguet Royal Oak 15500',
    rating: 5,
    quote: 'Unbelievable craftsmanship on the brushed stainless steel bracelet. The links slide smoothly without any friction, catching light beautifully. Fast courier delivery to Riyadh. Recommended 100%!',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 5,
    name: 'Jean-Pierre Moreau',
    location: 'Geneva, Switzerland',
    role: 'Horological Enthusiast',
    watchBought: 'Vacheron Constantin Overseas',
    rating: 5,
    quote: 'Living in Geneva, I appreciate quality watchmaking. The Maltese Cross bezel finish and the quick-release steel strap mechanism work exactly like the original. Truly exceptional copy quality.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 6,
    name: 'Amara Okafor',
    location: 'Lagos, Nigeria',
    role: 'Art Director',
    watchBought: 'AP Royal Oak Double Balance Wheel',
    rating: 5,
    quote: 'The skeleton dial is breathtaking. You can see the double balance wheels beating in perfect synchronization. The gold plating color is exceptionally rich and heavy. Exceeded all expectations!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  }
]

export default function Testimonials({ items }: { items?: Testimonial[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const testimonialsList = items && items.length > 0 ? items : defaultTestimonials
  const currentLang = localStorage.getItem('t24_lang') || 'ar'

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const label = section.querySelector('.test-label')
      const heading = section.querySelector('.test-heading')
      const cards = section.querySelectorAll('.test-card')

      gsap.set([label, heading], { opacity: 0, y: 40 })
      gsap.set(cards, { opacity: 0, y: 30 })

      gsap.to(label, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(heading, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 65%',
          toggleActions: 'play none none none',
        },
      })

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          toggleActions: 'play none none none',
        },
      })
    }, section)

    return () => ctx.revert()
  }, [testimonialsList])

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative bg-dark py-20 lg:py-32 overflow-hidden border-b border-white/5"
    >
      {/* Background soft glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <p className="test-label font-body text-xs tracking-[0.3em] text-gold mb-4 uppercase">
            {translate('CUSTOMER REVIEWS', currentLang)}
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="test-heading font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.95] font-light">
              {translate('REPUTATION IS', currentLang)}
              <br />
              <span className="text-gold font-bold">{translate('EVERYTHING', currentLang)}</span>
            </h2>
            <p className="font-body text-xs text-silver tracking-widest max-w-sm lg:mb-2 leading-relaxed">
              {translate('Read verified testimonials from real watch collectors and enthusiasts who trusted our custom watch configurations.', currentLang)}
            </p>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonialsList.map((test, idx) => (
            <div
              key={idx}
              className="test-card glass-card rounded-lg p-6 lg:p-8 relative flex flex-col justify-between hover:border-gold/20 transition-all duration-300 group"
            >
              {/* Quote Icon Background */}
              <div className="absolute top-6 right-6 text-white/5 group-hover:text-gold/5 transition-colors">
                <Quote size={56} strokeWidth={1} />
              </div>

              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(test.rating || 5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-gold text-gold" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="font-body text-sm text-silver leading-relaxed font-light mb-6 italic">
                  &ldquo;{test.quote}&rdquo;
                </p>
              </div>

              {/* User Bio */}
              <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                <div>
                  <h4 className="font-body text-sm font-semibold text-white tracking-wide">
                    {test.name}
                  </h4>
                  <p className="font-body text-[10px] text-silver/60 tracking-wider">
                    {test.location} &bull; {test.role}
                  </p>
                </div>
                
                {/* Watch detail badge */}
                <span className="bg-gold/10 text-gold font-body text-[8px] font-bold tracking-[0.1em] px-2.5 py-1 rounded uppercase">
                  {test.watchBought}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
