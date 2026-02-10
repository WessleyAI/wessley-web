import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatScrollButtons } from './chat-scroll-buttons'

describe('ChatScrollButtons', () => {
  const defaultProps = {
    isAtTop: false,
    isAtBottom: false,
    isOverflowing: true,
    scrollToTop: vi.fn(),
    scrollToBottom: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows both scroll buttons when not at top or bottom and overflowing', () => {
    const { container } = render(<ChatScrollButtons {...defaultProps} />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(2)
  })

  it('hides scroll-up button when at top', () => {
    const { container } = render(<ChatScrollButtons {...defaultProps} isAtTop={true} />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(1) // only down button
  })

  it('hides scroll-down button when at bottom', () => {
    const { container } = render(<ChatScrollButtons {...defaultProps} isAtBottom={true} />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(1) // only up button
  })

  it('hides all buttons when not overflowing', () => {
    const { container } = render(<ChatScrollButtons {...defaultProps} isOverflowing={false} />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(0)
  })

  it('calls scrollToTop when up button is clicked', () => {
    const { container } = render(<ChatScrollButtons {...defaultProps} />)
    const svgs = container.querySelectorAll('svg')
    fireEvent.click(svgs[0])
    expect(defaultProps.scrollToTop).toHaveBeenCalled()
  })

  it('calls scrollToBottom when down button is clicked', () => {
    const { container } = render(<ChatScrollButtons {...defaultProps} />)
    const svgs = container.querySelectorAll('svg')
    fireEvent.click(svgs[1])
    expect(defaultProps.scrollToBottom).toHaveBeenCalled()
  })

  it('shows no buttons when at top and bottom', () => {
    const { container } = render(
      <ChatScrollButtons {...defaultProps} isAtTop={true} isAtBottom={true} />
    )
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(0)
  })
})
