import { useEffect } from 'react'
import { useLocation } from 'react-router'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // If returning to /watches with a saved scroll position, preserve it
    if (pathname === '/watches') {
      try {
        const saved = sessionStorage.getItem('t24_watches_cache')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (typeof parsed.scrollY === 'number' && parsed.scrollY > 0) {
            return
          }
        }
      } catch (e) {}
    }

    // Reset standard window scroll
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
    
    // Find scrollable body or trigger manual ScrollTrigger refresh
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
  }, [pathname])

  return null
}
