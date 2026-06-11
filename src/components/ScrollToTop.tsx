import { useEffect } from 'react'
import { useLocation } from 'react-router'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
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
