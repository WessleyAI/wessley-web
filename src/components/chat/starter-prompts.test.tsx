import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StarterPrompts } from './starter-prompts'

describe('StarterPrompts', () => {
  it('renders all four prompt cards', () => {
    render(<StarterPrompts onPromptSelect={vi.fn()} />)
    expect(screen.getByText('Log a repair')).toBeInTheDocument()
    expect(screen.getByText('Predict weak spots')).toBeInTheDocument()
    expect(screen.getByText('Explore')).toBeInTheDocument()
    expect(screen.getByText('Source parts')).toBeInTheDocument()
  })

  it('renders descriptions', () => {
    render(<StarterPrompts onPromptSelect={vi.fn()} />)
    expect(
      screen.getByText(
        'Mark the starter relay as replaced and add receipt photo.'
      )
    ).toBeInTheDocument()
  })

  it('calls onPromptSelect with full prompt text when clicked', () => {
    const onPromptSelect = vi.fn()
    render(<StarterPrompts onPromptSelect={onPromptSelect} />)

    fireEvent.click(screen.getByText('Log a repair'))

    expect(onPromptSelect).toHaveBeenCalledWith(
      'Help me log a repair for my vehicle. I need to document that I replaced the starter relay and add a receipt photo.'
    )
  })

  it('calls onPromptSelect for each card independently', () => {
    const onPromptSelect = vi.fn()
    render(<StarterPrompts onPromptSelect={onPromptSelect} />)

    fireEvent.click(screen.getByText('Explore'))
    expect(onPromptSelect).toHaveBeenCalledWith(
      'Show me all the electrical circuits that are connected to the ignition system in my vehicle.'
    )
  })
})
