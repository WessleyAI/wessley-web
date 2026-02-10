import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StepContainer, SETUP_STEP_COUNT } from './step-container'

describe('StepContainer', () => {
  const defaultProps = {
    stepDescription: 'Enter your details',
    stepNum: 1,
    stepTitle: 'Profile Setup',
    onShouldProceed: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the step title and description', () => {
    render(<StepContainer {...defaultProps} />)
    expect(screen.getByText('Profile Setup')).toBeInTheDocument()
    expect(screen.getByText('Enter your details')).toBeInTheDocument()
  })

  it('renders step number out of total', () => {
    render(<StepContainer {...defaultProps} stepNum={2} />)
    expect(screen.getByText(`2 / ${SETUP_STEP_COUNT}`)).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <StepContainer {...defaultProps}>
        <div>Child content</div>
      </StepContainer>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('shows Next button by default', () => {
    render(<StepContainer {...defaultProps} />)
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('hides Next button when showNextButton is false', () => {
    render(<StepContainer {...defaultProps} showNextButton={false} />)
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  it('does not show Back button by default', () => {
    render(<StepContainer {...defaultProps} />)
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
  })

  it('shows Back button when showBackButton is true', () => {
    render(<StepContainer {...defaultProps} showBackButton={true} />)
    expect(screen.getByText('Back')).toBeInTheDocument()
  })

  it('calls onShouldProceed(true) when Next is clicked', () => {
    render(<StepContainer {...defaultProps} />)
    fireEvent.click(screen.getByText('Next'))
    expect(defaultProps.onShouldProceed).toHaveBeenCalledWith(true)
  })

  it('calls onShouldProceed(false) when Back is clicked', () => {
    render(<StepContainer {...defaultProps} showBackButton={true} />)
    fireEvent.click(screen.getByText('Back'))
    expect(defaultProps.onShouldProceed).toHaveBeenCalledWith(false)
  })

  it('triggers Next on Enter key press', () => {
    render(<StepContainer {...defaultProps} />)
    const card = screen.getByText('Profile Setup').closest('[class*="max-h"]')!
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(defaultProps.onShouldProceed).toHaveBeenCalledWith(true)
  })

  it('does not trigger Next on Shift+Enter', () => {
    render(<StepContainer {...defaultProps} />)
    const card = screen.getByText('Profile Setup').closest('[class*="max-h"]')!
    fireEvent.keyDown(card, { key: 'Enter', shiftKey: true })
    expect(defaultProps.onShouldProceed).not.toHaveBeenCalled()
  })
})
