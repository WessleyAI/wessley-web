import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChangePassword } from './change-password'

const mockPush = vi.fn()
const mockUpdateUser = vi.fn().mockResolvedValue({ data: {}, error: null })

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/supabase/browser-client', () => ({
  supabase: {
    auth: {
      updateUser: (...args: any[]) => mockUpdateUser(...args),
    },
  },
}))

// Mock sonner toast
const mockToastInfo = vi.fn()
const mockToastSuccess = vi.fn()
vi.mock('sonner', () => ({
  toast: {
    info: (...args: any[]) => mockToastInfo(...args),
    success: (...args: any[]) => mockToastSuccess(...args),
  },
}))

describe('ChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dialog with title and inputs', () => {
    render(<ChangePassword />)
    expect(screen.getByText('Change Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm New Password')).toBeInTheDocument()
    expect(screen.getByText('Confirm Change')).toBeInTheDocument()
  })

  it('shows info toast when submitting with empty password', async () => {
    render(<ChangePassword />)
    fireEvent.click(screen.getByText('Confirm Change'))
    await waitFor(() => {
      expect(mockToastInfo).toHaveBeenCalledWith('Please enter your new password.')
    })
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('calls updateUser and redirects on successful password change', async () => {
    render(<ChangePassword />)
    const passwordInput = screen.getByPlaceholderText('New Password')
    fireEvent.change(passwordInput, { target: { value: 'newpass123' } })
    fireEvent.click(screen.getByText('Confirm Change'))

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpass123' })
    })
    expect(mockToastSuccess).toHaveBeenCalledWith('Password changed successfully.')
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('updates input values on change', () => {
    render(<ChangePassword />)
    const passwordInput = screen.getByPlaceholderText('New Password')
    const confirmInput = screen.getByPlaceholderText('Confirm New Password')

    fireEvent.change(passwordInput, { target: { value: 'abc' } })
    expect(passwordInput).toHaveValue('abc')

    fireEvent.change(confirmInput, { target: { value: 'xyz' } })
    expect(confirmInput).toHaveValue('xyz')
  })
})
