import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Alerts } from './alerts'

// Mock sidebar icon size
vi.mock('../sidebar/sidebar-switcher', () => ({
  SIDEBAR_ICON_SIZE: 24,
}))

describe('Alerts', () => {
  it('renders the bell icon', () => {
    render(<Alerts />)
    // The bell icon trigger should be in the document
    const trigger = document.querySelector('.cursor-pointer')
    expect(trigger).toBeInTheDocument()
  })

  it('does not show notification badge when there are no notifications', () => {
    render(<Alerts />)
    expect(document.querySelector('.notification-indicator')).not.toBeInTheDocument()
  })

  it('shows empty state when popover is opened', async () => {
    render(<Alerts />)
    const trigger = document.querySelector('.cursor-pointer')!
    fireEvent.click(trigger)
    expect(await screen.findByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('No notifications')).toBeInTheDocument()
    expect(screen.getByText("You're all caught up!")).toBeInTheDocument()
  })
})
