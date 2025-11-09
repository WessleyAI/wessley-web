'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export function WaitlistHeader() {
  const realButtonRef = useRef<HTMLAnchorElement>(null)
  const buttonTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!realButtonRef.current || !buttonTextRef.current) return

      const scrollY = window.scrollY
      const maxScroll = 300

      // Get sizer value from CSS
      const sizer = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sizer')) || 1

      // Calculate progress (0 to 1)
      const progress = Math.min(scrollY / maxScroll, 1)

      // Animate font size from 30px to 12px (scaled by sizer for start only)
      const startFontSize = 30 * sizer
      const endFontSize = 12 // Keep end size fixed at 12px for readability
      const fontSize = startFontSize - ((startFontSize - endFontSize) * progress)
      buttonTextRef.current.style.fontSize = `${fontSize}px`

      // Animate padding from 90px/12px to 0 (scaled by sizer for start only)
      const startPaddingTop = 90 * sizer
      const startPaddingBottom = 12 * sizer
      const paddingTop = startPaddingTop - (startPaddingTop * progress)
      const paddingBottom = startPaddingBottom - (startPaddingBottom * progress)
      realButtonRef.current.style.paddingTop = `${paddingTop}px`
      realButtonRef.current.style.paddingBottom = `${paddingBottom}px`

      // Animate button height to match navbar (42px total at end, fixed)
      const startHeight = 180 * sizer
      const endHeight = 42 // Keep navbar height fixed
      const minHeight = startHeight - (startHeight * progress) + (endHeight * progress)
      realButtonRef.current.style.minHeight = `${minHeight}px`

      // Change to uppercase when scrolled
      buttonTextRef.current.style.textTransform = progress > 0.5 ? 'uppercase' : 'capitalize'

      // Change alignment from items-end to items-center when scrolling
      realButtonRef.current.style.alignItems = progress > 0.3 ? 'center' : 'flex-end'
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll) // Re-calculate on resize
    handleScroll() // Initial call
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center pl-4"
      style={{
        height: '42px',
        color: '#D7D7D7',
        backgroundColor: 'transparent',
        mixBlendMode: 'exclusion',
        transition: 'color 0.3s ease, mix-blend-mode 0.3s ease'
      }}
    >
      {/* Logo and Brand */}
      <Link href="/" className="flex items-start gap-3 md:gap-3 gap-1.5" style={{ fontFamily: 'var(--font-dm-sans)' }}>
        <img
          src="/header/logo.svg"
          alt="Wessley Logo"
          className="w-7 h-7"
        />
        <span className="text-[8px] md:text-[12px] font-medium tracking-wider">WESSLEY</span>
        <div className="h-6 w-px bg-white opacity-30" />
        <span className="text-[8px] md:text-[12px] font-light tracking-wider max-w-[50%] leading-tight">AUTOMOTIVE INTELLIGENCE</span>
      </Link>

      {/* Navigation Links and Button */}
      <div className="flex items-center gap-8 md:gap-8 gap-2 ml-auto" style={{ fontFamily: 'var(--font-dm-sans)' }}>
        <Link
          href="/about"
          className="text-[8px] md:text-[12px] font-medium tracking-wider hover:opacity-70 transition-opacity"
        >
          ABOUT
        </Link>
        <Link
          href="/contact"
          className="text-[8px] md:text-[12px] font-medium tracking-wider hover:opacity-70 transition-opacity"
        >
          CONTACT
        </Link>
        <Link
          href="/signin"
          className="text-[8px] md:text-[12px] font-medium tracking-wider hover:opacity-70 transition-opacity hidden md:block"
        >
          SIGN IN
        </Link>

        {/* Animated Insider Button */}
        <a
          ref={realButtonRef}
          href="#"
          className="flex items-end"
          style={{
            backgroundColor: '#8BE196',
            color: '#000',
            paddingLeft: 'calc(var(--sizer) * 1.125rem)',
            paddingRight: 'calc(var(--sizer) * 1.125rem)',
            paddingTop: 'calc(var(--sizer) * 5.625rem)',
            paddingBottom: 'calc(var(--sizer) * 0.75rem)',
            borderBottomLeftRadius: 'var(--border-radius)',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            flexShrink: 0,
            minHeight: 'calc(var(--sizer) * 11.25rem)',
            maxWidth: 'calc(var(--sizer) * 9.1875rem)'
          }}
        >
          <div
            ref={buttonTextRef}
            style={{
              fontSize: 'calc(var(--sizer) * 1.875rem)',
              fontWeight: 500,
              textTransform: 'capitalize',
              transition: 'font-size 0.1s ease',
              whiteSpace: 'normal',
              textAlign: 'left',
              lineHeight: '0.8',
              fontFamily: 'var(--font-dm-sans)',
              wordWrap: 'break-word'
            }}
          >
            Become an Insider
          </div>
        </a>
      </div>
    </header>
  )
}
