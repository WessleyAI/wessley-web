import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'

const mockSetTheme = vi.fn()
let mockTheme = 'light'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}))

// Mock framer-motion to render plain elements
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTheme = 'light'
  })

  it('renders toggle button with aria-label', () => {
    render(<ThemeToggle />)
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
  })

  it('switches to dark theme when currently light', () => {
    mockTheme = 'light'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByLabelText('Toggle theme'))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('switches to light theme when currently dark', () => {
    mockTheme = 'dark'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByLabelText('Toggle theme'))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
