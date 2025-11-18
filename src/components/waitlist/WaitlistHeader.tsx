'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export function WaitlistHeader() {
  const router = useRouter()
  const realButtonRef = useRef<HTMLAnchorElement>(null)
  const buttonTextRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(true)

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

      // Animate font size from 24px to 12px (scaled by sizer for start only)
      const startFontSize = 24 * sizer
      const endFontSize = 12 // Keep end size fixed at 12px for readability
      const fontSize = startFontSize - ((startFontSize - endFontSize) * progress)
      buttonTextRef.current.style.fontSize = `${fontSize}px`

      // Animate padding from 54px/12px to 0 (scaled by sizer for start only)
      const startPaddingTop = 54 * sizer
      const startPaddingBottom = 12 * sizer
      const paddingTop = startPaddingTop - (startPaddingTop * progress)
      const paddingBottom = startPaddingBottom - (startPaddingBottom * progress)
      realButtonRef.current.style.paddingTop = `${paddingTop}px`
      realButtonRef.current.style.paddingBottom = `${paddingBottom}px`

      // Animate button height to match navbar (42px total at end, fixed)
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
        color: '#F5F5F5',
        backgroundColor: 'transparent',
        mixBlendMode: 'exclusion',
        transition: 'color 0.3s ease, mix-blend-mode 0.3s ease, opacity 0.3s ease, transform 0.3s ease',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {/* Logo and Brand */}
      <Link href="/" className="flex items-start gap-3 md:gap-3 gap-1.5" style={{ fontFamily: 'var(--font-head)' }}>
        <motion.img
          src="/header/logo.svg"
          alt="Wessley Logo"
          className="w-7 h-7"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="text-[8px] md:text-[12px] font-medium tracking-wider"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          WESSLEY
        </motion.span>
        <div className="h-6 w-px bg-white opacity-30" />
        <motion.span
          className="text-[8px] md:text-[12px] font-light tracking-wider max-w-[50%] leading-tight"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          AUTOMOTIVE INTELLIGENCE
        </motion.span>
      </Link>

      {/* Navigation Links and Button */}
      <div className="flex items-center gap-8 md:gap-8 gap-2 ml-auto" style={{ fontFamily: 'var(--font-head)' }}>
        {/* Hide on mobile - show only on md and up */}
        <motion.div
          whileHover={{
            backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
          }}
          style={{
            border: '1px solid transparent',
            borderRadius: '8px',
            padding: '6px 12px',
          }}
          transition={{ duration: 0.2 }}
          className="hidden md:block"
        >
          <Link
            href="https://github.com/wessleyai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[8px] md:text-[12px] font-medium tracking-wider"
          >
            ABOUT
          </Link>
        </motion.div>
        <motion.div
          whileHover={{
            backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
          }}
          style={{
            border: '1px solid transparent',
            borderRadius: '8px',
            padding: '6px 12px',
          }}
          transition={{ duration: 0.2 }}
          className="hidden md:block"
        >
          <Link
            href="https://linkedin.com/in/saharbarak"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[8px] md:text-[12px] font-medium tracking-wider"
          >
            CONTACT
          </Link>
        </motion.div>

        {/* Demo Button */}
        <motion.button
          onClick={() => router.push('/g/cde0ea8e-07aa-4c59-a72b-ba0d56020484/project')}
          whileHover={{
            backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
          }}
          style={{
            border: '1px solid rgba(250, 250, 250, 0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
          transition={{ duration: 0.2 }}
          className="hidden md:block text-[8px] md:text-[12px] font-medium tracking-wider"
        >
          DEMO
        </motion.button>

        {/* Animated Insider Button */}
        <motion.a
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
            paddingLeft: 'calc(var(--sizer) * 1.5rem)',
            paddingRight: 'calc(var(--sizer) * 1.5rem)',
            paddingTop: 'calc(var(--sizer) * 3.375rem)',
            paddingBottom: 'calc(var(--sizer) * 0.75rem)',
            borderBottomLeftRadius: 'var(--border-radius)',
            textDecoration: 'none',
            flexShrink: 0,
            minHeight: 'calc(var(--sizer) * 6.75rem)',
            maxWidth: 'calc(var(--sizer) * 8rem)',
            cursor: 'pointer',
          }}
          whileHover={{
            backgroundColor: '#7dd085',
            color: '#FFFFFF',
            scale: 1.02,
          }}
          transition={{ duration: 0.2 }}
        >
          <div
            ref={buttonTextRef}
            style={{
              fontWeight: 500,
              textTransform: 'capitalize',
              transition: 'font-size 0.1s ease',
              whiteSpace: 'normal',
              textAlign: 'left',
              lineHeight: '0.9',
              fontFamily: 'var(--font-head)',
              wordWrap: 'break-word',
            }}
          >
            Become<br />An Insider
          </div>
        </motion.a>
      </div>
    </header>
  )
}
