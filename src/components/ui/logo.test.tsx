import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Logo } from './logo'

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}))

describe('Logo', () => {
  it('renders the brand name', () => {
    render(<Logo />)
    expect(screen.getByText('WESSLEY AI')).toBeInTheDocument()
  })

  it('renders light and dark mode logo images', () => {
    render(<Logo />)
    const images = screen.getAllByAltText('Wessley AI')
    expect(images).toHaveLength(2)
  })

  it('renders light logo with correct src', () => {
    render(<Logo />)
    const images = screen.getAllByAltText('Wessley AI')
    expect(images[0]).toHaveAttribute('src', '/logo-light.svg')
  })

  it('renders dark logo with correct src', () => {
    render(<Logo />)
    const images = screen.getAllByAltText('Wessley AI')
    expect(images[1]).toHaveAttribute('src', '/logo-dark.svg')
  })

  it('applies brand color to text', () => {
    render(<Logo />)
    const text = screen.getByText('WESSLEY AI')
    expect(text).toHaveStyle({ color: '#22E974' })
  })
})
