'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setIsSubmitted(true)
      toast.success('You\'re on the list!')
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full space-y-8 text-center"
      >
        {/* Logo */}
        <Link href="/" className="inline-block">
          <motion.img
            src="/header/logo.svg"
            alt="Wessley Logo"
            className="w-12 h-12 mx-auto"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          />
        </Link>

        {!isSubmitted ? (
          <>
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: 'var(--font-head)' }}
              >
                Join the Waitlist
              </h1>
              <p className="mt-4 text-lg text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                Be first to experience automotive intelligence. Get early access to Wessley — AI-powered diagnostics, repair guidance, and parts discovery.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#8BE196] focus:border-transparent transition-all"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-lg font-medium text-black disabled:opacity-50 transition-colors"
                style={{
                  backgroundColor: '#8BE196',
                  fontFamily: 'var(--font-head)',
                }}
              >
                {isSubmitting ? 'Joining...' : 'Get Early Access'}
              </motion.button>
            </form>

            <p className="text-xs text-muted-foreground">
              No spam. Unsubscribe anytime.
            </p>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="text-5xl">🎉</div>
            <h2
              className="text-3xl font-bold text-foreground"
              style={{ fontFamily: 'var(--font-head)' }}
            >
              You&apos;re on the list!
            </h2>
            <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
              We&apos;ll notify you when Wessley is ready. Check your inbox for a confirmation email.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 text-sm text-[#8BE196] hover:underline"
            >
              ← Back to home
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
