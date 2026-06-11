import { useEffect, useRef, useState } from 'react'
import { Routes, Route } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import Header from './sections/Header'
import Hero from './sections/Hero'
import SpecsBar from './sections/SpecsBar'
import NewArrivals from './sections/NewArrivals'
import ProductDetails from './sections/ProductDetails'
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

export default function App() {
  const lenisRef = useRef<Lenis | null>(null)
  const [homepageData, setHomepageData] = useState<any>(null)

  // Fetch central homepage configuration from Express
  useEffect(() => {
    fetch('/api/homepage')
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
    <div className="min-h-screen bg-dark text-white overflow-x-hidden">
      <ScrollToTop />
      <Routes>
        <Route 
          path="/" 
          element={
            <>
              <Header />
              <main>
                <Hero />
                <SpecsBar items={homepageData?.specsBarItems} />
                <NewArrivals 
                  newArrivalsTitle={homepageData?.newArrivalsTitle}
                  craftsmanshipTitle={homepageData?.craftsmanshipTitle}
                  newArrivals={homepageData?.newArrivals}
                  craftsmanshipImages={homepageData?.craftsmanshipImages}
                />
                <ProductDetails 
                  detailBrand={homepageData?.detailBrand}
                  detailModel={homepageData?.detailModel}
                  detailImage={homepageData?.detailImage}
                  detailDesc1={homepageData?.detailDesc1}
                  detailDesc2={homepageData?.detailDesc2}
                  detailSpecs={homepageData?.detailSpecs}
                />
                <Luminescence 
                  lumeHeading1={homepageData?.lumeHeading1}
                  lumeHeading2={homepageData?.lumeHeading2}
                  lumeSubhead={homepageData?.lumeSubhead}
                  lumeBody={homepageData?.lumeBody}
                  lumeImage={homepageData?.lumeImage}
                />
                <SignatureCollection />
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
              />
            </>
          } 
        />
        <Route 
          path="/product/:id" 
          element={
            <>
              <Header />
              <ProductDetailPage />
              <Footer 
                footerHeading={homepageData?.footerHeading}
                footerWhatsAppNumber={homepageData?.footerWhatsAppNumber}
                footerWhatsAppMessage={homepageData?.footerWhatsAppMessage}
                footerLinks={homepageData?.footerLinks}
                footerCopyright={homepageData?.footerCopyright}
                footerContactImage={homepageData?.footerContactImage}
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
