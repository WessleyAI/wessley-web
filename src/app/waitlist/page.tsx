'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { toast } from 'sonner'
import { Moon } from 'lucide-react'
import { WaitlistHeader } from '@/components/waitlist/WaitlistHeader'
import { TwitterIcon } from '@/components/ui/twitter-icon'
import { ExploreSection } from '@/components/waitlist/explore/ExploreSection'
import { NavigationOverlay } from '@/components/waitlist/explore/NavigationOverlay'
import { Footer } from '@/components/waitlist/Footer'
import { FooterMobile } from '@/components/waitlist/FooterMobile'
import { BuySection } from '@/components/waitlist/marketplace/buy-section'
import { SellerProfileHeader } from '@/components/waitlist/marketplace/seller-profile-header'
import { DashboardView } from '@/components/waitlist/marketplace/dashboard-view'
import { Instagram, Twitter, Linkedin, Youtube, Github } from 'lucide-react'

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
  // Enhanced precision fields
  partNumber?: string
  compatibility?: string
  specifications?: string
  diagnosis?: string
  installDifficulty?: 'Easy' | 'Medium' | 'Hard'
  installTime?: string
  condition?: string
  warranty?: string
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
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [hasShownToast, setHasShownToast] = useState(false)
  const [marketplaceTab, setMarketplaceTab] = useState<'buy' | 'sell'>('buy')
  const scrollRef = useRef<HTMLDivElement>(null)
  const section2Ref = useRef<HTMLElement>(null)
  const section4Ref = useRef<HTMLElement>(null)

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

  // Show toast notification when entering section 2
  useEffect(() => {
    if (!section2Ref.current || hasShownToast) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasShownToast) {
            toast('🚀 Join the Waitlist', {
              description: 'Be among the first to access Wessley\'s AI-powered automotive platform. 500+ builders already signed up!',
              action: {
                label: 'Join Now',
                onClick: () => {
                  const waitlistSection = document.getElementById('waitlist-section')
                  if (waitlistSection) {
                    waitlistSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                },
              },
              duration: 10000,
            })
            setHasShownToast(true)
          }
        })
      },
      { threshold: 0.3 } // Trigger when 30% of section 2 is visible
    )

    observer.observe(section2Ref.current)

    return () => observer.disconnect()
  }, [hasShownToast])

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
      partNumber: 'BOSCH 0-123-520-017',
      compatibility: 'Fits 2000 Hyundai Galloper 3.0L V6',
      specifications: '90A 12V • 6-Groove Pulley',
      diagnosis: 'AI detected: Voltage drops to 12.8V at idle, dimming headlights',
      installDifficulty: 'Medium',
      installTime: '1.5-2 hours',
      condition: 'New (OE Quality)',
      warranty: '2 Year / 24,000 mi',
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
      partNumber: 'HYUNDAI 95220-3B000',
      compatibility: 'Fits 2000 Hyundai Galloper 3.0L • Also 1998-2003 models',
      specifications: '12V 30A • 4-Pin ISO Micro Relay',
      diagnosis: 'AI detected: Engine cranks but no start, no fuel pump sound when key turns',
      installDifficulty: 'Easy',
      installTime: '15-30 minutes',
      condition: 'New (OEM)',
      warranty: '1 Year / 12,000 mi',
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
      partNumber: 'DENSO 221-9211',
      compatibility: 'Fits 2000 Hyundai Galloper 3.0L • Direct OE replacement',
      specifications: '2-Row Aluminum Core • 13.5" H x 21" W • Plastic Tanks',
      diagnosis: 'AI detected: Coolant temp reaching 220°F, visible leak at lower tank seam',
      installDifficulty: 'Hard',
      installTime: '3-4 hours',
      condition: 'New (Aftermarket)',
      warranty: '1 Year / 12,000 mi',
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
      partNumber: 'AKEBONO ACT537',
      compatibility: 'Fits 2000 Hyundai Galloper 3.0L Front Axle',
      specifications: 'Ceramic Compound • Low Dust • 10mm Thickness',
      diagnosis: 'AI detected: Pad thickness at 4mm, squeaking on braking, replace soon',
      installDifficulty: 'Easy',
      installTime: '45 minutes - 1 hour',
      condition: 'New (Premium)',
      warranty: '3 Years / 36,000 mi',
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
      partNumber: 'MANN W920/21',
      compatibility: 'Fits 2000 Hyundai Galloper 3.0L V6 • Universal fit',
      specifications: 'Spin-on Type • 3/4-16 Thread • Anti-drainback Valve',
      diagnosis: 'AI detected: 3,800 mi since last change, schedule soon for optimal protection',
      installDifficulty: 'Easy',
      installTime: '15-20 minutes',
      condition: 'New (OEM-spec)',
      warranty: '90 Days',
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
      partNumber: 'NGK ILFR6B (Set of 6)',
      compatibility: 'Fits 2000 Hyundai Galloper 3.0L V6 • Heat range 6',
      specifications: 'Iridium IX • Laser-welded tip • 0.044" Gap',
      diagnosis: 'AI detected: 42,000 mi on plugs, slight misfire on cylinder 3, replacement recommended',
      installDifficulty: 'Medium',
      installTime: '1-1.5 hours',
      condition: 'New (Premium)',
      warranty: '25,000 mi',
    },
  ])

  const [carsData] = useState<CarData[]>([
    {
      id: '1',
      name: '2000 Hyundai Galloper',
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      make: 'Hyundai',
      model: 'Galloper',
      year: 2000,
      vin: 'KMHJN81WPYU034521',
      mileage: '145,200 mi',
      partsListed: 28,
      partsSold: 18,
      totalRevenue: 3450,
      rating: 4.9,
      pendingRequests: 3,
    },
    {
      id: '2',
      name: '2008 Honda Accord LX',
      imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      make: 'Honda',
      model: 'Accord LX',
      year: 2008,
      vin: '1HGCP26758A084321',
      mileage: '178,000 mi',
      partsListed: 42,
      partsSold: 35,
      totalRevenue: 4920,
      rating: 4.7,
      pendingRequests: 5,
    },
    {
      id: '3',
      name: '2005 Toyota Camry LE',
      imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      make: 'Toyota',
      model: 'Camry LE',
      year: 2005,
      vin: '4T1BE32K25U598437',
      mileage: '215,500 mi',
      partsListed: 35,
      partsSold: 22,
      totalRevenue: 5680,
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
    // Compare offers functionality
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
        toast.success('Successfully joined!', {
          description: 'Check your email for confirmation. We\'ll be in touch soon!',
        })
      } else {
        setSubmitMessage(data.error || 'Something went wrong. Please try again.')
        toast.error('Oops!', {
          description: data.error || 'Something went wrong. Please try again.',
        })
      }
    } catch (error) {
      setSubmitMessage('Network error. Please try again.')
      toast.error('Network error', {
        description: 'Please check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative w-full" ref={scrollRef}>
      <WaitlistHeader />

      {/* Section 1 - Hero with Video */}
      <section className="relative w-full flex items-start overflow-hidden" style={{ minHeight: '100svh' }}>
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

        {/* Light mode overlay */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 1.5,
            backgroundColor: 'var(--bg-section-light-green)',
            pointerEvents: 'none'
          }}
        />

        {/* Partial background section - only covers text area */}
        <div
          className="absolute left-0 right-0 bg-cover bg-center bg-no-repeat"
          style={{
            top: 0,
            height: 'calc((15svh + var(--spacing-3xl) * 3 - 2svh) * 0.83)',
            zIndex: 2,
            backgroundImage: `url(/sections/background-2.svg)`,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            opacity: 0.98
          }}
        />

        {/* Floating Buttons - positioned within section 1 */}
        <>
          {/* Theme toggle - bottom left (locked to dark mode) */}
          <div className="absolute bottom-6 left-6" style={{ zIndex: 50 }}>
            <motion.button
              disabled
              aria-label="Theme toggle (locked to dark mode)"
              className="text-white bg-transparent border-none cursor-not-allowed relative w-8 h-8 opacity-50"
              title="Dark mode locked"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-8 w-8" />
            </motion.button>
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
                  color: 'var(--accent-green)',
                  whiteSpace: 'nowrap',
                }}
              >
                Wessley
              </h1>
              <h2
                style={{
                  color: 'var(--text-white)',
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
                color: 'var(--text-white)',
              }}
            >
              Wessley understands every circuit, system,
              <br />
              and connection in your car. It helps you diagnose faults,
              <br />
              plan repairs, and discover exactly what parts you need — instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 - Virtual Garage */}
      <section
        ref={section2Ref}
        className="relative w-full min-h-screen flex flex-col justify-between bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/sections/background-2.svg)` }}
      >
        {/* 3D AI Assistance Tab - Top Right */}
        <div className="absolute top-0 right-0 z-[80]">
          <motion.div
            className="flex items-center justify-center gap-2 md:gap-3"
            style={{
              borderBottomLeftRadius: 'var(--border-radius)',
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(10px, 2.5vw, 12px)',
              fontWeight: 600,
              backgroundColor: 'var(--accent-green-light)',
              color: 'var(--text-on-light)',
              width: 'clamp(100px, 25vw, calc(var(--sizer) * 7.1rem))',
              height: 'clamp(38px, 8vw, 42px)',
              paddingLeft: 'clamp(10px, 2.5vw, calc(var(--sizer) * 1.125rem))',
              paddingRight: 'clamp(10px, 2.5vw, calc(var(--sizer) * 1.125rem))',
              paddingTop: 0,
              paddingBottom: 0,
              textTransform: 'uppercase',
            }}
          >
            3D ASSIST
            <svg className="w-4 h-4 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            className="flex items-center gap-4 max-w-5xl mx-auto p-4 md:py-8 md:px-8 md:pr-10"
            style={{
              backgroundColor: 'var(--ui-chat-bg)',
              borderRadius: 'var(--border-radius)'
            }}
            whileHover={{ backgroundColor: "var(--ui-chat-hover)" }}
            transition={{ duration: 0.2 }}
          >
            {/* Plus Icon - Left */}
            <motion.button
              className="shrink-0"
              style={{ color: '#1a1a1a' }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>

            <input
              placeholder="Ask anything"
              className="flex-1 bg-transparent border-none text-black placeholder-gray-600 focus:ring-0 focus:border-none font-medium focus:outline-none text-base"
              style={{ padding: 0, margin: 0 }}
            />

            {/* Microphone Icon */}
            <motion.button
              className="shrink-0"
              style={{ color: '#1a1a1a' }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" fill="currentColor"/>
                <path d="M17 11C17 14.31 14.31 17 11 17H11C7.69 17 5 14.31 5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 17V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 22H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>

            {/* Send Arrow Icon - Right */}
            <motion.button
              className="shrink-0"
              style={{ color: '#1a1a1a' }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Section 3 - Explore (100svh) */}
      <section
        className="relative w-full flex flex-col items-center justify-start bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url(/sections/background-3.svg)`,
          minHeight: '100svh'
        }}
      >
        {/* Light mode overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'var(--bg-section-light-green)',
            pointerEvents: 'none'
          }}
        />

        {/* Navigation Overlay - Left Side */}
        <NavigationOverlay />

        {/* Explore Tab - Top Right */}
        <div className="absolute top-0 right-0 z-[80]">
          <motion.button
            className="flex items-center justify-center gap-2 md:gap-3"
            style={{
              borderBottomLeftRadius: 'var(--border-radius)',
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(10px, 2.5vw, 12px)',
              fontWeight: 600,
              backgroundColor: 'var(--accent-gray)',
              color: 'var(--text-white)',
              width: 'clamp(100px, 25vw, calc(var(--sizer) * 7.1rem))',
              height: 'clamp(38px, 8vw, 42px)',
              paddingLeft: 'clamp(10px, 2.5vw, calc(var(--sizer) * 1.125rem))',
              paddingRight: 'clamp(10px, 2.5vw, calc(var(--sizer) * 1.125rem))',
              paddingTop: 0,
              paddingBottom: 0,
              textTransform: 'uppercase',
            }}
            whileHover={{ backgroundColor: "var(--accent-gray-hover)" }}
            transition={{ duration: 0.2 }}
          >
            EXPLORE
            <Image
              src="/third/explore.svg"
              alt="Explore"
              width={16}
              height={16}
              className="w-4 h-4 md:w-4 md:h-4"
              style={{
                filter: 'invert(1)',
                opacity: 1.0,
              }}
            />
          </motion.button>
        </div>

        {/* Content Container */}
        <div className="w-full flex flex-col items-center h-full">
          {/* Header Section */}
          <div className="w-full max-w-7xl mx-auto px-16 pt-8 pb-4 flex flex-col items-center text-center">
            {/* Header */}
            <h3 style={{ marginBottom: 'var(--spacing-md)', lineHeight: '1.2', letterSpacing: '-0.02em', color: 'var(--text-on-light)' }}>
              An Automotive Social Network
            </h3>

            {/* Subheader */}
            <p style={{ lineHeight: '1.35', letterSpacing: '0em', color: 'var(--text-on-light)' }}>
              Meet the people shaping the future of restoration.<br />
              Wessley unites human creativity with automotive intelligence.
            </p>
          </div>

          {/* Explore Component */}
          <div className="w-full flex-1 flex items-center">
            <ExploreSection />
          </div>
        </div>
      </section>

      {/* Section 4 - Marketplace */}
      <section
        ref={section4Ref}
        className="relative w-full min-h-screen flex items-start justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/sections/background-4.svg)` }}
      >
        {/* Marketplace Header - Top Right */}
        <div className="absolute top-0 right-0 z-[80]">
          <motion.div
            className="flex items-center justify-center gap-2 md:gap-3"
            style={{
              borderBottomLeftRadius: 'var(--border-radius)',
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(10px, 2.5vw, 12px)',
              fontWeight: 600,
              backgroundColor: 'var(--accent-green-light)',
              color: 'var(--text-on-light)',
              width: 'clamp(120px, 30vw, calc(var(--sizer) * 7.1rem))',
              height: 'clamp(38px, 8vw, 42px)',
              paddingLeft: 'clamp(10px, 2.5vw, calc(var(--sizer) * 1.125rem))',
              paddingRight: 'clamp(10px, 2.5vw, calc(var(--sizer) * 1.125rem))',
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
        <div className="relative z-10 w-full flex flex-col px-16 py-32 gap-24">
          {/* Intro Section */}
          <div className="max-w-3xl mx-auto text-center">
            <h3 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-accent-green-light)', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
              Less Searching.
              <br />
              More Building.
            </h3>
            <p style={{ color: 'var(--color-accent-green-light)', lineHeight: '1.35', letterSpacing: '0em' }}>
              Wessley bridges the trade between restorers, spare parts, junkyard finds, stores and after-market inventory verified and matched by AI. You focus on the build — it finds what fits.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="w-full flex flex-col gap-24">
            {/* Buy Parts Section - Top (Left Aligned) */}
            <div className="flex flex-col gap-8 items-start">
              <div className="w-full text-left">
                <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-accent-green-light)', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
                  Buy Parts
                </h4>
                <p style={{ color: 'var(--color-accent-green-light)', lineHeight: '1.5' }}>
                  Find exactly what you need for your restoration. Our AI-powered marketplace connects you with verified sellers, junkyards, and parts stores.
                </p>
              </div>
              <BuySection
                parts={buyParts}
                onPartsChange={setBuyParts}
                cars={carsData}
                selectedItems={cartItems}
                onToggleItem={handleToggleCart}
              />
            </div>

            {/* Sell Parts Section - Bottom (Right Aligned) */}
            <div className="flex flex-col gap-8 items-end">
              <div className="w-full text-right">
                <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-accent-green-light)', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
                  Sell Parts
                </h4>
                <p style={{ color: 'var(--color-accent-green-light)', lineHeight: '1.5' }}>
                  Turn your spare parts into profit. List your inventory and let AI match it with builders who need exactly what you have.
                </p>
              </div>
              <div className="w-full flex flex-col gap-4">
                <SellerProfileHeader
                  name="Sahar Barak"
                  totalRequests={carsData.reduce((sum, car) => sum + car.pendingRequests, 0)}
                  rating={carsData.reduce((sum, car) => sum + car.rating, 0) / carsData.length}
                  totalRevenue={carsData.reduce((sum, car) => sum + car.totalRevenue, 0)}
                />
                <DashboardView cars={carsData} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Waitlist Signup with Footer Background */}
      <div className="relative w-full overflow-x-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src="/sections/background-1.mp4" type="video/mp4" />
        </video>

        {/* Subtle overlay for readability */}
        <div className="absolute inset-0 bg-black/10" style={{ zIndex: 0 }} />

        <section
          id="waitlist-section"
          className="relative w-full flex flex-col justify-center"
          style={{ minHeight: '80svh', zIndex: 1 }}
        >
        {/* Waitlist Tab - Top Right */}
        <div className="absolute top-0 right-0 z-[80]">
          <motion.div
            className="flex items-center justify-center gap-2 md:gap-3"
            style={{
              borderBottomLeftRadius: 'var(--border-radius)',
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(10px, 2.5vw, 12px)',
              fontWeight: 600,
              backgroundColor: 'var(--accent-green-light)',
              color: 'var(--text-on-light)',
              width: 'clamp(100px, 25vw, calc(var(--sizer) * 7.1rem))',
              height: 'clamp(38px, 8vw, 42px)',
              paddingLeft: 'clamp(10px, 2.5vw, calc(var(--sizer) * 1.125rem))',
              paddingRight: 'clamp(10px, 2.5vw, calc(var(--sizer) * 1.125rem))',
              paddingTop: 0,
              paddingBottom: 0,
              textTransform: 'uppercase',
            }}
          >
            WAITLIST
            <svg className="w-4 h-4 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 7H4C3.46957 7 2.96086 7.21071 2.58579 7.58579C2.21071 7.96086 2 8.46957 2 9V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V9C22 8.46957 21.7893 7.96086 21.4142 7.58579C21.0391 7.21071 20.5304 7 20 7H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-16 pb-12 flex flex-col md:flex-row gap-8 md:items-center md:justify-between">
          {/* Text Content */}
          <div className="max-w-md">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'calc(var(--sizer) * 2rem)', marginBottom: 'var(--spacing-md)' }}>
              <h2 style={{ color: 'var(--text-white)', lineHeight: '1.2', letterSpacing: '-0.02em', margin: 0 }}>
                Become<br />
                An Insider
              </h2>

              {/* Social Icons */}
              <div style={{ display: 'flex', gap: 'calc(var(--sizer) * 0.75rem)', alignItems: 'center', marginLeft: '20%', marginBottom: '2%' }}>
                <motion.a
                  href="https://github.com/wessleyai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  whileHover={{ scale: 1.2, color: '#FFFFFF' }}
                  transition={{ duration: 0.2 }}
                  style={{ color: '#F5F5F5', cursor: 'pointer', display: 'flex' }}
                >
                  <Github size={32} />
                </motion.a>
                <motion.a
                  href="https://huggingface.co/wessleyai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HuggingFace"
                  whileHover={{ scale: 1.2, color: '#FFD21E' }}
                  transition={{ duration: 0.2 }}
                  style={{ color: '#F5F5F5', cursor: 'pointer', display: 'flex' }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3ZM9.5 10C10.33 10 11 10.67 11 11.5C11 12.33 10.33 13 9.5 13C8.67 13 8 12.33 8 11.5C8 10.67 8.67 10 9.5 10ZM14.5 10C15.33 10 16 10.67 16 11.5C16 12.33 15.33 13 14.5 13C13.67 13 13 12.33 13 11.5C13 10.67 13.67 10 14.5 10ZM12 17.5C9.67 17.5 7.69 16.04 6.88 14H17.12C16.31 16.04 14.33 17.5 12 17.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </motion.a>
              </div>
            </div>

            <p style={{ color: 'var(--color-accent-green-light)', lineHeight: '1.35', letterSpacing: '0em', marginBottom: 'calc(var(--sizer) * 1rem)' }}>
              Join the world&apos;s first AI-powered automotive platform. Connect with builders, access intelligent diagnostics, and discover the parts you need — instantly.
            </p>
            <ul style={{ color: 'var(--text-white)', lineHeight: '1.6', letterSpacing: '0em', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: 'calc(var(--sizer) * 0.5rem)', display: 'flex', alignItems: 'center', gap: 'calc(var(--sizer) * 0.5rem)' }}>
                <span style={{ color: 'var(--accent-green)' }}>✓</span> Early access to AI garage tools
              </li>
              <li style={{ marginBottom: 'calc(var(--sizer) * 0.5rem)', display: 'flex', alignItems: 'center', gap: 'calc(var(--sizer) * 0.5rem)' }}>
                <span style={{ color: 'var(--accent-green)' }}>✓</span> Exclusive community features
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--sizer) * 0.5rem)' }}>
                <span style={{ color: 'var(--accent-green)' }}>✓</span> Founding member benefits
              </li>
            </ul>
          </div>

          {/* Email Input */}
          <div className="w-full md:w-auto md:flex-1">
            <form onSubmit={handleSubmit}>
              <div
                className="flex flex-col md:flex-row items-stretch md:items-center"
                style={{
                  backgroundColor: 'var(--ui-input-bg)',
                  borderRadius: 'var(--border-radius)',
                  padding: 'clamp(0.5rem, calc(var(--sizer) * 0.5rem), 0.625rem)',
                  gap: 'clamp(0.5rem, calc(var(--sizer) * 0.625rem), 0.75rem)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(139, 225, 150, 0.3)',
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email to get early access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="placeholder-gray-600 w-full md:flex-1"
                  style={{
                    fontFamily: 'var(--font-head)',
                    fontSize: 'clamp(0.875rem, calc(var(--sizer) * 0.875rem), 1.125rem)',
                    fontWeight: 400,
                    color: 'var(--ui-input-text)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    paddingLeft: 'clamp(1rem, calc(var(--sizer) * 1.5rem), 1.75rem)',
                    paddingRight: 'clamp(0.75rem, calc(var(--sizer) * 1rem), 1.25rem)',
                    paddingTop: 'clamp(0.75rem, calc(var(--sizer) * 1rem), 1.25rem)',
                    paddingBottom: 'clamp(0.75rem, calc(var(--sizer) * 1rem), 1.25rem)',
                  }}
                />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                  style={{
                    borderRadius: 'calc(var(--border-radius) * 0.75)',
                    backgroundColor: 'var(--ui-button-primary)',
                    color: 'var(--ui-button-primary-text)',
                    fontFamily: 'var(--font-head)',
                    fontSize: 'clamp(0.75rem, calc(var(--sizer) * 0.75rem), 0.875rem)',
                    fontWeight: 600,
                    paddingLeft: 'clamp(1rem, calc(var(--sizer) * 1.5rem), 1.75rem)',
                    paddingRight: 'clamp(1rem, calc(var(--sizer) * 1.5rem), 1.75rem)',
                    paddingTop: 'clamp(0.75rem, calc(var(--sizer) * 1rem), 1.25rem)',
                    paddingBottom: 'clamp(0.75rem, calc(var(--sizer) * 1rem), 1.25rem)',
                    whiteSpace: 'nowrap',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                  whileHover={!isSubmitting ? {
                    backgroundColor: 'var(--accent-green-hover)',
                    scale: 1.05,
                    boxShadow: '0 5px 20px rgba(139, 225, 150, 0.4)',
                  } : {}}
                  whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {isSubmitting ? 'Joining...' : 'Join Now →'}
                </motion.button>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: 'clamp(0.75rem, 2.5vw, 1rem)',
                  color: 'var(--text-on-dark)',
                  marginTop: 'calc(var(--sizer) * 0.75rem)',
                  textAlign: 'center',
                  opacity: 0.9,
                }}
              >
                🚀 Join 500+ builders already on the waitlist
              </p>
              {submitMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    marginTop: 'calc(var(--sizer) * 1rem)',
                    padding: 'calc(var(--sizer) * 1rem)',
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: submitMessage.includes('🎉')
                      ? 'rgba(139, 225, 150, 0.1)'
                      : 'rgba(255, 100, 100, 0.1)',
                    border: submitMessage.includes('🎉')
                      ? '1px solid rgba(139, 225, 150, 0.3)'
                      : '1px solid rgba(255, 100, 100, 0.3)',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 1rem)',
                      color: submitMessage.includes('🎉') ? 'var(--accent-green)' : '#ff6464',
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    {submitMessage}
                  </p>
                  {submitMessage.includes('🎉') && (
                    <p
                      style={{
                        fontFamily: 'var(--font-head)',
                        fontSize: 'calc(var(--sizer) * 0.75rem)',
                        color: 'var(--text-white)',
                        marginTop: 'calc(var(--sizer) * 0.5rem)',
                        opacity: 0.8,
                      }}
                    >
                      Check your email for confirmation. We'll be in touch soon!
                    </p>
                  )}
                </motion.div>
              )}
            </form>
          </div>
        </div>
        </section>

        {/* Footer */}
        <div className="relative" style={{ zIndex: 1 }}>
          <Footer />
          <FooterMobile />
        </div>
      </div>
    </div>
  )
}
