import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectDashboard } from './dashboard'

describe('ProjectDashboard', () => {
  it('renders the dashboard title', () => {
    render(<ProjectDashboard />)
    expect(screen.getByText('Dashboard & Budget')).toBeInTheDocument()
  })

  it('renders all three tab triggers', () => {
    render(<ProjectDashboard />)
    expect(screen.getByText('Project Overview')).toBeInTheDocument()
    expect(screen.getByText('Budget & Expenses')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('shows overview tab content by default', () => {
    render(<ProjectDashboard />)
    expect(screen.getByText('Project Manager Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Active Projects')).toBeInTheDocument()
    expect(screen.getByText('Total Budget')).toBeInTheDocument()
    expect(screen.getByText('$2,450')).toBeInTheDocument()
  })

  it('shows overview stats', () => {
    render(<ProjectDashboard />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('67%')).toBeInTheDocument()
    expect(screen.getByText('2 on track, 1 needs attention')).toBeInTheDocument()
  })

  it('switches to budget tab on click', async () => {
    const user = userEvent.setup()
    render(<ProjectDashboard />)
    await user.click(screen.getByText('Budget & Expenses'))
    expect(screen.getByText('Recent Expenses')).toBeInTheDocument()
    expect(screen.getByText('Engine Oil Change')).toBeInTheDocument()
    expect(screen.getByText('$65.00')).toBeInTheDocument()
    expect(screen.getByText('Brake Pads')).toBeInTheDocument()
  })

  it('shows budget categories', async () => {
    const user = userEvent.setup()
    render(<ProjectDashboard />)
    await user.click(screen.getByText('Budget & Expenses'))
    expect(screen.getByText('Budget Categories')).toBeInTheDocument()
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
    expect(screen.getByText('$450 / $800')).toBeInTheDocument()
  })

  it('switches to analytics tab on click', async () => {
    const user = userEvent.setup()
    render(<ProjectDashboard />)
    await user.click(screen.getByText('Analytics'))
    expect(screen.getByText('Analytics & Reports')).toBeInTheDocument()
    expect(screen.getByText('Cost per Mile')).toBeInTheDocument()
    expect(screen.getByText('$0.12')).toBeInTheDocument()
    expect(screen.getByText('Efficiency Score')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })
})
