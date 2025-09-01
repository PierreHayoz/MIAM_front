"use client";
import { useLenis } from 'lenis/react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTopLenis() {
  const lenis = useLenis()
  const pathname = usePathname()

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    }
  }, [pathname, lenis])

  return null
}
