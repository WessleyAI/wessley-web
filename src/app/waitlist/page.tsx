'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { WaitlistHeader } from '@/components/waitlist/WaitlistHeader'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { TwitterIcon } from '@/components/ui/twitter-icon'
import { ExploreSection } from '@/components/waitlist/explore/ExploreSection'
import { NavigationOverlay } from '@/components/waitlist/explore/NavigationOverlay'

export default function Waitlist() {
  const [marketplaceTab, setMarketplaceTab] = useState<'buy' | 'sell'>('buy')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Animation for floating car illustration
  const floatAnimation = {
    y: [-15, 15, -15],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

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
              <h1
                className="hero-title-spacing"
                style={{
                  color: '#8BE196',
                  whiteSpace: 'nowrap',
                }}
              >
                Wessley
              </h1>
              <h2
                style={{
                  color: '#ffffff',
                  whiteSpace: 'nowrap'
                }}
              >
                Automotive Intelligence
              </h2>
            </div>

            {/* Right side - Description text */}
            <p
              className="hero-description"
              style={{
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
              animate={floatAnimation}
            />
          </div>

          {/* Text Content - Pushed down */}
          <div className="section2-content-wrapper">
            <div className="section2-text-container">
              <h3 className="section2-header">
                A virtual<br />
                garage,<br />
                AI-Assisted.
              </h3>
              <h4 className="section2-description">
                Wessley maps your car&apos;s electrical<br />
                system — in 3D.<br />
                See how every wire, relay, and<br />
                connection works together, and let AI<br />
                guide your repairs.
              </h4>
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
            {/* Plus Icon - Left */}
            <motion.button
              className="p-2 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4V16M4 10H16" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>

            <input
              placeholder="Ask anything"
              className="flex-1 bg-transparent border-none text-black placeholder-gray-600 focus:ring-0 focus:border-none font-medium focus:outline-none text-base px-2"
            />

            {/* Microphone Icon */}
            <motion.button
              className="p-2 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" fill="#000000"/>
                <path d="M17 11C17 14.31 14.31 17 11 17H11C7.69 17 5 14.31 5 11" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 17V22" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 22H15" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>

            {/* Send Arrow Icon - Right */}
            <motion.button
              className="p-2 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
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
            <Image
              src="/third/explore.svg"
              alt="Explore"
              width={20}
              height={20}
              style={{
                filter: 'invert(1)',
                opacity: 1.0,
              }}
            />
          </motion.button>
        </div>

        {/* Content Container */}
        <div className="w-full flex flex-col items-center">
          {/* Header Section */}
          <div className="w-full max-w-7xl mx-auto px-16 pt-16 pb-8 flex flex-col items-center text-center">
            {/* Header */}
            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>
              Builders. Dreamers. Engineers.
            </h3>

            {/* Subheader */}
            <h4>
              Meet the people shaping the future of restoration.<br />
              Wessley unites human creativity with automotive intelligence.
            </h4>
          </div>

          {/* Explore Component */}
          <div className="w-full py-8">
            <ExploreSection />
          </div>
        </div>
      </section>

      {/* Section 4 - Marketplace */}
      <section
        className="relative w-full h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/sections/background-4.svg)` }}
      >
        {/* Marketplace Header - Top Right */}
        <div className="absolute top-0 right-0 z-10">
          <motion.div
            className="flex items-center gap-3 px-6 py-4"
            style={{
              borderBottomLeftRadius: 'var(--border-radius)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-medium)',
              backgroundColor: '#EBFFE9',
              color: '#463B47',
            }}
          >
            Marketplace
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between px-16 py-16">
          {/* Buy/Sell Tabs - Top Left */}
          <div className="flex gap-0">
            <motion.button
              onClick={() => setMarketplaceTab('buy')}
              style={{
                borderTopLeftRadius: 'var(--border-radius)',
                borderBottomLeftRadius: 'var(--border-radius)',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: 'calc(var(--sizer) * 0.75rem)',
                fontWeight: 'var(--font-weight-medium)',
                backgroundColor: marketplaceTab === 'buy' ? '#463B47' : '#D9D9D9',
                color: '#C4C4C4',
                opacity: marketplaceTab === 'buy' ? 1 : 0.8,
                paddingLeft: 'calc(var(--sizer) * 1.5rem)',
                paddingRight: 'calc(var(--sizer) * 1.5rem)',
                paddingTop: 'calc(var(--sizer) * 0.875rem)',
                paddingBottom: 'calc(var(--sizer) * 0.875rem)',
                width: 'calc(var(--sizer) * 8rem)',
                height: 'calc(var(--sizer) * 3rem)',
              }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              Buy Parts
            </motion.button>
            <motion.button
              onClick={() => setMarketplaceTab('sell')}
              style={{
                borderTopRightRadius: 'var(--border-radius)',
                borderBottomRightRadius: 'var(--border-radius)',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: 'calc(var(--sizer) * 0.75rem)',
                fontWeight: 'var(--font-weight-medium)',
                backgroundColor: marketplaceTab === 'sell' ? '#463B47' : '#D9D9D9',
                color: '#C4C4C4',
                opacity: marketplaceTab === 'sell' ? 1 : 0.8,
                paddingLeft: 'calc(var(--sizer) * 1.5rem)',
                paddingRight: 'calc(var(--sizer) * 1.5rem)',
                paddingTop: 'calc(var(--sizer) * 0.875rem)',
                paddingBottom: 'calc(var(--sizer) * 0.875rem)',
                width: 'calc(var(--sizer) * 8rem)',
                height: 'calc(var(--sizer) * 3rem)',
              }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              Sell Parts
            </motion.button>
          </div>

          {/* Right-aligned content - Bottom Right */}
          <div className="ml-auto max-w-2xl text-right self-end">
            <h3 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-accent-green-light)' }}>
              Less Searching.
              <br />
              More Building.
            </h3>
            <h4 style={{ color: 'var(--color-accent-green-light)' }}>
              Wessley bridges the trade between restorers,
              <br />
              spare parts, junkyard finds, stores and after-
              <br />
              market inventory verified and matched by AI.
              <br />
              You focus on the build — it finds what fits.
            </h4>
          </div>
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
