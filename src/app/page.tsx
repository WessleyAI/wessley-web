'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { TwitterIcon } from '@/components/ui/twitter-icon'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { useAuth } from '@/lib/hooks/use-auth'

export default function Home() {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const { signInWithGoogle } = useAuth()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const floatAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }


  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center px-4 sm:px-0">
      <motion.div 
        className="relative z-10 grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Column: Hero Content */}
        <div className="flex flex-col justify-center space-y-6 sm:space-y-8 px-4 sm:pl-8 lg:pl-12">
          <motion.div className="space-y-4 sm:space-y-6" variants={itemVariants}>
            <motion.h1 
              className="keania-one-regular tracking-wide text-3xl sm:text-4xl lg:text-5xl xl:text-6xl" 
              style={{color: '#22E974'}}
              animate={{
                textShadow: [
                  '0 0 20px rgba(34, 233, 116, 0.3)',
                  '0 0 30px rgba(34, 233, 116, 0.5)',
                  '0 0 20px rgba(34, 233, 116, 0.3)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              MEET WESSLEY.
            </motion.h1>
            <motion.p 
              className="font-sans text-black dark:text-white max-w-lg font-semibold text-lg sm:text-xl lg:text-2xl" 
              variants={itemVariants}
            >
              Your project car electrician, companion — and your new car project dashboard.
            </motion.p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button 
              size="lg" 
              className="bg-primary text-black hover:bg-primary/90 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-inter font-black text-sm sm:text-base"
              onClick={signInWithGoogle}
            >
              Start Building →
            </Button>
          </motion.div>
        </div>

        {/* Right Column: Animated Illustrations */}
        <motion.div 
          className="flex items-center justify-center px-4 mt-8 lg:mt-0"
          variants={itemVariants}
        >
          {/* Light mode illustration */}
          <motion.img 
            src="/illus-light.png" 
            alt="Wessley AI Illustration" 
            className="w-full max-w-sm sm:max-w-md lg:max-w-full h-auto dark:hidden"
            animate={floatAnimation}
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              transition: { duration: 0.3 }
            }}
          />
          {/* Dark mode illustration */}
          <motion.img 
            src="/illus-dark.png" 
            alt="Wessley AI Illustration" 
            className="w-full max-w-sm sm:max-w-md lg:max-w-full h-auto hidden dark:block"
            animate={floatAnimation}
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              transition: { duration: 0.3 }
            }}
          />
        </motion.div>
      </motion.div>

      {/* Animated background elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 0
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/3 w-1 h-1 bg-primary/40 rounded-full"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 1
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary/20 rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          delay: 2
        }}
      />

      {/* Floating Buttons */}
      <>
        {/* Theme toggle - bottom left */}
        <div className="fixed bottom-6 left-6 z-50">
          <ThemeToggle />
        </div>
        
        {/* Twitter/X button - bottom right */}
        <div className="fixed bottom-6 right-6 z-50">
          <motion.button
            className="text-black dark:text-white bg-transparent border-none cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <TwitterIcon className="h-8 w-8" />
          </motion.button>
        </div>
      </>
      
      <Dashboard 
        isOpen={isDashboardOpen} 
        onClose={() => setIsDashboardOpen(false)} 
      />
    </div>
  )
}
