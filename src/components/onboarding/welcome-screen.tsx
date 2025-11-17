'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Car, Sparkles } from 'lucide-react'

interface WelcomeScreenProps {
  onComplete: (carModel: string, nickname: string) => void
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [step, setStep] = useState<'greeting' | 'model' | 'nickname'>('greeting')
  const [carModel, setCarModel] = useState('')
  const [nickname, setNickname] = useState('')

  const handleGreetingNext = () => {
    setStep('model')
  }

  const handleModelNext = () => {
    if (!carModel.trim()) return
    setStep('nickname')
  }

  const handleComplete = () => {
    if (!nickname.trim()) return
    onComplete(carModel, nickname)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl px-8"
      >
        {/* Greeting Step */}
        {step === 'greeting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="flex justify-center mb-8">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Sparkles className="w-20 h-20 text-green-400" />
              </motion.div>
            </div>

            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome to Wessley
            </h1>

            <p className="text-xl text-gray-300 mb-8">
              Your AI-powered automotive assistant is ready to help you understand
              <br />
              every circuit, system, and connection in your vehicle.
            </p>

            <motion.button
              onClick={handleGreetingNext}
              className="px-8 py-4 bg-green-500 text-white rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Let's Get Started
            </motion.button>
          </motion.div>
        )}

        {/* Car Model Step */}
        {step === 'model' && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <Car className="w-12 h-12 text-green-400" />
              <h2 className="text-4xl font-bold text-white">
                What car are we working with?
              </h2>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleModelNext()}
                placeholder="e.g., 2000 Hyundai Galloper 3.0L"
                className="w-full px-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-white text-xl placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                autoFocus
              />

              <p className="text-gray-400 text-sm">
                Enter your vehicle's year, make, model, and engine (if known)
              </p>
            </div>

            <div className="flex gap-4">
              <motion.button
                onClick={() => setStep('greeting')}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>

              <motion.button
                onClick={handleModelNext}
                disabled={!carModel.trim()}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={carModel.trim() ? { scale: 1.05 } : {}}
                whileTap={carModel.trim() ? { scale: 0.95 } : {}}
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Nickname Step */}
        {step === 'nickname' && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">
                Give your project a name
              </h2>
              <p className="text-xl text-gray-300">
                This will be the name of your workspace for {carModel}
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComplete()}
                placeholder={`e.g., "Project ${carModel.split(' ')[0]}" or "The Beast"`}
                className="w-full px-6 py-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-white text-xl placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                autoFocus
              />

              <p className="text-gray-400 text-sm">
                Choose a memorable name - you can change it later
              </p>
            </div>

            <div className="flex gap-4">
              <motion.button
                onClick={() => setStep('model')}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>

              <motion.button
                onClick={handleComplete}
                disabled={!nickname.trim()}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={nickname.trim() ? { scale: 1.05 } : {}}
                whileTap={nickname.trim() ? { scale: 0.95 } : {}}
              >
                Create Workspace
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
