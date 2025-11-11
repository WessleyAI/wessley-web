'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative w-full bg-transparent hidden md:block" style={{ minHeight: '69vh' }}>
      {/* Dark Footer Section - 90% width */}
      <div className="w-[90%] bg-[#1a1a1a] text-white" style={{ borderTopRightRadius: 'calc(var(--border-radius) * 2.94)', minHeight: '69vh' }}>
        {/* Main Footer Content */}
        <div className="w-full px-16 py-12">
        {/* Top Section - Large Text */}
        <div style={{ marginBottom: '8%' }}>
          <div className="flex items-center gap-16">
            <h2
              style={{
                color: '#F5F5F5',
                fontFamily: 'var(--font-head)',
                fontSize: 'calc(var(--sizer) * 2.34rem)',
                fontWeight: 400,
                lineHeight: 0.9,
              }}
            >
              Artificial<br />
              Intelligence
            </h2>
            <span
              style={{
                fontSize: 'calc(var(--sizer) * 3.12rem)',
                color: '#F5F5F5',
                fontWeight: 200,
              }}
            >
              +
            </span>
            <h2
              style={{
                color: '#F5F5F5',
                fontFamily: 'var(--font-head)',
                fontSize: 'calc(var(--sizer) * 2.34rem)',
                fontWeight: 400,
                lineHeight: 0.9,
              }}
            >
              Precise<br />
              Knowledge
            </h2>
          </div>
        </div>

        {/* Middle Section - Logo & Description */}
        <div className="flex items-start gap-6" style={{ marginBottom: '7%' }}>
          {/* Logo */}
          <div className="flex items-start gap-4" style={{ fontFamily: 'var(--font-head)' }}>
            <img
              src="/header/logo.svg"
              alt="Wessley Logo"
              className="w-[42px] h-[42px]"
              style={{ filter: 'brightness(0) saturate(100%) invert(78%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(96%) contrast(87%)' }}
            />
            <span className="text-[18px] font-medium tracking-wider" style={{ color: '#F5F5F5' }}>WESSLEY</span>
            <div className="opacity-30" style={{ backgroundColor: '#F5F5F5', height: '36px', width: '1.5px' }} />
            <span className="text-[18px] font-light tracking-wider max-w-[50%]" style={{ color: '#F5F5F5', lineHeight: '0.9' }}>AUTOMOTIVE INTELLIGENCE</span>
          </div>

          {/* Description */}
          <p
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'calc(var(--sizer) * 0.75rem)',
              color: '#F5F5F5',
              maxWidth: '600px',
              lineHeight: 1,
            }}
          >
            Wessley bridges human craftsmanship and artificial intelligence — helping restorers and enthusiasts understand, restore, and preserve vehicles with precision. We call it Automotive Intelligence.
          </p>
        </div>

        {/* Bottom Section - Links and Social Media */}
        <div className="flex items-start gap-12">
          {/* Links Grid */}
          <div className="grid grid-cols-4 gap-6" style={{ maxWidth: '44%' }}>
            {/* Get Started */}
            <div>
              <h5
                style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: 'calc(var(--sizer) * 0.5rem)',
                  fontWeight: 500,
                  color: '#F5F5F5',
                  marginBottom: 'calc(var(--sizer) * 0.5rem)',
                  opacity: 0.6,
                }}
              >
                Get Started
              </h5>
            <ul className="-space-y-1">
              <li>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <motion.div
                    whileHover={{ color: '#8BE196' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Link
                      href="#"
                      style={{
                        fontFamily: 'var(--font-head)',
                        fontSize: 'calc(var(--sizer) * 0.5rem)',
                        color: 'inherit',
                      }}
                    >
                      JOIN WAITLIST
                    </Link>
                  </motion.div>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    WATCH DEMO
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    DOCUMENTATION
                  </Link>
                </motion.div>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h5
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'calc(var(--sizer) * 0.5rem)',
                fontWeight: 500,
                color: '#F5F5F5',
                marginBottom: 'calc(var(--sizer) * 0.5rem)',
                opacity: 0.6,
              }}
            >
              Company
            </h5>
            <ul className="-space-y-1">
              <li>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    ABOUT
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    CAREERS
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    PRESS
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    PRIVACY
                  </Link>
                </motion.div>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h5
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'calc(var(--sizer) * 0.5rem)',
                fontWeight: 500,
                color: '#F5F5F5',
                marginBottom: 'calc(var(--sizer) * 0.5rem)',
                opacity: 0.6,
              }}
            >
              Connect
            </h5>
            <ul className="-space-y-1">
              <li>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    DISCORD
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    INSTAGRAM
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    YOUTUBE
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    GITHUB
                  </Link>
                </motion.div>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'calc(var(--sizer) * 0.5rem)',
                fontWeight: 500,
                color: '#F5F5F5',
                marginBottom: 'calc(var(--sizer) * 0.5rem)',
                opacity: 0.6,
              }}
            >
              Resources
            </h5>
            <ul style={{ marginTop: 0, marginBottom: 0 }}>
              <li style={{ marginTop: '-0.25rem' }}>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    KNOWLEDGE BASE
                  </Link>
                </motion.div>
              </li>
              <li style={{ marginTop: '-0.25rem' }}>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    AI MARKETPLACE
                  </Link>
                </motion.div>
              </li>
              <li style={{ marginTop: '-0.25rem' }}>
                <motion.div
                  whileHover={{
                    backgroundColor: 'rgba(250, 250, 250, 0.95)', color: '#1a1a1a',
                  }}
                  style={{
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'inline-block',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    style={{
                      fontFamily: 'var(--font-head)',
                      fontSize: 'calc(var(--sizer) * 0.5rem)',
                      color: '#F5F5F5',
                    }}
                  >
                    EXPLORE PROJECTS
                  </Link>
                </motion.div>
              </li>
            </ul>
          </div>
        </div>

          {/* Social Media Icons */}
          <div className="flex items-center gap-4">
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity"
            aria-label="Instagram"
          >
            <Instagram
              size={20}
              style={{ color: '#F5F5F5' }}
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
              size={20}
              style={{ color: '#F5F5F5' }}
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
              size={20}
              style={{ color: '#F5F5F5' }}
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
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                fill="#F5F5F5"
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
              size={20}
              style={{ color: '#F5F5F5' }}
            />
          </Link>
          </div>
        </div>
        </div>

        {/* Bottom Bar - Copyright */}
        <div className="px-16 py-4">
          <p
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'calc(var(--sizer) * 0.4rem)',
              color: '#F5F5F5',
              opacity: 0.8,
            }}
          >
            WESSLEY © 2025. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>

      {/* Become an Insider Button - Bottom Right */}
      <div className="absolute bottom-0 right-0">
        <motion.button
          onClick={() => {
            const waitlistSection = document.getElementById('waitlist-section')
            waitlistSection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
          style={{
            background: 'linear-gradient(135deg, #8BE196 0%, #7dd085 100%)',
            borderTopLeftRadius: 'var(--border-radius)',
            fontFamily: 'var(--font-head)',
            fontSize: 'calc(var(--sizer) * 1.5rem)',
            fontWeight: 600,
            color: '#463B47',
            paddingLeft: 'calc(var(--sizer) * 2rem)',
            paddingRight: 'calc(var(--sizer) * 3rem)',
            paddingTop: 'calc(var(--sizer) * 1.25rem)',
            paddingBottom: 'calc(var(--sizer) * 1.25rem)',
            lineHeight: 1.2,
            textAlign: 'left',
            cursor: 'pointer',
            whiteSpace: 'normal',
            border: 'none',
          }}
          whileHover={{
            background: 'linear-gradient(135deg, #7dd085 0%, #6bc074 100%)',
            color: '#FFFFFF',
            scale: 1.02,
          }}
          transition={{ duration: 0.2 }}
        >
          Become<br />
          An Insider
        </motion.button>
      </div>
    </footer>
  )
}
