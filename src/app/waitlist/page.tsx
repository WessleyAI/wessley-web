'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { WaitlistHeader } from '@/components/waitlist/WaitlistHeader'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { TwitterIcon } from '@/components/ui/twitter-icon'
import { ExploreSection } from '@/components/waitlist/explore/ExploreSection'
import { NavigationOverlay } from '@/components/waitlist/explore/NavigationOverlay'

export default function Waitlist() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Lenis smooth scroll setup
    let lenis: any

    const initLenis = async () => {
      const Lenis = (await import('lenis')).default
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')

      gsap.registerPlugin(ScrollTrigger)

      lenis = new Lenis({
        lerp: 0.1,
        wheelMultiplier: 0.9,
        gestureOrientation: 'vertical',
        smoothTouch: false
      })

      // Sync Lenis with GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update)

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000)
      })

      gsap.ticker.lagSmoothing(0)
    }

    initLenis()

    return () => {
      if (lenis) {
        lenis.destroy()
      }
    }
  }, [])

  return (
    <div className="relative w-full" ref={scrollRef}>
      <WaitlistHeader />

      {/* Section 1 - Hero with Video */}
      <section className="relative w-full h-screen flex items-start overflow-hidden">
        {/* Full screen video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1, transform: 'scale(1.2)' }}
        >
          <source src="/sections/background-1.mp4" type="video/mp4" />
        </video>

        {/* Partial background section - only covers text area */}
        <div
          className="absolute left-0 right-0 bg-cover bg-center bg-no-repeat"
          style={{
            top: 0,
            height: 'calc((15vh + var(--spacing-3xl) * 3 - 2vh) * 0.83)',
            zIndex: 2,
            backgroundImage: `url(/sections/background-2.svg)`,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            opacity: 0.98
          }}
        />

        {/* Floating Buttons - positioned within section 1 */}
        <>
          {/* Theme toggle - bottom left */}
          <div className="absolute bottom-6 left-6" style={{ zIndex: 50 }}>
            <ThemeToggle />
          </div>

          {/* Twitter/X button - bottom right */}
          <div className="absolute bottom-6 right-6" style={{ zIndex: 50 }}>
            <motion.button
              className="text-white bg-transparent border-none cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <TwitterIcon className="h-8 w-8" />
            </motion.button>
          </div>
        </>

        {/* Hero content */}
        <div
          className="relative w-full hero-section-padding"
          style={{
            zIndex: 3
          }}
        >
          {/* Title row - Wessley + Automotive Intelligence with description */}
          <div className="hero-content-wrapper">
            {/* Left side - Wessley and Automotive Intelligence stacked */}
            <div>
              <h2
                className="hero-title-wessley hero-title-spacing"
                style={{
                  lineHeight: 'var(--line-height-tight)',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontFamily: 'var(--font-dm-sans)',
                  color: '#8BE196',
                  whiteSpace: 'nowrap',
                  letterSpacing: 'var(--letter-spacing-tight)'
                }}
              >
                Wessley
              </h2>
              <h1
                className="hero-title-automotive"
                style={{
                  lineHeight: 'var(--line-height-tight)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-dm-sans)',
                  color: '#ffffff',
                  letterSpacing: 'var(--letter-spacing-tight)',
                  whiteSpace: 'nowrap'
                }}
              >
                Automotive Intelligence
              </h1>
            </div>

            {/* Right side - Description text */}
            <p
              className="hero-description"
              style={{
                fontSize: 'calc(var(--font-size-md) * 0.8415)',
                fontWeight: 'var(--font-weight-regular)',
                fontFamily: 'var(--font-dm-sans)',
                color: '#ffffff',
                maxWidth: '33.15rem'
              }}
            >
              Wessley understands every circuit,
              <br />
              system, and connection in your car.
              <br />
              It helps you diagnose faults, plan repairs, and discover exactly what parts you need — instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 - Virtual Garage */}
      <section
        className="relative w-full h-screen flex flex-col justify-between bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/sections/background-2.svg)` }}
      >
        <div className="section2-container">
          {/* Car Illustration - Top Right (not pushed down) */}
          <div className="section2-car-illustration">
            <motion.img
              src="/second/car-illus.svg"
              alt="Car Illustration"
              className="w-full h-auto"
              style={{ maxWidth: '700px' }}
              initial={{ y: 0 }}
              animate={{
                y: [0, -15, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "loop"
              }}
            />
          </div>

          {/* Text Content - Pushed down */}
          <div className="section2-content-wrapper">
            <div className="section2-text-container">
              <h2 className="section2-header">
                A virtual<br />
                garage, AI-Assisted.
              </h2>
              <p className="section2-description">
                Wessley maps your car&apos;s electrical<br />
                system — in 3D.<br />
                See how every wire, relay, and<br />
                connection works together, and let AI<br />
                guide your repairs.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom - Chat Input (full width) */}
        <div className="relative z-10 w-full px-16 pb-16">
          <motion.div
            className="flex items-center gap-3 bg-[#EBFFEA] p-5 max-w-5xl mx-auto"
            style={{ borderRadius: 'var(--border-radius)' }}
            whileHover={{ backgroundColor: "#d8ffe5" }}
            transition={{ duration: 0.2 }}
          >
            <input
              placeholder="Ask anything"
              className="flex-1 bg-transparent border-none text-black placeholder-gray-600 focus:ring-0 focus:border-none font-medium focus:outline-none text-base px-4"
            />
          </motion.div>
        </div>
      </section>

      {/* Section 3 - Explore (100vh) */}
      <section
        className="relative w-full flex items-start justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/sections/background-3.svg)`,
          minHeight: '100vh'
        }}
      >
        {/* Navigation Overlay - Left Side */}
        <NavigationOverlay />

        {/* Explore Tab - Top Right */}
        <div className="absolute top-0 right-0 z-10">
          <motion.button
            className="flex items-center gap-3 bg-[#515151] text-white px-6 py-4"
            style={{
              borderBottomLeftRadius: 'var(--border-radius)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-regular)'
            }}
            whileHover={{ backgroundColor: "#3a3a3a" }}
            transition={{ duration: 0.2 }}
          >
            Explore
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
              <circle cx="10" cy="10" r="3" fill="currentColor"/>
            </svg>
          </motion.button>
        </div>

        {/* Content Container */}
        <div className="w-full flex flex-col items-center">
          {/* Header Section */}
          <div className="w-full max-w-7xl mx-auto px-16 pt-16 pb-8 flex flex-col items-center text-center">
            {/* Header */}
            <h2
              style={{
                fontSize: '3.25rem',
                fontWeight: 'var(--font-weight-regular)',
                fontFamily: 'var(--font-dm-sans)',
                color: 'var(--color-text-light)',
                lineHeight: 1.2,
                marginBottom: 'var(--spacing-lg)'
              }}
            >
              Builders. Dreamers. Engineers.
            </h2>

            {/* Subheader */}
            <p
              style={{
                fontSize: '0.9375rem',
                fontWeight: 'var(--font-weight-regular)',
                fontFamily: 'var(--font-dm-sans)',
                color: 'var(--color-text-light)',
                lineHeight: 1.5
              }}
            >
              Meet the people shaping the future of restoration.<br />
              Wessley unites human creativity with automotive intelligence.
            </p>
          </div>

          {/* Explore Component */}
          <div className="w-full py-8">
            <ExploreSection />
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section
        className="relative w-full h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/sections/background-4.svg)` }}
      >
        <div className="relative z-10">
          {/* Content for section 4 - to be added later */}
        </div>
      </section>

      {/* Section 5 */}
      <section
        className="w-full h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/sections/background-5.svg)` }}
      >
        {/* Content for section 5 - to be added later */}
      </section>
    </div>
  )
}
