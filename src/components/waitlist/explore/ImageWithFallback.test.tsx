import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ImageWithFallback } from './ImageWithFallback'

describe('ImageWithFallback', () => {
  it('renders image with correct src and alt', () => {
    render(<ImageWithFallback src="/test.jpg" alt="Test image" />)
    const img = screen.getByAltText('Test image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test.jpg')
  })

  it('shows fallback on error', () => {
    render(<ImageWithFallback src="/broken.jpg" alt="Broken" />)
    const img = screen.getByAltText('Broken')
    fireEvent.error(img)
    // After error, the fallback div with error image should render
    expect(screen.getByAltText('Error loading image')).toBeInTheDocument()
  })

  it('passes className to the image', () => {
    render(<ImageWithFallback src="/test.jpg" alt="Test" className="my-class" />)
    const img = screen.getByAltText('Test')
    expect(img).toHaveClass('my-class')
  })

  it('stores original URL in data attribute on error', () => {
    render(<ImageWithFallback src="/original.jpg" alt="Original" />)
    fireEvent.error(screen.getByAltText('Original'))
    const errorImg = screen.getByAltText('Error loading image')
    expect(errorImg).toHaveAttribute('data-original-url', '/original.jpg')
  })
})
