'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react'

export function FooterMobile() {
  return (
    <footer className="relative w-full bg-[#1a1a1a] text-white px-6 py-12 md:hidden">
      {/* Top Section - Large Text */}
      <div style={{ marginBottom: '3rem' }}>
        <div className="flex flex-col gap-4">
          <h2
            style={{
              color: '#C4C4C4',
              fontFamily: 'var(--font-head)',
              fontSize: 'calc(var(--sizer) * 2.5rem)',
              fontWeight: 400,
              lineHeight: 0.9,
            }}
          >
            Artificial<br />
            Intelligence
          </h2>
          <span
            style={{
              fontSize: 'calc(var(--sizer) * 3.5rem)',
              color: '#C4C4C4',
              fontWeight: 200,
            }}
          >
            +
          </span>
          <h2
            style={{
              color: '#C4C4C4',
              fontFamily: 'var(--font-head)',
              fontSize: 'calc(var(--sizer) * 2.5rem)',
              fontWeight: 400,
              lineHeight: 0.9,
            }}
          >
            Human<br />
            Creativity
          </h2>
        </div>
      </div>

      {/* Logo Section */}
      <div className="flex flex-col gap-4" style={{ marginBottom: '2.5rem' }}>
        <div className="flex items-start gap-3" style={{ fontFamily: 'var(--font-head)' }}>
          <img
            src="/header/logo.svg"
            alt="Wessley Logo"
            className="w-[32px] h-[32px]"
            style={{ filter: 'brightness(0) saturate(100%) invert(78%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(96%) contrast(87%)' }}
          />
          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-medium tracking-wider" style={{ color: '#C4C4C4' }}>
              WESSLEY
            </span>
            <span className="text-[14px] font-light tracking-wider leading-tight" style={{ color: '#C4C4C4' }}>
              AUTOMOTIVE INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'calc(var(--sizer) * 0.75rem)',
            color: '#C4C4C4',
            lineHeight: 1.4,
            opacity: 0.8,
          }}
        >
          Wessley is a new way to create. We're bridging the gap between AI capabilities and human creativity, to continue the tradition of craft in artistic expression. We call it Artistic Intelligence.
        </p>
      </div>

      {/* Become an Insider Button */}
      <div style={{ marginBottom: '2.5rem' }}>
        <motion.button
          onClick={() => {
            const waitlistSection = document.getElementById('waitlist-section')
            waitlistSection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #8BE196 0%, #7dd085 100%)',
            borderRadius: 'var(--border-radius)',
            fontFamily: 'var(--font-head)',
            fontSize: 'calc(var(--sizer) * 1rem)',
            fontWeight: 600,
            color: '#463B47',
            paddingTop: 'calc(var(--sizer) * 1rem)',
            paddingBottom: 'calc(var(--sizer) * 1rem)',
            textTransform: 'uppercase',
            cursor: 'pointer',
            border: 'none',
          }}
          whileHover={{
            background: 'linear-gradient(135deg, #7dd085 0%, #6bc074 100%)',
            color: '#FFFFFF',
            scale: 1.02,
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          Become<br />An Insider
        </motion.button>
      </div>

      {/* Links Section */}
      <div className="grid grid-cols-2 gap-8" style={{ marginBottom: '2.5rem' }}>
        {/* Get Started */}
        <div>
          <h5
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'calc(var(--sizer) * 0.55rem)',
              fontWeight: 500,
              color: '#C4C4C4',
              marginBottom: 'calc(var(--sizer) * 0.75rem)',
              opacity: 0.6,
              textTransform: 'uppercase',
            }}
          >
            Get Started
          </h5>
          <ul className="space-y-2">
            <li>
              <Link
                href="#"
                style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: 'calc(var(--sizer) * 0.55rem)',
                  color: '#C4C4C4',
                  textTransform: 'uppercase',
                }}
                className="hover:text-white transition-colors"
              >
                Request a Demo
              </Link>
            </li>
            <li>
              <Link
                href="#"
                style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: 'calc(var(--sizer) * 0.55rem)',
                  color: '#C4C4C4',
                  textTransform: 'uppercase',
                }}
                className="hover:text-white transition-colors"
              >
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h5
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'calc(var(--sizer) * 0.55rem)',
              fontWeight: 500,
              color: '#C4C4C4',
              marginBottom: 'calc(var(--sizer) * 0.75rem)',
              opacity: 0.6,
              textTransform: 'uppercase',
            }}
          >
            Company
          </h5>
          <ul className="space-y-2">
            <li>
              <Link
                href="#"
                style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: 'calc(var(--sizer) * 0.55rem)',
                  color: '#C4C4C4',
                  textTransform: 'uppercase',
                }}
                className="hover:text-white transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="#"
                style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: 'calc(var(--sizer) * 0.55rem)',
                  color: '#C4C4C4',
                  textTransform: 'uppercase',
                }}
                className="hover:text-white transition-colors"
              >
                Careers
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Social Media Icons */}
      <div className="flex items-center justify-center gap-6" style={{ marginBottom: '2rem' }}>
        <Link
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
          aria-label="Instagram"
        >
          <Instagram
            size={24}
            style={{ color: '#C4C4C4' }}
          />
        </Link>
        <Link
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
          aria-label="Twitter"
        >
          <Twitter
            size={24}
            style={{ color: '#C4C4C4' }}
          />
        </Link>
        <Link
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
          aria-label="LinkedIn"
        >
          <Linkedin
            size={24}
            style={{ color: '#C4C4C4' }}
          />
        </Link>
        <Link
          href="https://discord.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
          aria-label="Discord"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
              fill="#C4C4C4"
            />
          </svg>
        </Link>
        <Link
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
          aria-label="YouTube"
        >
          <Youtube
            size={24}
            style={{ color: '#C4C4C4' }}
          />
        </Link>
      </div>

      {/* Copyright */}
      <div className="text-center">
        <p
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'calc(var(--sizer) * 0.5rem)',
            color: '#C4C4C4',
            opacity: 0.6,
            textTransform: 'uppercase',
          }}
        >
          Wessley © 2025. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}
