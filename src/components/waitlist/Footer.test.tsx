import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div>{children}</div>,
    button: ({ children, onClick, ...props }: any) => <button onClick={onClick}>{children}</button>,
  },
}))

describe('Footer', () => {
  it('renders the main heading text', () => {
    render(<Footer />)
    expect(screen.getByText(/Artificial/)).toBeInTheDocument()
    expect(screen.getByText(/Precise/)).toBeInTheDocument()
  })

  it('renders footer section headings', () => {
    render(<Footer />)
    expect(screen.getByText('Get Started')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('Connect')).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Footer />)
    expect(screen.getByText('JOIN WAITLIST')).toBeInTheDocument()
    expect(screen.getByText('WATCH DEMO')).toBeInTheDocument()
    expect(screen.getByText('ABOUT')).toBeInTheDocument()
    expect(screen.getByText('CAREERS')).toBeInTheDocument()
    expect(screen.getByText('DISCORD')).toBeInTheDocument()
    expect(screen.getByText('GITHUB')).toBeInTheDocument()
  })

  it('renders social media links with aria-labels', () => {
    render(<Footer />)
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument()
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByLabelText('Discord')).toBeInTheDocument()
    expect(screen.getByLabelText('YouTube')).toBeInTheDocument()
  })

  it('renders copyright notice', () => {
    render(<Footer />)
    expect(screen.getByText(/WESSLEY © 2025/)).toBeInTheDocument()
  })

  it('renders Become An Insider button', () => {
    render(<Footer />)
    expect(screen.getByText(/Become/)).toBeInTheDocument()
    expect(screen.getByText(/An Insider/)).toBeInTheDocument()
  })
})
