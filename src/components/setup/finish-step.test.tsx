import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FinishStep } from './finish-step'

describe('FinishStep', () => {
  it('renders welcome message without name when displayName is empty', () => {
    render(<FinishStep displayName="" />)
    expect(screen.getByText(/Welcome to Chatbot UI/)).toBeInTheDocument()
  })

  it('renders welcome message with first name when displayName is provided', () => {
    render(<FinishStep displayName="John Doe" />)
    expect(screen.getByText(/John/)).toBeInTheDocument()
  })

  it('renders call to action text', () => {
    render(<FinishStep displayName="" />)
    expect(screen.getByText('Click next to start chatting.')).toBeInTheDocument()
  })

  it('uses only first name from multi-word display name', () => {
    render(<FinishStep displayName="Jane Marie Smith" />)
    expect(screen.getByText(/Jane/)).toBeInTheDocument()
    expect(screen.queryByText(/Marie/)).not.toBeInTheDocument()
  })
})
