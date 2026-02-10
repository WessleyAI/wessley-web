import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StarterPrompts } from './starter-prompts'

describe('StarterPrompts', () => {
  const mockOnPromptSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all four prompt cards', () => {
    render(<StarterPrompts onPromptSelect={mockOnPromptSelect} />)
    expect(screen.getByText('Log a repair')).toBeInTheDocument()
    expect(screen.getByText('Predict weak spots')).toBeInTheDocument()
    expect(screen.getByText('Explore')).toBeInTheDocument()
    expect(screen.getByText('Source parts')).toBeInTheDocument()
  })

  it('renders descriptions for each prompt', () => {
    render(<StarterPrompts onPromptSelect={mockOnPromptSelect} />)
    expect(screen.getByText(/Mark the starter relay/)).toBeInTheDocument()
    expect(screen.getByText(/Analyze the harness/)).toBeInTheDocument()
    expect(screen.getByText(/Highlight circuits/)).toBeInTheDocument()
    expect(screen.getByText(/Find compatible alternator/)).toBeInTheDocument()
  })

  it('calls onPromptSelect with full prompt when card is clicked', () => {
    render(<StarterPrompts onPromptSelect={mockOnPromptSelect} />)
    fireEvent.click(screen.getByText('Log a repair'))
    expect(mockOnPromptSelect).toHaveBeenCalledWith(
      'Help me log a repair for my vehicle. I need to document that I replaced the starter relay and add a receipt photo.'
    )
  })

  it('calls onPromptSelect with correct prompt for each card', () => {
    render(<StarterPrompts onPromptSelect={mockOnPromptSelect} />)
    fireEvent.click(screen.getByText('Explore'))
    expect(mockOnPromptSelect).toHaveBeenCalledWith(
      'Show me all the electrical circuits that are connected to the ignition system in my vehicle.'
    )
  })
})
