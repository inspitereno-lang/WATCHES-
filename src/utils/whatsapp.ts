export interface SalesRep {
  name: string
  number: string
  isActive: boolean
  isFeatured: boolean
}

/**
 * Rotates and returns the selected sales representative.
 * Ensures the representative is cached for the current session to keep customer service consistent,
 * while utilizing a global localStorage counter to rotate representatives round-robin.
 */
export function getSelectedRep(
  salesReps: SalesRep[] | undefined,
  defaultNumber: string = '971501234567'
): SalesRep {
  const fallbackRep: SalesRep = {
    name: 'Dubai Watches Gallery WhatsApp Support',
    number: defaultNumber,
    isActive: true,
    isFeatured: true
  }

  if (!salesReps || salesReps.length === 0) {
    return fallbackRep
  }

  const activeReps = salesReps.filter((rep) => rep.isActive)
  if (activeReps.length === 0) {
    return fallbackRep
  }

  // 1. Try to retrieve representative for current session
  try {
    const cached = sessionStorage.getItem('t24_session_sales_rep')
    if (cached) {
      const parsed = JSON.parse(cached) as SalesRep
      const stillActive = activeReps.find(
        (r) => r.number.replace(/[+\s-]/g, '') === parsed.number.replace(/[+\s-]/g, '') && r.isActive
      )
      if (stillActive) {
        return stillActive
      }
    }
  } catch (e) {
    // Ignore storage issues
  }

  // 2. Select next representative using round-robin rotation stored in localStorage
  try {
    const cycleStr = localStorage.getItem('t24_sales_rep_cycle_index')
    let nextIndex = cycleStr ? parseInt(cycleStr, 10) : 0
    if (isNaN(nextIndex) || nextIndex < 0 || nextIndex >= activeReps.length) {
      nextIndex = 0
    }

    const selected = activeReps[nextIndex]
    
    // Save rotation index for next visitor / trigger
    localStorage.setItem('t24_sales_rep_cycle_index', String((nextIndex + 1) % activeReps.length))
    sessionStorage.setItem('t24_session_sales_rep', JSON.stringify(selected))
    
    return selected
  } catch (e) {
    // Fallback to random if storage is completely blocked
    const randomIdx = Math.floor(Math.random() * activeReps.length)
    return activeReps[randomIdx]
  }
}

/**
 * Creates a clean WhatsApp wa.me link.
 */
export function getWhatsAppUrl(number: string, message: string): string {
  const cleanNumber = number.replace(/[+\s-]/g, '')
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
}
