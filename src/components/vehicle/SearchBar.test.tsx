import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('renders the search input', () => {
    render(<SearchBar />)
    expect(
      screen.getByPlaceholderText('Search for restoration projects...')
    ).toBeInTheDocument()
  })

  it('renders with text input type', () => {
    render(<SearchBar />)
    const input = screen.getByPlaceholderText('Search for restoration projects...')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('applies box shadow on focus and removes on blur', () => {
    render(<SearchBar />)
    const input = screen.getByPlaceholderText('Search for restoration projects...')

    fireEvent.focus(input)
    expect(input.style.boxShadow).toBe('0 0 0 2px var(--app-accent-subtle)')

    fireEvent.blur(input)
    expect(input.style.boxShadow).toBe('none')
  })

  it('allows typing in the input', () => {
    render(<SearchBar />)
    const input = screen.getByPlaceholderText(
      'Search for restoration projects...'
    ) as HTMLInputElement

    fireEvent.change(input, { target: { value: 'mustang' } })
    expect(input.value).toBe('mustang')
  })
})
