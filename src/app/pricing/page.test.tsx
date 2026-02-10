import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PricingPage from './page'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('framer-motion', () => {
  const filterProps = (props: any) => {
    const { initial, animate, transition, whileHover, whileTap, ...rest } = props
    return rest
  }
  return {
    motion: {
      h1: ({ children, ...props }: any) => <h1 {...filterProps(props)}>{children}</h1>,
      p: ({ children, ...props }: any) => <p {...filterProps(props)}>{children}</p>,
      div: ({ children, ...props }: any) => <div {...filterProps(props)}>{children}</div>,
    },
  }
})

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('@/lib/stripe', () => ({
  PRICING_INFO: {
    free: {
      name: 'Free',
      price: 0,
      interval: 'month',
      features: ['Basic access', '5 queries/day'],
    },
    insiders: {
      name: 'Insiders',
      price: 9,
      interval: 'month',
      features: ['Unlimited queries', 'Priority support'],
    },
    pro: {
      name: 'Pro',
      price: 29,
      interval: 'month',
      features: ['Everything in Insiders', 'API access'],
    },
    enterprise: {
      name: 'Enterprise',
      price: null,
      interval: 'month',
      features: ['Custom integrations', 'Dedicated support'],
    },
  },
}))

describe('PricingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renders the pricing hero section', () => {
    render(<PricingPage />)
    expect(screen.getByText('Simple, Transparent Pricing')).toBeInTheDocument()
    expect(screen.getByText(/Choose the plan that fits your needs/)).toBeInTheDocument()
  })

  it('renders all four pricing tiers', () => {
    render(<PricingPage />)
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Insiders')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('shows "Most Popular" badge on insiders tier', () => {
    render(<PricingPage />)
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('shows "Contact us" for enterprise pricing', () => {
    render(<PricingPage />)
    expect(screen.getByText('Contact us')).toBeInTheDocument()
  })

  it('shows prices for paid tiers', () => {
    render(<PricingPage />)
    expect(screen.getByText('$9')).toBeInTheDocument()
    expect(screen.getByText('$29')).toBeInTheDocument()
  })

  it('disables the Free tier button', () => {
    render(<PricingPage />)
    const currentPlanBtn = screen.getByText('Current Plan')
    expect(currentPlanBtn.closest('button')).toBeDisabled()
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

  it('calls checkout API when clicking Get Started on a paid tier', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://checkout.stripe.com/test' }),
    })
    global.fetch = mockFetch

    // Mock window.location
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    })

    render(<PricingPage />)
    const getStartedButtons = screen.getAllByText('Get Started')
    fireEvent.click(getStartedButtons[0]) // Click Insiders "Get Started"

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/stripe/checkout', expect.objectContaining({
        method: 'POST',
      }))
    })

    // Restore
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    })
  })
})
