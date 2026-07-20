import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { translateUiText } from '../utils/translate'

const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label'] as const
const runtimeTranslations = new Map<string, string>()
const pendingRuntimeText = new Set<string>()
let runtimeTimer: number | undefined

function shouldTranslateAtRuntime(value: string) {
  const text = value.trim()
  return (
    window.location.pathname.startsWith('/admin') &&
    /[A-Za-z]{2}/.test(text) &&
    !/^https?:\/\//i.test(text) &&
    !/^[A-Z0-9._/+:-]{1,12}$/.test(text)
  )
}

function queueRuntimeTranslation(value: string) {
  const text = value.trim()
  if (!shouldTranslateAtRuntime(text) || runtimeTranslations.has(text)) return
  pendingRuntimeText.add(text)
  window.clearTimeout(runtimeTimer)
  runtimeTimer = window.setTimeout(async () => {
    const texts = [...pendingRuntimeText]
    pendingRuntimeText.clear()
    if (!texts.length) return
    try {
      const response = await fetch('/api/translate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts, to: 'ar' }),
      })
      if (!response.ok) return
      const data = await response.json() as { translations?: Record<string, string> }
      Object.entries(data.translations || {}).forEach(([source, translated]) => {
        runtimeTranslations.set(source, translated)
      })
      localizeElement(document.body, 'ar')
    } catch {
      // Keep the original copy when the optional runtime translation service is unavailable.
    }
  }, 80)
}

function localizeElement(root: ParentNode, language: string) {
  if (language !== 'ar') return

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text)

  textNodes.forEach((node) => {
    if (node.parentElement?.closest('script, style, code, pre, [data-no-translate]')) return
    const original = node.nodeValue || ''
    const trimmed = original.trim()
    const runtime = runtimeTranslations.get(trimmed)
    const localized = runtime
      ? original.replace(trimmed, runtime)
      : translateUiText(original, language)
    if (localized !== node.nodeValue) node.nodeValue = localized
    else queueRuntimeTranslation(original)
  })

  const elements =
    root instanceof Element ? [root, ...root.querySelectorAll<HTMLElement>('*')] : [...root.querySelectorAll<HTMLElement>('*')]
  elements.forEach((element) => {
    if (element.closest('[data-no-translate]')) return
    TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
      const value = element.getAttribute(attribute)
      if (!value) return
      const localized = runtimeTranslations.get(value.trim()) || translateUiText(value, language)
      if (localized !== value) element.setAttribute(attribute, localized)
      else queueRuntimeTranslation(value)
    })
  })
}

export default function ArabicLocalizer() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      document.documentElement.lang = 'en'
      document.documentElement.dir = 'ltr'
      document.body.classList.remove('is-arabic')
      return
    }

    const language = localStorage.getItem('t24_lang') || 'ar'
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.body.classList.toggle('is-arabic', language === 'ar')

    if (language !== 'ar') return
    localizeElement(document.body, language)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData' && mutation.target.parentNode) {
          localizeElement(mutation.target.parentNode, language)
        }
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) localizeElement(node, language)
          else if (node.nodeType === Node.TEXT_NODE && node.parentNode) localizeElement(node.parentNode, language)
        })
      })
    })
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => {
      observer.disconnect()
      window.clearTimeout(runtimeTimer)
    }
  }, [pathname])

  return null
}
