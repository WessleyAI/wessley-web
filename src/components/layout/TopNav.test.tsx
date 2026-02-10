import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopNav } from './TopNav'

const mockSignInWithGoogle = vi.fn()

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({
    signInWithGoogle: mockSignInWithGoogle,
  }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

vi.mock('@/components/ui/logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}))

describe('TopNav', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the logo', () => {
    render(<TopNav />)
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('renders About and Contact links', () => {
    render(<TopNav />)
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders Login and Sign up buttons', () => {
    render(<TopNav />)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('About links to GitHub repo', () => {
    render(<TopNav />)
    const aboutLink = screen.getByText('About')
    expect(aboutLink).toHaveAttribute('href', 'https://github.com/SaharBarak/wessley.ai')
  })

  it('Contact links to LinkedIn', () => {
    render(<TopNav />)
    const contactLink = screen.getByText('Contact')
    expect(contactLink).toHaveAttribute('href', 'https://www.linkedin.com/in/saharbarak/')
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
})
