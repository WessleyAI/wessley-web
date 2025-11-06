'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { WaitlistHeader } from '@/components/waitlist/WaitlistHeader'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { TwitterIcon } from '@/components/ui/twitter-icon'

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
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
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
          className="relative w-full"
          style={{
            paddingLeft: 'var(--spacing-3xl)',
            paddingRight: 'var(--spacing-3xl)',
            paddingTop: 'calc(15vh - 4.5%)',
            zIndex: 3
          }}
        >
          {/* Title row - Wessley + Automotive Intelligence with description */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--spacing-3xl)',
              marginLeft: '-2%'
            }}
          >
            {/* Left side - Wessley and Automotive Intelligence stacked */}
            <div>
              <h2
                style={{
                  fontSize: 'calc(var(--font-size-4xl) * 0.9)',
                  lineHeight: 'var(--line-height-tight)',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontFamily: 'var(--font-dm-sans)',
                  color: '#8BE196',
                  whiteSpace: 'nowrap',
                  letterSpacing: 'var(--letter-spacing-tight)',
                  marginBottom: 'var(--spacing-sm)'
                }}
              >
                Wessley
              </h2>
              <h1
                style={{
                  fontSize: 'calc(var(--font-size-4xl) * 0.72)',
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
              style={{
                fontSize: 'calc(var(--font-size-md) * 0.9)',
                lineHeight: '1.5',
                fontWeight: 'var(--font-weight-regular)',
                fontFamily: 'var(--font-dm-sans)',
                color: '#ffffff',
                textAlign: 'left',
                maxWidth: '33.15rem',
                marginTop: '3%'
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
        {/* Car Illustration - Top Right (not pushed down) */}
        <div className="absolute top-24 z-10" style={{ right: '23%' }}>
          <img
            src="/second/car-illus.svg"
            alt="Car Illustration"
            className="w-full h-auto"
            style={{ maxWidth: '700px' }}
          />
        </div>

        {/* Text Content - Pushed down */}
        <div className="relative z-10 w-full px-16 flex-1 flex items-start" style={{ paddingTop: 'calc(24px + 25vh)' }}>
          <div className="flex flex-col gap-6 shrink-0" style={{ maxWidth: '360px' }}>
            <h2
              style={{
                fontSize: '3.25rem',
                fontWeight: 'var(--font-weight-regular)',
                fontFamily: 'var(--font-dm-sans)',
                color: '#EBFFEA',
                lineHeight: 1.2
              }}
            >
              A virtual garage, AI-Assisted.
            </h2>
            <p
              style={{
                fontSize: '0.9375rem',
                fontWeight: 'var(--font-weight-regular)',
                fontFamily: 'var(--font-dm-sans)',
                color: '#EBFFEA',
                lineHeight: 1.5
              }}
            >
              Wessley maps your car&apos;s electrical<br />
              system — in 3D.<br />
              See how every wire, relay, and<br />
              connection works together, and let AI<br />
              guide your repairs.
            </p>
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

      {/* Section 3 - Explore (150vh) */}
      <section
        className="relative w-full flex items-start justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/sections/background-3.svg)`,
          minHeight: '150vh'
        }}
      >
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
          <div className="w-full max-w-7xl mx-auto px-16 pt-32 pb-16 flex flex-col items-center text-center">
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

          {/* Explore Component - To be added */}
          <div className="w-full py-8">
            {/* Placeholder for Explore component */}
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
