import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatStarter } from './chat-starter'

describe('ChatStarter', () => {
  const mockOnNewChat = vi.fn()
  const mockOnQuickStart = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the header and new chat button', () => {
    render(<ChatStarter onNewChat={mockOnNewChat} />)
    expect(screen.getByText('Vehicle Assistant')).toBeInTheDocument()
    expect(screen.getByText('Start New Conversation')).toBeInTheDocument()
  })

  it('renders all four quick starter cards', () => {
    render(<ChatStarter onNewChat={mockOnNewChat} />)
    expect(screen.getByText('Analyze Vehicle Wiring')).toBeInTheDocument()
    expect(screen.getByText('Troubleshoot Issue')).toBeInTheDocument()
    expect(screen.getByText('Explain Diagram')).toBeInTheDocument()
    expect(screen.getByText('Component Guide')).toBeInTheDocument()
  })

  it('calls onNewChat when Start New Conversation is clicked', () => {
    render(<ChatStarter onNewChat={mockOnNewChat} />)
    fireEvent.click(screen.getByText('Start New Conversation'))
    expect(mockOnNewChat).toHaveBeenCalledOnce()
  })

  it('calls onQuickStart with prompt when a quick starter is clicked', () => {
    render(<ChatStarter onNewChat={mockOnNewChat} onQuickStart={mockOnQuickStart} />)
    fireEvent.click(screen.getByText('Troubleshoot Issue'))
    expect(mockOnQuickStart).toHaveBeenCalledWith(
      "My headlights aren't working, can you help me troubleshoot?"
    )
  })

  it('falls back to onNewChat when onQuickStart is not provided', () => {
    render(<ChatStarter onNewChat={mockOnNewChat} />)
    fireEvent.click(screen.getByText('Analyze Vehicle Wiring'))
    expect(mockOnNewChat).toHaveBeenCalledOnce()
  })

  it('displays the tip text', () => {
    render(<ChatStarter onNewChat={mockOnNewChat} />)
    expect(screen.getByText(/upload images/i)).toBeInTheDocument()
  })
})
