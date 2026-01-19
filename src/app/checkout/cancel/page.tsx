'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, HelpCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-[#161616] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="mb-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-4">
            <XCircle className="h-12 w-12 text-red-400" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-4"
          style={{ fontFamily: 'var(--font-head)' }}
        >
          Checkout Cancelled
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 mb-8 text-lg"
        >
          No worries! Your payment was not processed. You can try again whenever you're ready.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <Button
            asChild
            className="w-full bg-[#8BE196] text-[#161616] hover:bg-[#9DF4A8]"
            size="lg"
          >
            <Link href="/pricing">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
            size="lg"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Need help?</span>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-500">
              If you encountered any issues during checkout, our support team is here to help.
            </p>
            <a
              href="mailto:support@wessley.ai"
              className="inline-block text-[#8BE196] hover:underline"
            >
              support@wessley.ai
            </a>
          </div>
        </motion.div>

        {/* Common Issues */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-left"
        >
          <h2 className="text-sm font-semibold text-white mb-3">
            Common reasons for cancellation:
          </h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-gray-500">•</span>
              Payment method declined - try a different card
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-500">•</span>
              Browser blocked popup - check your popup blocker
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-500">•</span>
              Connection interrupted - check your internet connection
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  )
}
