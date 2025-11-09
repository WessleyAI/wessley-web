'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function NavigationOverlay() {
  return (
    <>
      {/* Radial gradient blur effect above the explore component */}
      <div
        className="section3-radial-overlay"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(235, 255, 233, 1) 0%, rgba(235, 255, 233, 1) 39%, rgba(235, 255, 233, 0.1) 54%, rgba(235, 255, 233, 0) 78%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Navigation Menu */}
      <div className="section3-nav-container">
        {/* Feed Button */}
        <motion.button
          className="section3-nav-button section3-nav-feed"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src="/third/feed.svg"
            alt="Feed"
            width={0}
            height={0}
            style={{
              filter: 'invert(1)',
              opacity: 0.4,
              width: 'calc(var(--sizer) * 1rem)',
              height: 'calc(var(--sizer) * 1rem)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 'calc(var(--sizer) * 0.75rem)',
              fontWeight: 500,
              color: '#C4C4C4',
              opacity: 0.4,
            }}
          >
            Feed
          </span>
        </motion.button>

        {/* Explore Button (Active) */}
        <motion.button
          className="section3-nav-button section3-nav-explore"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src="/third/explore.svg"
            alt="Explore"
            width={0}
            height={0}
            style={{
              filter: 'invert(1)',
              opacity: 1.0,
              width: 'calc(var(--sizer) * 1rem)',
              height: 'calc(var(--sizer) * 1rem)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 'calc(var(--sizer) * 0.75rem)',
              fontWeight: 500,
              color: '#C4C4C4',
              opacity: 1.0,
            }}
          >
            Explore
          </span>
        </motion.button>

        {/* Marketplace Button */}
        <motion.button
          className="section3-nav-button section3-nav-marketplace"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src="/third/marketplace.svg"
            alt="Marketplace"
            width={0}
            height={0}
            style={{
              filter: 'invert(1)',
              opacity: 0.4,
              width: 'calc(var(--sizer) * 1rem)',
              height: 'calc(var(--sizer) * 1rem)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 'calc(var(--sizer) * 0.75rem)',
              fontWeight: 500,
              color: '#C4C4C4',
              opacity: 0.4,
            }}
          >
            Marketplace
          </span>
        </motion.button>
      </div>
    </>
  )
}
