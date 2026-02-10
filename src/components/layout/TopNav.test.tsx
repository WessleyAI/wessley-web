import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopNav } from './TopNav'

const mockSignInWithGoogle = vi.fn()

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({
    signInWithGoogle: mockSignInWithGoogle,
    user: null,
    loading: false,
    signOut: vi.fn(),
  }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { whileHover, whileTap, transition: _t, ...rest } = props
      return <div {...rest}>{children as React.ReactNode}</div>
    },
  },
}))

vi.mock('@/components/ui/logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}))

describe('TopNav', () => {
  it('renders logo', () => {
    render(<TopNav />)
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('renders About and Contact links', () => {
    render(<TopNav />)
    const aboutLink = screen.getByText('About')
    const contactLink = screen.getByText('Contact')
    expect(aboutLink).toBeInTheDocument()
    expect(contactLink).toBeInTheDocument()
    expect(aboutLink.closest('a')).toHaveAttribute('href', 'https://github.com/SaharBarak/wessley.ai')
    expect(contactLink.closest('a')).toHaveAttribute('href', 'https://www.linkedin.com/in/saharbarak/')
  })

  it('renders Login and Sign up buttons', () => {
    render(<TopNav />)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('calls signInWithGoogle when Login is clicked', () => {
    render(<TopNav />)
    fireEvent.click(screen.getByText('Login'))
    expect(mockSignInWithGoogle).toHaveBeenCalled()
  })

  it('calls signInWithGoogle when Sign up is clicked', () => {
    render(<TopNav />)
    fireEvent.click(screen.getByText('Sign up'))
    expect(mockSignInWithGoogle).toHaveBeenCalled()
  })

  it('opens external links in new tab', () => {
    render(<TopNav />)
    expect(screen.getByText('About').closest('a')).toHaveAttribute('target', '_blank')
    expect(screen.getByText('Contact').closest('a')).toHaveAttribute('target', '_blank')
  })
})
