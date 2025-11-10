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
          background: 'radial-gradient(circle at 20% 45%, rgba(235, 255, 233, 1) 0%, rgba(235, 255, 233, 1) 39%, rgba(235, 255, 233, 0.1) 54%, rgba(235, 255, 233, 0) 78%)',
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
          style={{
            backgroundColor: '#8BE196',
            opacity: 0.8
          }}
        >
          <Image
            src="/third/feed.svg"
            alt="Feed"
            width={0}
            height={0}
            style={{
              filter: 'brightness(0) saturate(100%)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 500,
              color: '#000',
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
          style={{
            backgroundColor: '#8BE196',
            opacity: 1
          }}
        >
          <Image
            src="/third/explore.svg"
            alt="Explore"
            width={0}
            height={0}
            style={{
              filter: 'brightness(0) saturate(100%)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 500,
              color: '#000',
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
          style={{
            backgroundColor: '#8BE196',
            opacity: 0.8
          }}
        >
          <Image
            src="/third/marketplace.svg"
            alt="Marketplace"
            width={0}
            height={0}
            style={{
              filter: 'brightness(0) saturate(100%)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 500,
              color: '#000',
            }}
          >
            Marketplace
          </span>
        </motion.button>
      </div>
    </>
  )
}
