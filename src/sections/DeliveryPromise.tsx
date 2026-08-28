import {
  ArrowUpRight,
  Clock3,
  Globe2,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
} from 'lucide-react'

const deliveryBenefits = [
  {
    icon: Clock3,
    eyebrow: 'Dubai priority',
    title: 'Same-day delivery',
    description: 'Order confirmation, QC review, and complimentary delivery across Dubai on eligible orders.',
  },
  {
    icon: Truck,
    eyebrow: 'United Arab Emirates',
    title: 'Free UAE delivery',
    description: 'Secure, carefully packed delivery throughout the UAE with no additional delivery charge.',
  },
  {
    icon: MapPin,
    eyebrow: 'GCC destinations',
    title: 'Regional shipping',
    description: 'Tracked shipping to Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman.',
  },
  {
    icon: Globe2,
    eyebrow: 'International desk',
    title: 'Delivery to the USA',
    description: 'Door-to-door international dispatch supported by our Dubai team.',
  },
]

import { translate } from '../utils/translate'
import { ShippingLogosBar } from '../components/ShippingLogos'

export default function DeliveryPromise() {
  const currentLang = localStorage.getItem('t24_lang') || 'en'

  return (
    <section
      id="delivery"
      className="relative overflow-hidden border-y border-[#d7ae4c]/20 bg-[#060503] px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28 xl:px-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(224,181,75,0.17),transparent_37%)]" />
      <div className="pointer-events-none absolute -left-28 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-[#d7ae4c]/10" />
      <div className="pointer-events-none absolute -right-20 top-12 h-56 w-56 rounded-full border border-[#d7ae4c]/10" />

      <div className="relative mx-auto max-w-[92rem]">
        <div className="grid gap-10 border-b border-[#d7ae4c]/20 pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:pb-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ae4c]/30 bg-[#d7ae4c]/[0.07] px-3 py-1.5 font-body text-[9px] font-semibold uppercase tracking-[0.24em] text-[#efca6c]">
              <PackageCheck size={13} />
              {translate("Dubai Watches Gallery delivery promise", currentLang)}
            </div>
            <h2 className="mt-6 max-w-3xl font-display text-5xl font-light leading-[0.94] sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              {translate("From Dubai.", currentLang)}
              <br />
              <span className="italic text-[#e7bd59]">{translate("To your wrist.", currentLang)}</span>
            </h2>
          </div>

          <div className="lg:justify-self-end lg:max-w-xl">
            <p className="font-body text-base leading-8 text-white/60 sm:text-lg">
              {translate("Complimentary same-day delivery in Dubai, free delivery across the UAE, and secure worldwide shipping to the USA and GCC countries.", currentLang)}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-body text-[9px] uppercase tracking-[0.18em] text-white/70">
                <ShieldCheck size={13} className="text-[#e7bd59]" />
                {translate("QC checked before dispatch", currentLang)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-body text-[9px] uppercase tracking-[0.18em] text-white/70">
                <PackageCheck size={13} className="text-[#e7bd59]" />
                {translate("Secure presentation packaging", currentLang)}
              </span>
            </div>

            {/* Shipping Partners Row */}
            <div className="mt-6 pt-5 border-t border-[#d7ae4c]/15 flex flex-wrap items-center gap-3.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e7bd59] font-medium">
                {translate("Official Logistics Partners", currentLang)}:
              </span>
              <ShippingLogosBar />
            </div>
          </div>
        </div>

        <div className="grid border-x border-b border-[#d7ae4c]/20 sm:grid-cols-2 xl:grid-cols-4">
          {deliveryBenefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <article
                key={benefit.title}
                className={`group relative min-h-[18rem] border-[#d7ae4c]/20 p-7 transition-colors duration-500 hover:bg-[#d7ae4c]/[0.055] lg:p-9 ${
                  index % 2 === 0 ? 'sm:border-r' : ''
                } ${index > 1 ? 'border-t xl:border-t-0' : ''} ${
                  index > 0 ? 'xl:border-l' : ''
                }`}
              >
                <span className="absolute right-6 top-6 font-display text-4xl text-[#d7ae4c]/15">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d7ae4c]/35 bg-[#d7ae4c]/[0.08] text-[#efca6c] transition duration-500 group-hover:bg-[#d7ae4c] group-hover:text-black">
                  <Icon size={20} strokeWidth={1.6} />
                </div>
                <p className="mt-10 font-body text-[8px] font-semibold uppercase tracking-[0.22em] text-[#d7ae4c]">
                  {translate(benefit.eyebrow, currentLang)}
                </p>
                <h3 className="mt-3 font-display text-3xl text-white">
                  {translate(benefit.title, currentLang)}
                </h3>
                <p className="mt-4 max-w-xs font-body text-sm leading-6 text-white/45">
                  {translate(benefit.description, currentLang)}
                </p>
              </article>
            )
          })}
        </div>

        <a
          href="https://wa.me/971501234567?text=Hi%20Dubai%20Watches%20Gallery%2C%20I%20would%20like%20to%20confirm%20delivery%20for%20my%20location."
          target="_blank"
          rel="noreferrer"
          className="group flex flex-col justify-between gap-5 bg-[linear-gradient(100deg,#b98a22_0%,#f0ce78_50%,#b98a22_100%)] px-6 py-6 text-black sm:flex-row sm:items-center lg:px-9"
        >
          <div className="flex items-center gap-4">
            <ShieldCheck size={25} strokeWidth={1.6} />
            <div>
              <p className="font-body text-[9px] font-bold uppercase tracking-[0.2em]">
                {translate("Confirm your destination", currentLang)}
              </p>
              <p className="mt-1 font-display text-2xl sm:text-3xl">
                {translate("Ask our team for your delivery window.", currentLang)}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 self-start font-body text-[9px] font-bold uppercase tracking-[0.2em] sm:self-auto">
            {translate("Delivery support", currentLang)}
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </span>
        </a>
      </div>
    </section>
  )
}
