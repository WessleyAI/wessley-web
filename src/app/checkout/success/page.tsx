'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import confetti from 'canvas-confetti'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    // Celebrate!
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#8BE196', '#EBFFE9', '#ffffff'],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#8BE196', '#EBFFE9', '#ffffff'],
      })
    }, 250)

    // Simulate verification delay
    const timer = setTimeout(() => {
      setIsVerifying(false)
    }, 1500)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full text-center"
    >
      {isVerifying ? (
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-[#8BE196] animate-spin mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Verifying your subscription...
          </h1>
          <p className="text-gray-400">
            Please wait while we confirm your payment.
          </p>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#8BE196]/20 mb-4">
              <CheckCircle2 className="h-12 w-12 text-[#8BE196]" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-head)' }}
          >
            Welcome to Wessley!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 mb-8 text-lg"
          >
            Your subscription is now active. You have full access to all premium features.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <Button
              asChild
              className="w-full bg-[#8BE196] text-[#161616] hover:bg-[#9DF4A8]"
              size="lg"
            >
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <p className="text-sm text-gray-500">
              A confirmation email has been sent to your inbox.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <h2 className="text-sm font-semibold text-white mb-4">
              Get started with
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/demo/bench"
                className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <div className="text-sm font-medium text-white">3D Viewer</div>
                <div className="text-xs text-gray-400">Explore schematics</div>
              </Link>
              <Link
                href="/chat"
                className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <div className="text-sm font-medium text-white">AI Assistant</div>
                <div className="text-xs text-gray-400">Get help</div>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

function LoadingFallback() {
  return (
    <div className="max-w-md w-full text-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-16 w-16 text-[#8BE196] animate-spin mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Loading...
        </h1>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#161616] flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
