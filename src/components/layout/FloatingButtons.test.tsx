import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FloatingButtons } from './FloatingButtons'

let mockPathname = '/'

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

vi.mock('@/components/theme/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}))

vi.mock('@/components/ui/twitter-icon', () => ({
  TwitterIcon: (props: any) => <svg data-testid="twitter-icon" {...props} />,
}))

describe('FloatingButtons', () => {
  it('renders theme toggle and twitter icon on home page', () => {
    mockPathname = '/'
    render(<FloatingButtons />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument()
  })

  it('returns null on non-home pages', () => {
    mockPathname = '/dashboard'
    const { container } = render(<FloatingButtons />)
    expect(container.innerHTML).toBe('')
  })
})
