import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import CelebrityWatches from '../sections/CelebrityWatches'
import Seo from '../components/Seo'
import { translate } from '../utils/translate'

export default function CollectionsPage() {
  const currentLang = localStorage.getItem('t24_lang') || 'en'
  const isArabic = currentLang === 'ar'
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Seo
        title={isArabic ? 'مجموعات الساعات الفاخرة في دبي | معرض دبي للساعات' : 'Luxury Replica Watch Collections Dubai | Dubai Watches Gallery'}
        description={isArabic ? 'تسوّق مجموعات مختارة من رولكس وريتشارد ميل وباتيك فيليب وأوديمار بيجيه في دبي مع توصيل آمن.' : 'Shop curated Rolex, Richard Mille, Patek Philippe and Audemars Piguet replica watch collections in Dubai with exact-reference guides and secure delivery.'}
        keywords={[
          'replica watches Dubai',
          'super clone watches Dubai',
          'Rolex replica Dubai',
          'Richard Mille replica Dubai',
          'Patek Philippe replica watches',
        ]}
        canonicalPath="/collections"
        image="/hero-brands/patek-philippe-nautilus.png"
      />

      <CelebrityWatches />

      <section className="border-t border-white/10 bg-[#0a0907] px-6 py-16 lg:px-12 lg:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-body text-[9px] uppercase tracking-[0.24em] text-[#e8c264]">
              {translate("Continue exploring", currentLang)}
            </p>
            <h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">
              {translate("Browse every available timepiece.", currentLang)}
            </h2>
          </div>
          <Link
            to="/watches"
            className="inline-flex w-fit items-center gap-3 rounded-full border border-[#e8c264]/40 px-6 py-3.5 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e8c264] transition hover:bg-[#e8c264] hover:text-black"
          >
            {translate("View all watches", currentLang)}
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}
