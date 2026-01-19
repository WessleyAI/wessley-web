'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Loader2, ArrowLeft, Zap, Shield, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PRICING_INFO, SubscriptionTier } from '@/lib/stripe'

export default function PricingPage() {
  const router = useRouter()
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null)

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (tier === 'free' || tier === 'enterprise') {
      if (tier === 'enterprise') {
        window.location.href = 'mailto:sales@wessley.ai?subject=Enterprise%20Inquiry'
      }
      return
    }

    setLoadingTier(tier)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please sign in to subscribe')
          router.push('/auth/login?redirect=/pricing')
          return
        }
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoadingTier(null)
    }
  }

  const tiers: Array<{
    tier: SubscriptionTier
    popular?: boolean
    icon: React.ReactNode
  }> = [
    {
      tier: 'free',
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      tier: 'insiders',
      popular: true,
      icon: <Zap className="h-6 w-6" />,
    },
    {
      tier: 'pro',
      icon: <Shield className="h-6 w-6" />,
    },
    {
      tier: 'enterprise',
      icon: <Shield className="h-6 w-6" />,
    },
  ]

  return (
    <div className="min-h-screen bg-[#161616]">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-[#8BE196] transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to home</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-head)' }}
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tiers.map(({ tier, popular, icon }, index) => {
            const info = PRICING_INFO[tier]
            const isLoading = loadingTier === tier
            const isClickable = tier !== 'free'

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="relative"
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-[#8BE196] text-[#161616] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Most Popular
                    </span>
                  </div>
                )}

                <Card
                  className={`relative h-full flex flex-col ${
                    popular
                      ? 'border-[#8BE196] border-2 bg-[#1a1a1a]'
                      : 'border-white/10 bg-[#1a1a1a]'
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${popular ? 'bg-[#8BE196]/20 text-[#8BE196]' : 'bg-white/10 text-white'}`}>
                        {icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-white">{info.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {tier === 'free' && 'Get started for free'}
                      {tier === 'insiders' && 'For early adopters'}
                      {tier === 'pro' && 'For professional mechanics'}
                      {tier === 'enterprise' && 'For fleets and dealers'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    {/* Price */}
                    <div className="mb-6">
                      {info.price !== null ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">${info.price}</span>
                          <span className="text-gray-400">/{info.interval}</span>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-white">Contact us</div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {info.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${popular ? 'text-[#8BE196]' : 'text-gray-400'}`} />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className={`w-full ${
                        popular
                          ? 'bg-[#8BE196] text-[#161616] hover:bg-[#9DF4A8]'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                      size="lg"
                      onClick={() => handleSubscribe(tier)}
                      disabled={isLoading || tier === 'free'}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : tier === 'free' ? (
                        'Current Plan'
                      ) : tier === 'enterprise' ? (
                        'Contact Sales'
                      ) : (
                        'Get Started'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-400">
                Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400">
                We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-gray-400">
                Yes, we offer a full refund within 7 days of purchase, no questions asked. After that, refunds are pro-rated for unused time.
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-4">Secure payments powered by</p>
          <div className="flex items-center justify-center gap-8">
            <svg className="h-8 text-gray-500" viewBox="0 0 60 25" fill="currentColor">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95l.3 4.17c-1.34.72-3.15 1.14-5.22 1.14-4.83 0-7.67-2.72-7.67-7.73 0-4.35 2.5-7.95 7.08-7.95 4.33 0 6.62 3.03 6.62 7.25 0 .63-.05 1.19-.3 1.52zm-7.94-3.43c0-1.6.89-2.85 2.37-2.85 1.32 0 2.25 1.17 2.25 2.85h-4.62zm-22.9 10.28h5.1V5.69l-5.1 1v14.44zm-6.56-3.3c0 .47.05.9.22 1.27.35.72 1.06 1.18 1.97 1.18.8 0 1.47-.42 1.93-.98l-.8-1.94c-.3.35-.65.55-1.03.55-.42 0-.6-.23-.6-.72V5.64l-5.1 1v10.53c0 2.35.88 3.96 3.4 3.96 1.42 0 2.52-.43 3.27-.95l.9 3.9c-1.13.57-2.68.95-4.23.95-4.5 0-5.33-2.85-5.33-5.84V6.64l5.1-1v12.19h.3zM14.8 5.6c-1.5 0-2.7.93-3.22 2.07h-.05l.2-1.87H6.7v15.33h5.1v-8.72c0-1.93.93-2.98 2.47-2.98.43 0 .88.05 1.3.17l.65-4c-.42-.08-.88-.12-1.42-.12v.12zM0 17.1c0 2.33 1.93 4.03 5.1 4.03 2.2 0 3.97-.58 5.3-1.3l-.8-3.73c-.92.5-2.15.88-3.4.88-1.18 0-1.7-.5-1.7-1.18 0-.57.45-.95 1.53-1.35l1.45-.52c2.2-.78 3.63-1.93 3.63-4.23 0-2.28-2.03-4.08-5.33-4.08-2.22 0-3.95.6-5.05 1.35l.93 3.75c.93-.6 2.1-.98 3.2-.98 1.18 0 1.6.48 1.6 1.05 0 .55-.4.95-1.33 1.28l-1.35.45C1.7 13.1 0 14.43 0 17.1z"/>
            </svg>
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86zm2 0V4.07c3.94.49 7 3.85 7 7.93s-3.06 7.44-7 7.93z"/>
              </svg>
              <span className="text-sm">256-bit SSL</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
