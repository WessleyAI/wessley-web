'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { WaitlistHeader } from '@/components/waitlist/WaitlistHeader'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { TwitterIcon } from '@/components/ui/twitter-icon'
import { ExploreSection } from '@/components/waitlist/explore/ExploreSection'
import { NavigationOverlay } from '@/components/waitlist/explore/NavigationOverlay'
import { Footer } from '@/components/waitlist/Footer'
import { FooterMobile } from '@/components/waitlist/FooterMobile'
import { PartsMasonryGrid } from '@/components/waitlist/marketplace/parts-masonry-grid'
import { SellerProfileHeader } from '@/components/waitlist/marketplace/seller-profile-header'
import { DashboardView } from '@/components/waitlist/marketplace/dashboard-view'

type UrgencyLevel = 'urgent' | 'soon' | 'optional'
type Priority = 'high' | 'medium' | 'low'

interface RestorationSupply {
  name: string
  price: number
  selected: boolean
}

interface Part {
  id: string
  name: string
  urgency: UrgencyLevel
  priority: Priority
  aiVerified: boolean
  priceRange: string
  topPrice: string
  sellerName: string
  sellerInitials: string
  sellerRating: number
  sellerDistance: string
  sellerCount: number
  imageUrl?: string
  restorationSupplies?: RestorationSupply[]
}

interface CarData {
  id: string
  name: string
  imageUrl: string
  make: string
  model: string
  year: number
  vin: string
  mileage: string
  partsListed: number
  partsSold: number
  totalRevenue: number
  rating: number
  pendingRequests: number
}

