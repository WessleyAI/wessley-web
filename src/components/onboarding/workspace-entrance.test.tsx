import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorkspaceEntrance } from './workspace-entrance'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onAnimationComplete, ...props }: any) => {
      // Simulate animation completion immediately
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, 0)
      }
      const { initial, animate, transition, ...domProps } = props
      return <div {...domProps}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('WorkspaceEntrance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when show is true', () => {
    render(
      <WorkspaceEntrance show={true}>
        <div>Workspace Content</div>
      </WorkspaceEntrance>
    )
    expect(screen.getByText('Workspace Content')).toBeInTheDocument()
  })

  it('does not render when show is false', () => {
    render(
      <WorkspaceEntrance show={false}>
        <div>Hidden Content</div>
      </WorkspaceEntrance>
    )
    expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument()
  })

  it('renders placeholder content areas', () => {
    render(
      <WorkspaceEntrance show={true}>
        <div>Main Content</div>
      </WorkspaceEntrance>
    )
    expect(screen.getByText('3D Scene Loading...')).toBeInTheDocument()
    expect(screen.getByText('Chat Interface Loading...')).toBeInTheDocument()
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
    expect(screen.getByText('New Project')).toBeInTheDocument()
  })
})
