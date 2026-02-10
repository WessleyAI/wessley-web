import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { TwitterIcon } from './twitter-icon'

describe('TwitterIcon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<TwitterIcon />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies className prop', () => {
    const { container } = render(<TwitterIcon className="w-6 h-6" />)
    expect(container.querySelector('svg')).toHaveClass('w-6', 'h-6')
  })

  it('renders without className', () => {
    const { container } = render(<TwitterIcon />)
    const svg = container.querySelector('svg')
    expect(svg).not.toHaveAttribute('class')
  })
})