export default function Waitlist() {
  const [marketplaceTab, setMarketplaceTab] = useState<'buy' | 'sell'>('buy')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
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

  // Marketplace state and handlers
  const [cartItems, setCartItems] = useState<Set<string>>(new Set())
  const [hoveredDiagnosis, setHoveredDiagnosis] = useState<string | null>(null)
  const [buyParts, setBuyParts] = useState<Part[]>([
    {
      id: '1',
      name: 'Alternator',
      urgency: 'urgent' as UrgencyLevel,
      priority: 'high' as Priority,
      aiVerified: true,
      priceRange: '$120-$180',
      topPrice: '$145',
      sellerName: 'Auto Parts Pro',
      sellerInitials: 'AP',
      sellerRating: 4.9,
      sellerDistance: '2.3 mi',
      sellerCount: 8,
      imageUrl: 'https://images.unsplash.com/photo-1654166827605-974dd2e9bb1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHRlcm5hdG9yJTIwYXV0b21vdGl2ZXxlbnwxfHx8fDE3NjIxOTU1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      restorationSupplies: [
        { name: 'Brushes Kit', price: 18, selected: true },
        { name: 'Voltage Regulator', price: 35, selected: true },
        { name: 'Bearing Kit', price: 28, selected: true },
        { name: 'Serpentine Belt', price: 42, selected: true },
      ],
    },
    {
      id: '2',
      name: 'Fuel Relay',
      urgency: 'urgent' as UrgencyLevel,
      priority: 'medium' as Priority,
      aiVerified: true,
      priceRange: '$35-$65',
      topPrice: '$42',
      sellerName: 'Mike Chen',
      sellerInitials: 'MC',
      sellerRating: 4.8,
      sellerDistance: '5.1 mi',
      sellerCount: 5,
      imageUrl: 'https://images.unsplash.com/photo-1654611842276-ffe361f5d16b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWxheSUyMGZ1c2UlMjBhdXRvbW90aXZlfGVufDF8fHx8MTc2MjE5NTU1OXww&ixlib=rb-4.1.0&q=80&w=1080',
      restorationSupplies: [
        { name: 'Socket Connector', price: 8, selected: true },
        { name: 'Contact Cleaner', price: 12, selected: true },
        { name: 'Dielectric Grease', price: 9, selected: true },
        { name: 'Wire Set', price: 15, selected: true },
      ],
    },
    {
      id: '3',
      name: 'Radiator',
      urgency: 'soon' as UrgencyLevel,
      priority: 'high' as Priority,
      aiVerified: true,
      priceRange: '$95-$165',
      topPrice: '$125',
      sellerName: 'CarParts Hub',
      sellerInitials: 'CH',
      sellerRating: 5.0,
      sellerDistance: '1.8 mi',
      sellerCount: 12,
      imageUrl: 'https://images.unsplash.com/photo-1760804462141-442810513d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjByYWRpYXRvciUyMGVuZ2luZXxlbnwxfHx8fDE3NjIxOTUzNDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      restorationSupplies: [
        { name: 'Coolant (1 Gal)', price: 22, selected: true },
        { name: 'Hose Set', price: 45, selected: true },
        { name: 'Hose Clamps', price: 12, selected: true },
        { name: 'Cap', price: 18, selected: true },
        { name: 'Thermostat', price: 32, selected: true },
        { name: 'Sealant', price: 14, selected: true },
      ],
    },
    {
      id: '4',
      name: 'Brake Pads (Front)',
      urgency: 'soon' as UrgencyLevel,
      priority: 'medium' as Priority,
      aiVerified: false,
      priceRange: '$45-$85',
      topPrice: '$58',
      sellerName: 'James Auto',
      sellerInitials: 'JA',
      sellerRating: 4.7,
      sellerDistance: '8.2 mi',
      sellerCount: 15,
      imageUrl: 'https://images.unsplash.com/photo-1750019487267-47568f388dfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFrZSUyMHBhZCUyMGRpc2N8ZW58MXx8fHwxNzYyMTk1NTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '5',
      name: 'Oil Filter',
      urgency: 'optional' as UrgencyLevel,
      priority: 'low' as Priority,
      aiVerified: false,
      priceRange: '$8-$18',
      topPrice: '$12',
      sellerName: 'QuickParts',
      sellerInitials: 'QP',
      sellerRating: 4.6,
      sellerDistance: '3.4 mi',
      sellerCount: 20,
      imageUrl: 'https://images.unsplash.com/photo-1643151663724-ab51858d5fe1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvaWwlMjBmaWx0ZXIlMjBhdXRvbW90aXZlfGVufDF8fHx8MTc2MjE5NTU1OXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '6',
      name: 'Spark Plugs (Set)',
      urgency: 'optional' as UrgencyLevel,
      priority: 'low' as Priority,
      aiVerified: false,
      priceRange: '$25-$55',
      topPrice: '$38',
      sellerName: 'Engine Masters',
      sellerInitials: 'EM',
      sellerRating: 4.8,
      sellerDistance: '4.7 mi',
      sellerCount: 18,
      imageUrl: 'https://images.unsplash.com/photo-1759832217256-244b5bc54882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGFyayUyMHBsdWclMjBlbmdpbmV8ZW58MXx8fHwxNzYyMTk1NTYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ])

  const [carsData] = useState<CarData[]>([
    {
      id: '1',
      name: '1973 Porsche 911 Carrera RS',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Porsche_911_Carrera_RS_2.7_1973_%2815521126459%29.jpg/800px-Porsche_911_Carrera_RS_2.7_1973_%2815521126459%29.jpg',
      make: 'Porsche',
      model: '911 Carrera RS',
      year: 1973,
      vin: 'WP0ZZZ91ZTS458712',
      mileage: '45,200 mi',
      partsListed: 28,
      partsSold: 18,
      totalRevenue: 12450,
      rating: 4.9,
      pendingRequests: 3,
    },
    {
      id: '2',
      name: '1965 Mini Cooper S',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Austin_Mini_Cooper_S_1964.jpg/800px-Austin_Mini_Cooper_S_1964.jpg',
      make: 'Mini',
      model: 'Cooper S',
      year: 1965,
      vin: 'XM2SA9X0000123456',
      mileage: '82,000 mi',
      partsListed: 42,
      partsSold: 35,
      totalRevenue: 8920,
      rating: 4.7,
      pendingRequests: 5,
    },
    {
      id: '3',
      name: '1971 Mercedes-Benz 280SL',
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxjbGFzc2ljJTIwY2FyfGVufDF8fHx8MTc2MjE5NTU2MHww&ixlib=rb-4.1.0&q=80&w=1080',
      make: 'Mercedes-Benz',
      model: '280SL',
      year: 1971,
      vin: 'WDB11304212345678',
      mileage: '58,500 mi',
      partsListed: 35,
      partsSold: 22,
      totalRevenue: 15680,
      rating: 5.0,
      pendingRequests: 2,
    },
  ])

  const handleToggleCart = (itemId: string) => {
    setCartItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleCompareOffers = () => {
    console.log('Compare offers clicked')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setSubmitMessage('Please enter your email')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitMessage('🎉 Welcome to the waitlist!')
        setEmail('')
      } else {
        setSubmitMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setSubmitMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
                maxWidth: '33.15rem',
                lineHeight: '1.5',
                letterSpacing: '0em'
              }}
            >
              Wessley understands every circuit, system, and connection in your car.
              <br />
              It helps you diagnose faults, plan repairs,
              <br />
              and discover exactly what parts you need — instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 - Virtual Garage */}
      <section
        className="relative w-full h-screen flex flex-col justify-between bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/sections/background-2.svg)` }}
      >
        {/* 3D AI Assistance Tab - Top Right */}
        <div className="absolute top-0 right-0 z-[80]">
          <motion.div
            className="flex items-center justify-center gap-2 md:gap-3"
            style={{
              borderBottomLeftRadius: 'var(--border-radius)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 'clamp(8px, 2vw, 12px)',
              fontWeight: 600,
              backgroundColor: '#EBFFEA',
              color: '#463B47',
              width: 'clamp(80px, 20vw, calc(var(--sizer) * 7.1rem))',
              height: '42px',
              paddingLeft: 'clamp(8px, 2vw, calc(var(--sizer) * 1.125rem))',
              paddingRight: 'clamp(8px, 2vw, calc(var(--sizer) * 1.125rem))',
              paddingTop: 0,
              paddingBottom: 0,
              textTransform: 'uppercase',
            }}
          >
            3D ASSIST
            <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>

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
              <h3 className="section2-header" style={{ lineHeight: '1.2', letterSpacing: '-0.02em' }}>
                A Virtual Garage,<br />
                AI-Assisted.
              </h3>
              <p className="section2-description" style={{ lineHeight: '1.5', letterSpacing: '0em' }}>
                Wessley maps your car&apos;s electrical system — in 3D.
                <br />
                See how every wire, relay, and connection works together,
                <br />
                and let AI guide your repairs.
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
        <div className="absolute top-0 right-0 z-[80]">
          <motion.button
            className="flex items-center justify-center gap-2 md:gap-3 bg-[#515151] text-white"
            style={{
              borderBottomLeftRadius: 'var(--border-radius)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 'clamp(8px, 2vw, 12px)',
              fontWeight: 600,
              width: 'clamp(80px, 20vw, calc(var(--sizer) * 7.1rem))',
              height: '42px',
              paddingLeft: 'clamp(8px, 2vw, calc(var(--sizer) * 1.125rem))',
              paddingRight: 'clamp(8px, 2vw, calc(var(--sizer) * 1.125rem))',
              paddingTop: 0,
              paddingBottom: 0,
              textTransform: 'uppercase',
            }}
            whileHover={{ backgroundColor: "#3a3a3a" }}
            transition={{ duration: 0.2 }}
          >
            EXPLORE
            <Image
              src="/third/explore.svg"
              alt="Explore"
              width={16}
              height={16}
              className="w-3 h-3 md:w-4 md:h-4"
              style={{
                filter: 'invert(1)',
                opacity: 1.0,
              }}
            />
          </motion.button>
        </div>

        {/* Content Container */}
        <div className="w-full flex flex-col items-start">
          {/* Header Section */}
          <div className="w-full max-w-7xl mx-auto px-16 pt-16 pb-8 flex flex-col items-start text-left">
            {/* Header */}
            <h3 style={{ marginBottom: 'var(--spacing-lg)', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
              Builders. Dreamers. Engineers.
            </h3>

            {/* Subheader */}
            <h4 style={{ lineHeight: '1.3', letterSpacing: '0em' }}>
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
        <div className="absolute top-0 right-0 z-[80]">
          <motion.div
            className="flex items-center justify-center gap-2 md:gap-3"
            style={{
              borderBottomLeftRadius: 'var(--border-radius)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 'clamp(8px, 2vw, 12px)',
              fontWeight: 600,
              backgroundColor: '#EBFFE9',
              color: '#463B47',
              width: 'clamp(100px, 25vw, calc(var(--sizer) * 7.1rem))',
              height: '42px',
              paddingLeft: 'clamp(8px, 2vw, calc(var(--sizer) * 1.125rem))',
              paddingRight: 'clamp(8px, 2vw, calc(var(--sizer) * 1.125rem))',
              paddingTop: 0,
              paddingBottom: 0,
              textTransform: 'uppercase',
            }}
          >
            MARKETPLACE
            <svg className="w-4 h-4 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full h-full flex flex-col px-16 py-16">
          {/* Top Section */}
          <div className="flex justify-between items-start">
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
                  backgroundColor: '#8BE196',
                  color: '#000',
                  opacity: marketplaceTab === 'buy' ? 1 : 0.8,
                  paddingLeft: 'calc(var(--sizer) * 0.542rem)',
                  paddingRight: 'calc(var(--sizer) * 1.084rem)',
                  paddingTop: 'calc(var(--sizer) * 0.903rem)',
                  paddingBottom: 'calc(var(--sizer) * 0.903rem)',
                  width: 'calc(var(--sizer) * 7.23rem)',
                  height: 'calc(var(--sizer) * 2.89rem)',
                }}
                whileHover={{ opacity: 1, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  opacity: marketplaceTab === 'buy' ? 1 : 0.8,
                }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
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
                  backgroundColor: '#8BE196',
                  color: '#000',
                  opacity: marketplaceTab === 'sell' ? 1 : 0.8,
                  paddingLeft: 'calc(var(--sizer) * 0.542rem)',
                  paddingRight: 'calc(var(--sizer) * 1.084rem)',
                  paddingTop: 'calc(var(--sizer) * 0.903rem)',
                  paddingBottom: 'calc(var(--sizer) * 0.903rem)',
                  width: 'calc(var(--sizer) * 7.23rem)',
                  height: 'calc(var(--sizer) * 2.89rem)',
                }}
                whileHover={{ opacity: 1, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  opacity: marketplaceTab === 'sell' ? 1 : 0.8,
                }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                Sell Parts
              </motion.button>
            </div>

            {/* Text content - Top Right */}
            <div className="max-w-2xl text-right">
              <h3 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-accent-green-light)', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
                Less Searching.
                <br />
                More Building.
              </h3>
              <h4 style={{ color: 'var(--color-accent-green-light)', lineHeight: '1.3', letterSpacing: '0em' }}>
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

          {/* Marketplace Content - HIDDEN FOR DESIGN SYSTEM WORK */}
          {/* <div className="flex-1 min-h-0 mt-6">
            {marketplaceTab === 'buy' && (
              <div className="h-full w-full">
                <PartsMasonryGrid
                  parts={buyParts}
                  onPartsChange={setBuyParts}
                  onCompare={handleCompareOffers}
                  selectedItems={cartItems}
                  onToggleItem={handleToggleCart}
                  hoveredDiagnosis={hoveredDiagnosis}
                />
              </div>
            )}
            {marketplaceTab === 'sell' && (
              <div className="h-full w-full flex flex-col gap-4">
                <SellerProfileHeader
                  name="Sahar Barak"
                  totalRequests={carsData.reduce((sum, car) => sum + car.pendingRequests, 0)}
                  rating={carsData.reduce((sum, car) => sum + car.rating, 0) / carsData.length}
                  totalRevenue={carsData.reduce((sum, car) => sum + car.totalRevenue, 0)}
                />
                <DashboardView cars={carsData} />
              </div>
            )}
          </div> */}
        </div>
      </section>

      {/* Section 5 - Waitlist Signup */}
      <section
        id="waitlist-section"
        className="relative w-full flex flex-col justify-end bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/sections/background-5.svg)`, height: '50vh' }}
      >
        {/* Waitlist Tab - Top Right */}
        <div className="absolute top-0 right-0 z-[80]">
          <motion.div
            className="flex items-center justify-center gap-2 md:gap-3"
            style={{
              borderBottomLeftRadius: 'var(--border-radius)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 'clamp(8px, 2vw, 12px)',
              fontWeight: 600,
              backgroundColor: '#463B47',
              color: '#C4C4C4',
              width: 'clamp(80px, 20vw, calc(var(--sizer) * 7.1rem))',
              height: '42px',
              paddingLeft: 'clamp(8px, 2vw, calc(var(--sizer) * 1.125rem))',
              paddingRight: 'clamp(8px, 2vw, calc(var(--sizer) * 1.125rem))',
              paddingTop: 0,
              paddingBottom: 0,
              textTransform: 'uppercase',
            }}
          >
            WAITLIST
            <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 7H4C3.46957 7 2.96086 7.21071 2.58579 7.58579C2.21071 7.96086 2 8.46957 2 9V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V9C22 8.46957 21.7893 7.96086 21.4142 7.58579C21.0391 7.21071 20.5304 7 20 7H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-16 pb-12 flex flex-col md:flex-row gap-8 md:items-center md:justify-between">
          {/* Text Content */}
          <div className="max-w-md">
            <h2 style={{ marginBottom: 'var(--spacing-md)', color: '#463B47', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
              Become<br />
              an Insider
            </h2>
            <p style={{ color: '#463B47', lineHeight: '1.5', letterSpacing: '0em' }}>
              If you love restoring, tuning, or simply understanding machines — Wessley was built for you.
              <br />
              Join the waitlist early and help shape the world&apos;s first intelligent garage.
            </p>
          </div>

          {/* Email Input */}
          <div className="max-w-xl w-full md:w-auto md:flex-1">
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  backgroundColor: '#161616',
                  borderRadius: 'var(--border-radius)',
                  padding: 'clamp(0.5rem, calc(var(--sizer) * 0.5rem), 0.625rem)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(0.5rem, calc(var(--sizer) * 0.625rem), 0.75rem)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 225, 150, 0.1)',
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email to get early access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 'clamp(0.875rem, calc(var(--sizer) * 0.875rem), 1.125rem)',
                    fontWeight: 400,
                    color: '#FFFFFF',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    flex: 1,
                    paddingLeft: 'clamp(1rem, calc(var(--sizer) * 1.5rem), 1.75rem)',
                    paddingRight: 'clamp(0.75rem, calc(var(--sizer) * 1rem), 1.25rem)',
                    paddingTop: 'clamp(0.75rem, calc(var(--sizer) * 1rem), 1.25rem)',
                    paddingBottom: 'clamp(0.75rem, calc(var(--sizer) * 1rem), 1.25rem)',
                  }}
                  className="placeholder-white/50"
                />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    borderRadius: 'calc(var(--border-radius) * 0.75)',
                    backgroundColor: '#8BE196',
                    color: '#161616',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 'clamp(0.875rem, calc(var(--sizer) * 0.875rem), 1.125rem)',
                    fontWeight: 600,
                    paddingLeft: 'clamp(1.5rem, calc(var(--sizer) * 2.5rem), 3rem)',
                    paddingRight: 'clamp(1.5rem, calc(var(--sizer) * 2.5rem), 3rem)',
                    paddingTop: 'clamp(0.75rem, calc(var(--sizer) * 1rem), 1.25rem)',
                    paddingBottom: 'clamp(0.75rem, calc(var(--sizer) * 1rem), 1.25rem)',
                    whiteSpace: 'nowrap',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                  whileHover={!isSubmitting ? {
                    backgroundColor: '#9DF4A8',
                    scale: 1.05,
                    boxShadow: '0 5px 20px rgba(139, 225, 150, 0.4)',
                  } : {}}
                  whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {isSubmitting ? 'Joining...' : 'Get Early Access →'}
                </motion.button>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 'calc(var(--sizer) * 0.625rem)',
                  color: '#463B47',
                  marginTop: 'calc(var(--sizer) * 0.75rem)',
                  textAlign: 'center',
                  opacity: 0.7,
                }}
              >
                🚀 Join 500+ builders already on the waitlist
              </p>
              {submitMessage && (
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 'calc(var(--sizer) * 0.875rem)',
                    color: submitMessage.includes('🎉') ? '#8BE196' : '#ff6b6b',
                    marginTop: 'calc(var(--sizer) * 0.75rem)',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  {submitMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      <FooterMobile />
    </div>
  )
}
