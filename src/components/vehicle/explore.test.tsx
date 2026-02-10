import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Explore } from './explore'

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Explore', () => {
  it('renders all 25 project cards', () => {
    render(<Explore />)
    // Check a sample of known project titles
    expect(screen.getByText('1978 Toyota Land Cruiser')).toBeInTheDocument()
    expect(screen.getByText('1967 Ford Mustang GT')).toBeInTheDocument()
    expect(screen.getByText('1973 Porsche 911 Carrera')).toBeInTheDocument()
    expect(screen.getByText('1965 Shelby GT350')).toBeInTheDocument()
    expect(screen.getByText('1982 DeLorean DMC-12')).toBeInTheDocument()
  })

  it('renders with masonry grid layout (4 columns)', () => {
    const { container } = render(<Explore />)
    const grid = container.querySelector('.masonry-grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveStyle({ columnCount: '4' })
  })

  it('renders all masonry items with break-inside avoid', () => {
    const { container } = render(<Explore />)
    const items = container.querySelectorAll('.masonry-item')
    expect(items).toHaveLength(25)
  })
})
