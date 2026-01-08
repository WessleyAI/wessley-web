'use client'

import { ReactNode, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WorkspaceEntranceProps {
  show: boolean
  onComplete?: () => void
  children: ReactNode
}

export function WorkspaceEntrance({ show, onComplete, children }: WorkspaceEntranceProps) {
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    if (animationComplete && onComplete) {
      onComplete()
    }
  }, [animationComplete, onComplete])

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          className="fixed inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => setAnimationComplete(true)}
        >
          <div className="relative w-full h-full">
            {/* 3D Scene - enters from above */}
            <motion.div
              className="absolute top-0 right-0 w-2/3 h-1/2"
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1]  // Custom easing for smooth entrance
              }}
            >
              {/* Scene container - will be filled by actual 3D scene */}
              <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-gray-700">
                {/* Placeholder for 3D scene */}
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm">3D Scene Loading...</p>
                </div>
              </div>
            </motion.div>

            {/* Chat Interface - enters from below */}
            <motion.div
              className="absolute bottom-0 left-0 w-full h-1/2"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {/* Chat container - will be filled by actual chat interface */}
              <div className="w-full h-full bg-gradient-to-t from-gray-900 to-gray-800 rounded-lg overflow-hidden border border-gray-700">
                {/* Placeholder for chat */}
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Chat Interface Loading...</p>
                </div>
              </div>
            </motion.div>

            {/* Right Sidebar - enters from right */}
            <motion.div
              className="absolute top-0 right-0 w-64 h-full"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.6,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {/* Sidebar container */}
              <div className="w-full h-full bg-gray-800 border-l border-gray-700">
                {/* Placeholder for sidebar */}
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm rotate-90">Sidebar</p>
                </div>
              </div>
            </motion.div>

            {/* Left Sidebar - with project highlight */}
            <motion.div
              className="absolute top-0 left-0 w-64 h-full"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.8,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {/* Sidebar container */}
              <div className="w-full h-full bg-gray-800 border-r border-gray-700 p-4">
                {/* Project highlight animation */}
                <motion.div
                  className="p-4 rounded-lg border-2"
                  initial={{ borderColor: 'rgb(75 85 99)', backgroundColor: 'transparent' }}
                  animate={{
                    borderColor: ['rgb(75 85 99)', 'rgb(34 197 94)', 'rgb(75 85 99)'],
                    backgroundColor: ['transparent', 'rgba(34 197 94, 0.1)', 'transparent']
                  }}
                  transition={{
                    duration: 2,
                    delay: 1.5,
                    times: [0, 0.5, 1]
                  }}
                >
                  <p className="text-gray-300 font-semibold">New Project</p>
                  <p className="text-gray-500 text-sm mt-1">Just created</p>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Actual children content (hidden during animation, shown after) */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: animationComplete ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
