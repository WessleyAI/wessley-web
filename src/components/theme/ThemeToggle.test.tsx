import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'

const mockSetTheme = vi.fn()
let mockTheme = 'dark'

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}))

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: Record<string, unknown>) => {
      const { whileHover, whileTap, transition: _t, ...rest } = props
      return <button {...rest}>{children as React.ReactNode}</button>
    },
  },
}))

describe('ThemeToggle', () => {
  it('renders with aria-label', () => {
    render(<ThemeToggle />)
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
  })

  it('toggles from dark to light on click', () => {
    mockTheme = 'dark'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByLabelText('Toggle theme'))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('toggles from light to dark on click', () => {
    mockTheme = 'light'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByLabelText('Toggle theme'))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })
})
