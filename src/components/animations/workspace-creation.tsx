'use client'

import { motion } from 'framer-motion'

interface WorkspaceCreationOverlayProps {
  vehicleName?: string
}

export function WorkspaceCreationOverlay({ vehicleName }: WorkspaceCreationOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'var(--app-bg-primary)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Spinning loader */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-16 h-16 rounded-full border-4 border-t-transparent"
          style={{
            borderColor: 'var(--app-accent)',
            borderTopColor: 'transparent'
          }}
        />

        {/* Text */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="app-h2 mb-2"
            style={{ color: 'var(--app-text-primary)', fontFamily: 'Space Grotesk, var(--app-font-heading)' }}
          >
            Creating Your Workspace
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="app-body app-text-secondary"
          >
            Setting up {vehicleName ? `${vehicleName}'s` : 'your vehicle\'s'} electrical system...
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
