import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AnthropicSVG } from './anthropic-svg'
import { GoogleSVG } from './google-svg'
import { OpenAISVG } from './openai-svg'

describe('Icon SVGs', () => {
  describe('AnthropicSVG', () => {
    it('renders an SVG element', () => {
      const { container } = render(<AnthropicSVG />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('uses default dimensions', () => {
      const { container } = render(<AnthropicSVG />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '40')
      expect(svg).toHaveAttribute('height', '40')
    })

    it('accepts custom dimensions', () => {
      const { container } = render(<AnthropicSVG width={24} height={24} />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '24')
      expect(svg).toHaveAttribute('height', '24')
    })

    it('applies className', () => {
      const { container } = render(<AnthropicSVG className="my-icon" />)
      expect(container.querySelector('svg')).toHaveClass('my-icon')
    })
  })

  describe('GoogleSVG', () => {
    it('renders an SVG element', () => {
      const { container } = render(<GoogleSVG />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('uses default dimensions', () => {
      const { container } = render(<GoogleSVG />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '40')
    })

    it('accepts custom dimensions', () => {
      const { container } = render(<GoogleSVG width={16} height={16} />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '16')
    })
  })

  describe('OpenAISVG', () => {
    it('renders an SVG with role img', () => {
      const { container } = render(<OpenAISVG />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('role', 'img')
    })

    it('uses default dimensions', () => {
      const { container } = render(<OpenAISVG />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '40')
    })

    it('applies className', () => {
      const { container } = render(<OpenAISVG className="ai-icon" />)
      expect(container.querySelector('svg')).toHaveClass('ai-icon')
    })
  })
})
