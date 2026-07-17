import { useEffect, useRef, useState } from 'react'
import { Routes, Route } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import Header from './sections/Header'
import Hero from './sections/Hero'
import SpecsBar from './sections/SpecsBar'
import NewArrivals from './sections/NewArrivals'
import Luminescence from './sections/Luminescence'
import SignatureCollection from './sections/SignatureCollection'
import Testimonials from './sections/Testimonials'
import MaisonAeterna from './sections/MaisonAeterna'
import Nocturne from './sections/Nocturne'
import Footer from './sections/Footer'
import ProductDetailPage from './pages/ProductDetailPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ScrollToTop from './components/ScrollToTop'

gsap.registerPlugin(ScrollTrigger)

const ARCHITECTURE_IMAGE_URL = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1783924974/t24_watches_defaults/watch-architecture.webp'
const HERITAGE_IMAGE_URL = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171811/t24_watches_defaults/igkoymjeabkrvpmjcx3o.jpg'

export default function App() {
  const lenisRef = useRef<Lenis | null>(null)
  const [homepageData, setHomepageData] = useState<any>(null)
  const [activeAudienceFilter, setActiveAudienceFilter] = useState<'ALL' | 'Mens' | 'Womens'>('ALL')
  const architectureImage =
    !homepageData?.architectureImage ||
    homepageData.architectureImage === homepageData?.heritageImage ||
    homepageData.architectureImage === HERITAGE_IMAGE_URL
      ? ARCHITECTURE_IMAGE_URL
      : homepageData.architectureImage

  // Fetch central homepage configuration from Express
  useEffect(() => {
    const lang = localStorage.getItem('t24_lang') || 'en'
    fetch(`/api/homepage?lang=${lang}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load homepage configuration')
        return res.json()
      })
      .then((data) => setHomepageData(data))
      .catch((err) => console.error('Homepage settings retrieval failed:', err))
  }, [])

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      lerp: 0.15,
      smoothWheel: true,
    })
    lenisRef.current = lenis

    // Connect Lenis to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    // Refresh ScrollTrigger after everything loads
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)

    return () => {
      clearTimeout(timeout)
      lenis.destroy()
      gsap.ticker.remove(lenis.raf)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <ScrollToTop />
      <Routes>
        <Route 
          path="/" 
          element={
            <>
              <Header 
                salesReps={homepageData?.salesReps}
                defaultWhatsAppNumber={homepageData?.footerWhatsAppNumber}
                defaultWhatsAppMessage={homepageData?.footerWhatsAppMessage}
              />
              <main>
                <Hero 
                  heroTitle={homepageData?.heroTitle}
                  heroSubtitleLabel={homepageData?.heroSubtitleLabel}
                  heroSubtitleDesc={homepageData?.heroSubtitleDesc}
                  heroBodyDescription={homepageData?.heroBodyDescription}
                  heroCtaLabel={homepageData?.heroCtaLabel}
                  heroCtaTarget={homepageData?.heroCtaTarget}
                  heroWatchImageUrl={homepageData?.heroWatchImageUrl}
                  heroWatchLabelLine1={homepageData?.heroWatchLabelLine1}
                  heroWatchLabelLine2={homepageData?.heroWatchLabelLine2}
                  heroWatchLabelLine3={homepageData?.heroWatchLabelLine3}
                  heroWatchLabelLine4={homepageData?.heroWatchLabelLine4}
                  heroStats={homepageData?.heroStats}
                />
                <NewArrivals 
                  newArrivalsTitle={homepageData?.newArrivalsTitle}
                  craftsmanshipTitle={homepageData?.craftsmanshipTitle}
                  newArrivals={homepageData?.newArrivals}
                  craftsmanshipImages={homepageData?.craftsmanshipImages}
                />
                <SpecsBar items={homepageData?.specsBarItems} />
                <Luminescence
                  lumeHeading1={homepageData?.architectureHeading1}
                  lumeHeading2={homepageData?.architectureHeading2}
                  lumeSubhead={homepageData?.architectureSubhead}
                  lumeBody={homepageData?.architectureDesc}
                  lumeImage={architectureImage}
                />
                <SignatureCollection
                  catalogueEyebrow={homepageData?.catalogueEyebrow}
                  catalogueHeading1={homepageData?.catalogueHeading1}
                  catalogueHeading2={homepageData?.catalogueHeading2}
                  catalogueDescription={homepageData?.catalogueDescription}
                  activeAudienceFilter={activeAudienceFilter}
                  onAudienceFilterChange={setActiveAudienceFilter}
                />
                <Testimonials items={homepageData?.testimonials} />
                <MaisonAeterna 
                  heritageHeading1={homepageData?.heritageHeading1}
                  heritageHeading2={homepageData?.heritageHeading2}
                  heritageDesc1={homepageData?.heritageDesc1}
                  heritageDesc2={homepageData?.heritageDesc2}
                  heritageDesc3={homepageData?.heritageDesc3}
                  heritageImage={homepageData?.heritageImage}
                  heritageCaptionLabel={homepageData?.heritageCaptionLabel}
                  heritageCaptionText={homepageData?.heritageCaptionText}
                />
                <Nocturne 
                  nocturneHeading1={homepageData?.nocturneHeading1}
                  nocturneHeading2={homepageData?.nocturneHeading2}
                  nocturneCopy={homepageData?.nocturneCopy}
                  nocturneBuildSpec={homepageData?.nocturneBuildSpec}
                  nocturneImage={homepageData?.nocturneImage}
                />
              </main>
              <Footer 
                footerHeading={homepageData?.footerHeading}
                footerWhatsAppNumber={homepageData?.footerWhatsAppNumber}
                footerWhatsAppMessage={homepageData?.footerWhatsAppMessage}
                footerLinks={homepageData?.footerLinks}
                footerCopyright={homepageData?.footerCopyright}
                footerContactImage={homepageData?.footerContactImage}
                salesReps={homepageData?.salesReps}
              />
            </>
          } 
        />
        <Route 
          path="/watches" 
          element={
            <>
              <Header 
                salesReps={homepageData?.salesReps}
                defaultWhatsAppNumber={homepageData?.footerWhatsAppNumber}
                defaultWhatsAppMessage={homepageData?.footerWhatsAppMessage}
              />
              <main className="pt-20">
                <SignatureCollection
                  catalogueEyebrow={homepageData?.catalogueEyebrow}
                  catalogueHeading1={homepageData?.catalogueHeading1}
                  catalogueHeading2={homepageData?.catalogueHeading2}
                  catalogueDescription={homepageData?.catalogueDescription}
                  activeAudienceFilter={activeAudienceFilter}
                  onAudienceFilterChange={setActiveAudienceFilter}
                />
              </main>
              <Footer 
                footerHeading={homepageData?.footerHeading}
                footerWhatsAppNumber={homepageData?.footerWhatsAppNumber}
                footerWhatsAppMessage={homepageData?.footerWhatsAppMessage}
                footerLinks={homepageData?.footerLinks}
                footerCopyright={homepageData?.footerCopyright}
                footerContactImage={homepageData?.footerContactImage}
                salesReps={homepageData?.salesReps}
              />
            </>
          } 
        />
        <Route 
          path="/product/:id" 
          element={
            <>
              <Header 
                salesReps={homepageData?.salesReps}
                defaultWhatsAppNumber={homepageData?.footerWhatsAppNumber}
                defaultWhatsAppMessage={homepageData?.footerWhatsAppMessage}
              />
              <ProductDetailPage 
                salesReps={homepageData?.salesReps}
                defaultWhatsAppNumber={homepageData?.footerWhatsAppNumber}
              />
              <Footer 
                footerHeading={homepageData?.footerHeading}
                footerWhatsAppNumber={homepageData?.footerWhatsAppNumber}
                footerWhatsAppMessage={homepageData?.footerWhatsAppMessage}
                footerLinks={homepageData?.footerLinks}
                footerCopyright={homepageData?.footerCopyright}
                footerContactImage={homepageData?.footerContactImage}
                salesReps={homepageData?.salesReps}
              />
            </>
          } 
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}
