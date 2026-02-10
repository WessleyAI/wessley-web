import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WaitlistHeader } from './WaitlistHeader'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    img: ({ alt, src, ...props }: any) => <img alt={alt} src={src} />,
    span: ({ children }: any) => <span>{children}</span>,
    div: ({ children, className, ...props }: any) => <div className={className}>{children}</div>,
    button: ({ children, onClick, className, ...props }: any) => (
      <button onClick={onClick} className={className}>{children}</button>
    ),
    a: ({ children, onClick, href, className, style, ...props }: any) => (
      <a href={href} onClick={onClick} className={className} style={style}>{children}</a>
    ),
  },
}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

describe('WaitlistHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the brand name', () => {
    render(<WaitlistHeader />)
    expect(screen.getByText('WESSLEY')).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<WaitlistHeader />)
    expect(screen.getByText('AUTOMOTIVE INTELLIGENCE')).toBeInTheDocument()
  })

  it('renders the logo image', () => {
    render(<WaitlistHeader />)
    expect(screen.getByAltText('Wessley Logo')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<WaitlistHeader />)
    expect(screen.getByText('ABOUT')).toBeInTheDocument()
    expect(screen.getByText('CONTACT')).toBeInTheDocument()
  })

  it('renders the DEMO button', () => {
    render(<WaitlistHeader />)
    expect(screen.getByText('DEMO')).toBeInTheDocument()
  })

  it('navigates to demo page when DEMO is clicked', () => {
    render(<WaitlistHeader />)
    fireEvent.click(screen.getByText('DEMO'))
    expect(mockPush).toHaveBeenCalledWith('/g/cde0ea8e-07aa-4c59-a72b-ba0d56020484/project')
  })

  it('renders the Become An Insider button', () => {
    render(<WaitlistHeader />)
    expect(screen.getByText(/Become/)).toBeInTheDocument()
    expect(screen.getByText(/An Insider/)).toBeInTheDocument()
  })

  it('links ABOUT to GitHub', () => {
    render(<WaitlistHeader />)
    const aboutLink = screen.getByText('ABOUT').closest('a')
    expect(aboutLink).toHaveAttribute('href', 'https://github.com/wessleyai')
  })

  it('links CONTACT to LinkedIn', () => {
    render(<WaitlistHeader />)
    const contactLink = screen.getByText('CONTACT').closest('a')
    expect(contactLink).toHaveAttribute('href', 'https://linkedin.com/in/saharbarak')
  })
})
