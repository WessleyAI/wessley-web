'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function NavigationOverlay() {
  return (
    <>
      {/* Radial gradient blur effect above the explore component */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          left: '-45%',
          top: '15%',
          width: '130vw',
          height: '88vh',
          background: 'radial-gradient(circle at 20% 30%, rgba(235, 255, 233, 1) 0%, rgba(235, 255, 233, 1) 39%, rgba(235, 255, 233, 0.1) 54%, rgba(235, 255, 233, 0) 78%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Navigation Menu */}
      <div
        className="absolute z-20 flex flex-col items-start gap-0"
        style={{
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        {/* Feed Button */}
        <motion.button
          className="flex items-center gap-4 transition-all overflow-hidden shadow-2xl"
          style={{
            backgroundColor: '#5B4D5C',
            paddingLeft: '32px',
            paddingRight: '32px',
            paddingTop: '20px',
            paddingBottom: '20px',
            width: '180px',
            borderTopLeftRadius: 'var(--border-radius)',
            borderTopRightRadius: 'var(--border-radius)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src="/third/feed.svg"
            alt="Feed"
            width={20}
            height={20}
            style={{
              filter: 'invert(1)',
              opacity: 0.4,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '16px',
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
          className="flex items-center gap-4 transition-all shadow-2xl overflow-hidden"
          style={{
            backgroundColor: '#463B47',
            paddingLeft: '32px',
            paddingRight: '32px',
            paddingTop: '28px',
            paddingBottom: '28px',
            width: '240px',
            borderTopRightRadius: 'var(--border-radius)',
            borderBottomRightRadius: 'var(--border-radius)',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src="/third/explore.svg"
            alt="Explore"
            width={20}
            height={20}
            style={{
              filter: 'invert(1)',
              opacity: 1.0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '16px',
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
          className="flex items-center gap-4 transition-all overflow-hidden shadow-2xl"
          style={{
            backgroundColor: '#5B4D5C',
            paddingLeft: '32px',
            paddingRight: '32px',
            paddingTop: '20px',
            paddingBottom: '20px',
            width: '180px',
            borderBottomLeftRadius: 'var(--border-radius)',
            borderBottomRightRadius: 'var(--border-radius)',
          }}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src="/third/marketplace.svg"
            alt="Marketplace"
            width={20}
            height={20}
            style={{
              filter: 'invert(1)',
              opacity: 0.4,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '16px',
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
