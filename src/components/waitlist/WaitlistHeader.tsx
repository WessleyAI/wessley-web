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

      // Calculate progress (0 to 1)
      const progress = Math.min(scrollY / maxScroll, 1)

      // Animate font size from 30px to 12px
      const fontSize = 30 - (18 * progress)
      buttonTextRef.current.style.fontSize = `${fontSize}px`

      // Animate padding from 90px/12px to 0
      const paddingTop = 90 - (90 * progress) // 90px -> 0px
      const paddingBottom = 12 - (12 * progress) // 12px -> 0px
      realButtonRef.current.style.paddingTop = `${paddingTop}px`
      realButtonRef.current.style.paddingBottom = `${paddingBottom}px`

      // Animate button height to match navbar (42px total at end)
      const minHeight = 180 - (180 * progress) + (42 * progress) // 180px -> 42px
      realButtonRef.current.style.minHeight = `${minHeight}px`

      // Change to uppercase when scrolled
      buttonTextRef.current.style.textTransform = progress > 0.5 ? 'uppercase' : 'capitalize'

      // Change alignment from items-end to items-center when scrolling
      realButtonRef.current.style.alignItems = progress > 0.3 ? 'center' : 'flex-end'
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
      <Link href="/" className="flex items-center gap-3" style={{ fontFamily: 'var(--font-dm-sans)' }}>
        <img
          src="/header/logo.svg"
          alt="Wessley Logo"
          className="w-7 h-7"
        />
        <span className="text-[8px] font-medium tracking-wider">WESSLEY</span>
        <div className="h-6 w-px bg-white/30" />
        <span className="text-[8px] font-light tracking-wider max-w-[50%]">AUTOMOTIVE INTELLIGENCE</span>
      </Link>

      {/* Navigation Links and Button */}
      <div className="flex items-center gap-8 ml-auto" style={{ fontFamily: 'var(--font-dm-sans)' }}>
        <Link
          href="/about"
          className="text-[10px] font-medium tracking-wider hover:opacity-70 transition-opacity"
        >
          ABOUT
        </Link>
        <Link
          href="/contact"
          className="text-[10px] font-medium tracking-wider hover:opacity-70 transition-opacity"
        >
          CONTACT
        </Link>
        <Link
          href="/signin"
          className="text-[10px] font-medium tracking-wider hover:opacity-70 transition-opacity"
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
            paddingLeft: '18px',
            paddingRight: '18px',
            paddingTop: '90px',
            paddingBottom: '12px',
            borderBottomLeftRadius: '8px',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            flexShrink: 0,
            minHeight: '180px',
            maxWidth: '147px'
          }}
        >
          <div
            ref={buttonTextRef}
            style={{
              fontSize: '30px',
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
