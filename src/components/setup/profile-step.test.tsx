import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileStep } from './profile-step'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

// Mock LimitDisplay
vi.mock('../ui/limit-display', () => ({
  LimitDisplay: ({ used, limit }: { used: number; limit: number }) => (
    <div data-testid="limit-display">{used}/{limit}</div>
  ),
}))

// Mock db limits
vi.mock('@/db/limits', () => ({
  PROFILE_USERNAME_MIN: 3,
  PROFILE_USERNAME_MAX: 25,
  PROFILE_DISPLAY_NAME_MAX: 50,
}))

describe('ProfileStep', () => {
  const defaultProps = {
    username: '',
    usernameAvailable: true,
    displayName: '',
    onUsernameAvailableChange: vi.fn(),
    onUsernameChange: vi.fn(),
    onDisplayNameChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders username and display name inputs', () => {
    render(<ProfileStep {...defaultProps} />)
    expect(screen.getByPlaceholderText('username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your Name')).toBeInTheDocument()
  })

  it('shows AVAILABLE when username is available', () => {
    render(<ProfileStep {...defaultProps} usernameAvailable={true} />)
    expect(screen.getByText('AVAILABLE')).toBeInTheDocument()
  })

  it('shows UNAVAILABLE when username is not available', () => {
    render(<ProfileStep {...defaultProps} usernameAvailable={false} />)
    expect(screen.getByText('UNAVAILABLE')).toBeInTheDocument()
  })

  it('calls onUsernameChange when typing in username field', () => {
    render(<ProfileStep {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('username'), {
      target: { value: 'newuser' },
    })
    expect(defaultProps.onUsernameChange).toHaveBeenCalledWith('newuser')
  })

  it('calls onDisplayNameChange when typing in display name field', () => {
    render(<ProfileStep {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Your Name'), {
      target: { value: 'John Doe' },
    })
    expect(defaultProps.onDisplayNameChange).toHaveBeenCalledWith('John Doe')
  })

  it('displays current username and display name values', () => {
    render(<ProfileStep {...defaultProps} username="testuser" displayName="Test User" />)
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
  })

  it('renders limit displays for both fields', () => {
    render(<ProfileStep {...defaultProps} username="abc" displayName="Test" />)
    const limits = screen.getAllByTestId('limit-display')
    expect(limits).toHaveLength(2)
    expect(limits[0]).toHaveTextContent('3/25')
    expect(limits[1]).toHaveTextContent('4/50')
  })
})
