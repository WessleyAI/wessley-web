'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setIsSubmitted(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#161616] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white hover:text-[#8BE196] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to home</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-8">
          {isSubmitted ? (
            <div className="space-y-4">
              <CheckCircle className="h-16 w-16 text-[#8BE196] mx-auto" />
              <h1
                className="text-3xl font-bold text-white"
                style={{ fontFamily: 'var(--font-head)' }}
              >
                You&apos;re on the list!
              </h1>
              <p className="text-gray-400 text-lg">
                We&apos;ll notify you when Wessley is ready. Check your inbox
                for a welcome email.
              </p>
              <Link href="/">
                <Button
                  variant="outline"
                  className="mt-4 border-white/20 text-white hover:bg-white/10"
                >
                  Back to home
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8BE196]/10 text-[#8BE196] text-sm">
                <Sparkles className="h-4 w-4" />
                Early Access
              </div>

              <h1
                className="text-4xl font-bold text-white"
                style={{ fontFamily: 'var(--font-head)' }}
              >
                Join the Waitlist
              </h1>
              <p className="text-gray-400 text-lg">
                Be the first to access AI-powered vehicle diagnostics and 3D
                schematic analysis.
              </p>

              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-[#8BE196]"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="bg-[#8BE196] text-[#161616] hover:bg-[#9DF4A8] font-semibold px-6"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Join'
                  )}
                </Button>
              </form>

              <p className="text-xs text-gray-500">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
