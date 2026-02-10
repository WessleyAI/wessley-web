import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WelcomeScreen } from './welcome-screen'

// Mock framer-motion to render children without animation
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...filterDomProps(props)}>{children}</div>,
    button: ({ children, onClick, disabled, className, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} className={className}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

function filterDomProps(props: Record<string, any>) {
  const { initial, animate, transition, whileHover, whileTap, ...rest } = props
  return rest
}

describe('WelcomeScreen', () => {
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the greeting step initially', () => {
    render(<WelcomeScreen onComplete={mockOnComplete} />)
    expect(screen.getByText('Welcome to Wessley')).toBeInTheDocument()
    expect(screen.getByText("Let's Get Started")).toBeInTheDocument()
  })

  it('advances to car model step when clicking Get Started', () => {
    render(<WelcomeScreen onComplete={mockOnComplete} />)
    fireEvent.click(screen.getByText("Let's Get Started"))
    expect(screen.getByText('What car are we working with?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Hyundai Galloper/)).toBeInTheDocument()
  })

  it('does not advance from model step with empty input', () => {
    render(<WelcomeScreen onComplete={mockOnComplete} />)
    fireEvent.click(screen.getByText("Let's Get Started"))
    fireEvent.click(screen.getByText('Continue'))
    // Should still be on model step
    expect(screen.getByText('What car are we working with?')).toBeInTheDocument()
  })

  it('advances to nickname step after entering car model', () => {
    render(<WelcomeScreen onComplete={mockOnComplete} />)
    fireEvent.click(screen.getByText("Let's Get Started"))

    const input = screen.getByPlaceholderText(/Hyundai Galloper/)
    fireEvent.change(input, { target: { value: '2020 Toyota Camry' } })
    fireEvent.click(screen.getByText('Continue'))

    expect(screen.getByText('Give your project a name')).toBeInTheDocument()
    expect(screen.getByText(/2020 Toyota Camry/)).toBeInTheDocument()
  })

  it('does not call onComplete with empty nickname', () => {
    render(<WelcomeScreen onComplete={mockOnComplete} />)
    // Navigate to nickname step
    fireEvent.click(screen.getByText("Let's Get Started"))
    fireEvent.change(screen.getByPlaceholderText(/Hyundai Galloper/), {
      target: { value: 'Honda Civic' },
    })
    fireEvent.click(screen.getByText('Continue'))

    // Try to complete without nickname
    fireEvent.click(screen.getByText('Create Workspace'))
    expect(mockOnComplete).not.toHaveBeenCalled()
  })

  it('calls onComplete with car model and nickname on final submit', () => {
    render(<WelcomeScreen onComplete={mockOnComplete} />)

    // Step 1: greeting
    fireEvent.click(screen.getByText("Let's Get Started"))

    // Step 2: car model
    fireEvent.change(screen.getByPlaceholderText(/Hyundai Galloper/), {
      target: { value: '2020 Toyota Camry' },
    })
    fireEvent.click(screen.getByText('Continue'))

    // Step 3: nickname
    const nicknameInput = screen.getByPlaceholderText(/Project|Beast/)
    fireEvent.change(nicknameInput, { target: { value: 'My Camry' } })
    fireEvent.click(screen.getByText('Create Workspace'))

    expect(mockOnComplete).toHaveBeenCalledWith('2020 Toyota Camry', 'My Camry')
  })

  it('navigates back from model step to greeting', () => {
    render(<WelcomeScreen onComplete={mockOnComplete} />)
    fireEvent.click(screen.getByText("Let's Get Started"))
    expect(screen.getByText('What car are we working with?')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByText('Welcome to Wessley')).toBeInTheDocument()
  })

  it('navigates back from nickname step to model step', () => {
    render(<WelcomeScreen onComplete={mockOnComplete} />)
    fireEvent.click(screen.getByText("Let's Get Started"))
    fireEvent.change(screen.getByPlaceholderText(/Hyundai Galloper/), {
      target: { value: 'Ford F-150' },
    })
    fireEvent.click(screen.getByText('Continue'))
    expect(screen.getByText('Give your project a name')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByText('What car are we working with?')).toBeInTheDocument()
  })
})
