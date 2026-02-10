import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PricingPage from './page'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    h1: ({ children, ...props }: Record<string, unknown>) => <h1>{children as React.ReactNode}</h1>,
    p: ({ children, ...props }: Record<string, unknown>) => <p>{children as React.ReactNode}</p>,
    div: ({ children, ...props }: Record<string, unknown>) => <div>{children as React.ReactNode}</div>,
  },
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

describe('PricingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the pricing page title', () => {
    render(<PricingPage />)
    expect(screen.getByText('Simple, Transparent Pricing')).toBeInTheDocument()
  })

  it('renders all four pricing tiers', () => {
    render(<PricingPage />)
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Insiders')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('shows tier prices', () => {
    render(<PricingPage />)
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('$9.99')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('Contact us')).toBeInTheDocument()
  })

  it('shows Most Popular badge on Insiders tier', () => {
    render(<PricingPage />)
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('disables the Free tier button', () => {
    render(<PricingPage />)
    const currentPlanBtn = screen.getByText('Current Plan')
    expect(currentPlanBtn.closest('button')).toBeDisabled()
  })

  it('renders Get Started buttons for paid tiers', () => {
    render(<PricingPage />)
    const getStartedBtns = screen.getAllByText('Get Started')
    expect(getStartedBtns).toHaveLength(2) // Insiders + Pro
  })

  it('renders Contact Sales for enterprise', () => {
    render(<PricingPage />)
    expect(screen.getByText('Contact Sales')).toBeInTheDocument()
  })

  it('renders FAQ section', () => {
    render(<PricingPage />)
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
    expect(screen.getByText('Can I cancel anytime?')).toBeInTheDocument()
    expect(screen.getByText('What payment methods do you accept?')).toBeInTheDocument()
    expect(screen.getByText('Is there a refund policy?')).toBeInTheDocument()
  })

  it('renders back to home link', () => {
    render(<PricingPage />)
    const link = screen.getByText('Back to home')
    expect(link.closest('a')).toHaveAttribute('href', '/')
  })

  it('shows feature lists for tiers', () => {
    render(<PricingPage />)
    expect(screen.getByText('Unlimited AI chat')).toBeInTheDocument()
    expect(screen.getByText('View demo projects')).toBeInTheDocument()
  })
})
