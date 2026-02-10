import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MessageActions } from './message-actions'

// Mock context via useContext
const mockIsGenerating = { current: false }

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useContext: (ctx: any) => ({ isGenerating: mockIsGenerating.current }),
  }
})

// Mock WithTooltip to render trigger and display
vi.mock('../ui/with-tooltip', () => ({
  WithTooltip: ({ trigger, display }: any) => (
    <div data-testid="tooltip">
      <div data-testid="tooltip-display">{display}</div>
      <div data-testid="tooltip-trigger">{trigger}</div>
    </div>
  ),
}))

describe('MessageActions', () => {
  const defaultProps = {
    isAssistant: false,
    isLast: false,
    isEditing: false,
    isHovering: true,
    onCopy: vi.fn(),
    onEdit: vi.fn(),
    onRegenerate: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsGenerating.current = false
  })

  it('returns null when isEditing is true', () => {
    const { container } = render(<MessageActions {...defaultProps} isEditing={true} />)
    expect(container.innerHTML).toBe('')
  })

  it('returns null when isLast and isGenerating', () => {
    mockIsGenerating.current = true
    const { container } = render(<MessageActions {...defaultProps} isLast={true} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows edit tooltip for non-assistant messages when hovering', () => {
    render(<MessageActions {...defaultProps} isAssistant={false} isHovering={true} />)
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('does not show edit tooltip for assistant messages', () => {
    render(<MessageActions {...defaultProps} isAssistant={true} isHovering={true} />)
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('shows copy tooltip when hovering', () => {
    render(<MessageActions {...defaultProps} isHovering={true} />)
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('shows copy tooltip when isLast even without hover', () => {
    render(<MessageActions {...defaultProps} isHovering={false} isLast={true} />)
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('does not show copy when not hovering and not last', () => {
    render(<MessageActions {...defaultProps} isHovering={false} isLast={false} />)
    expect(screen.queryByText('Copy')).not.toBeInTheDocument()
  })

  it('shows regenerate tooltip only for last message', () => {
    render(<MessageActions {...defaultProps} isLast={true} />)
    expect(screen.getByText('Regenerate')).toBeInTheDocument()
  })

  it('does not show regenerate for non-last messages', () => {
    render(<MessageActions {...defaultProps} isLast={false} />)
    expect(screen.queryByText('Regenerate')).not.toBeInTheDocument()
  })

  it('calls onCopy when copy icon is clicked', () => {
    render(<MessageActions {...defaultProps} isHovering={true} />)
    const copyIcons = document.querySelectorAll('.cursor-pointer')
    // Copy icon is the second clickable for non-assistant (edit is first)
    const copyIcon = Array.from(copyIcons).find(el =>
      el.closest('[data-testid="tooltip"]')?.querySelector('[data-testid="tooltip-display"]')?.textContent === 'Copy'
    )
    if (copyIcon) fireEvent.click(copyIcon)
    expect(defaultProps.onCopy).toHaveBeenCalled()
  })

  it('calls onEdit when edit icon is clicked', () => {
    render(<MessageActions {...defaultProps} isAssistant={false} isHovering={true} />)
    const editIcons = document.querySelectorAll('.cursor-pointer')
    const editIcon = Array.from(editIcons).find(el =>
      el.closest('[data-testid="tooltip"]')?.querySelector('[data-testid="tooltip-display"]')?.textContent === 'Edit'
    )
    if (editIcon) fireEvent.click(editIcon)
    expect(defaultProps.onEdit).toHaveBeenCalled()
  })

  it('renders nothing visible when not hovering, not last, and not editing', () => {
    render(<MessageActions {...defaultProps} isHovering={false} isLast={false} />)
    const tooltips = screen.queryAllByTestId('tooltip')
    expect(tooltips).toHaveLength(0)
  })
})
