'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function WaitlistHeader() {
  const realButtonRef = useRef<HTMLAnchorElement>(null)
  const buttonTextRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [showComingSoon, setShowComingSoon] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!realButtonRef.current || !buttonTextRef.current || !headerRef.current) return

      const scrollY = window.scrollY
      const maxScroll = 300

      // Check if we're at the footer (only on desktop)
      const isMobile = window.innerWidth < 768
      const footer = document.querySelector('footer')

      if (footer && !isMobile) {
        const footerTop = footer.getBoundingClientRect().top
        const windowHeight = window.innerHeight

        // Hide header when footer enters viewport
        if (footerTop <= windowHeight) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
      } else if (isMobile) {
        // Always show navbar on mobile
        setIsVisible(true)
      }

      // Get sizer value from CSS
      const sizer = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sizer')) || 1

      // Calculate progress (0 to 1)
      const progress = Math.min(scrollY / maxScroll, 1)

      // Animate font size from 30px to 12px (scaled by sizer for start only)
      const startFontSize = 30 * sizer
      const endFontSize = 12 // Keep end size fixed at 12px for readability
      const fontSize = startFontSize - ((startFontSize - endFontSize) * progress)
      buttonTextRef.current.style.fontSize = `${fontSize}px`

      // Animate padding from 54px/12px to 0 (scaled by sizer for start only) - 40% smaller
      const startPaddingTop = 54 * sizer
      const startPaddingBottom = 12 * sizer
      const paddingTop = startPaddingTop - (startPaddingTop * progress)
      const paddingBottom = startPaddingBottom - (startPaddingBottom * progress)
      realButtonRef.current.style.paddingTop = `${paddingTop}px`
      realButtonRef.current.style.paddingBottom = `${paddingBottom}px`

      // Animate button height to match navbar (42px total at end, fixed) - 40% smaller start
      const startHeight = 108 * sizer
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
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-[70] flex items-center pl-4"
      style={{
        height: '42px',
        color: '#D7D7D7',
        backgroundColor: 'transparent',
        mixBlendMode: 'exclusion',
        transition: 'color 0.3s ease, mix-blend-mode 0.3s ease, opacity 0.3s ease, transform 0.3s ease',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        pointerEvents: isVisible ? 'auto' : 'none',
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
        <motion.div
          whileHover={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}
          style={{
            border: '1px solid transparent',
            borderRadius: '4px',
            padding: '4px 8px',
          }}
          transition={{ duration: 0.2 }}
        >
          <Link
            href="/about"
            className="text-[8px] md:text-[12px] font-medium tracking-wider"
          >
            ABOUT
          </Link>
        </motion.div>
        <motion.div
          whileHover={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}
          style={{
            border: '1px solid transparent',
            borderRadius: '4px',
            padding: '4px 8px',
          }}
          transition={{ duration: 0.2 }}
        >
          <Link
            href="/contact"
            className="text-[8px] md:text-[12px] font-medium tracking-wider"
          >
            CONTACT
          </Link>
        </motion.div>
        <div
          className="relative hidden md:block"
          onMouseEnter={() => setShowComingSoon(true)}
          onMouseLeave={() => setShowComingSoon(false)}
        >
          <motion.div
            whileHover={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
            style={{
              border: '1px solid transparent',
              borderRadius: '4px',
              padding: '4px 8px',
            }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/signin"
              className="text-[8px] md:text-[12px] font-medium tracking-wider"
              onClick={(e) => e.preventDefault()}
            >
              {showComingSoon ? 'COMING SOON!!' : 'SIGN IN'}
            </Link>
          </motion.div>
        </div>

        {/* Animated Insider Button */}
        <a
          ref={realButtonRef}
          href="#"
          onClick={(e) => {
            e.preventDefault()
            const waitlistSection = document.getElementById('waitlist-section')
            waitlistSection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
          className="flex items-end"
          style={{
            backgroundColor: '#8BE196',
            color: '#000',
            paddingLeft: 'calc(var(--sizer) * 1.125rem)',
            paddingRight: 'calc(var(--sizer) * 1.125rem)',
            paddingTop: 'calc(var(--sizer) * 3.375rem)',
            paddingBottom: 'calc(var(--sizer) * 0.75rem)',
            borderBottomLeftRadius: 'var(--border-radius)',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            flexShrink: 0,
            minHeight: 'calc(var(--sizer) * 6.75rem)',
            maxWidth: 'calc(var(--sizer) * 5.5125rem)',
            cursor: 'pointer',
            mixBlendMode: 'normal',
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
              lineHeight: '0.9',
              fontFamily: 'var(--font-dm-sans)',
              wordWrap: 'break-word'
            }}
          >
            Become an<br />Insider
          </div>
        </a>
      </div>
    </header>
  )
}
