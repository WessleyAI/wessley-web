import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GlobalSearch } from './global-search'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock NewWorkspaceDialog
vi.mock('@/components/project/new-workspace-dialog', () => ({
  NewWorkspaceDialog: ({ children, open }: any) =>
    open ? <div data-testid="new-workspace-dialog">{children}</div> : null,
}))

// Mock the Command components
vi.mock('@/components/ui/command', () => ({
  Command: ({ children }: any) => <div>{children}</div>,
  CommandDialog: ({ children, open }: any) =>
    open ? <div data-testid="command-dialog">{children}</div> : null,
  CommandEmpty: ({ children }: any) => <div data-testid="command-empty">{children}</div>,
  CommandGroup: ({ children, heading }: any) => (
    <div data-testid="command-group" data-heading={heading}>{children}</div>
  ),
  CommandInput: ({ placeholder, value, onValueChange }: any) => (
    <input
      data-testid="command-input"
      placeholder={placeholder}
      value={value}
      onChange={(e: any) => onValueChange(e.target.value)}
    />
  ),
  CommandItem: ({ children, onSelect }: any) => (
    <div data-testid="command-item" onClick={onSelect}>{children}</div>
  ),
  CommandList: ({ children }: any) => <div>{children}</div>,
  CommandSeparator: () => <hr />,
  CommandShortcut: ({ children }: any) => <span>{children}</span>,
}))

describe('GlobalSearch', () => {
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('does not render when open is false', () => {
    render(<GlobalSearch open={false} onOpenChange={mockOnOpenChange} />)
    expect(screen.queryByTestId('command-dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog when open is true', () => {
    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)
    expect(screen.getByTestId('command-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('command-input')).toBeInTheDocument()
  })

  it('shows quick actions when query is empty', () => {
    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)
    expect(screen.getByText('New Workspace')).toBeInTheDocument()
    expect(screen.getByText('Browse People')).toBeInTheDocument()
    expect(screen.getByText('Find Workspaces')).toBeInTheDocument()
  })

  it('shows keyboard shortcuts for quick actions', () => {
    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)
    expect(screen.getByText('⌘N')).toBeInTheDocument()
    expect(screen.getByText('⌘P')).toBeInTheDocument()
    expect(screen.getByText('⌘W')).toBeInTheDocument()
  })

  it('shows search placeholder text', () => {
    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)
    expect(screen.getByPlaceholderText(/Search people, projects/)).toBeInTheDocument()
  })

  it('performs API search when query changes', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            { id: '1', title: 'Test Workspace', type: 'workspace', description: 'A test workspace' },
          ],
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)
    const input = screen.getByTestId('command-input')
    fireEvent.change(input, { target: { value: 'test workspace' } })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/search', expect.objectContaining({
        method: 'POST',
      }))
    }, { timeout: 1000 })
  })

  it('shows no results message when search returns empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    }))

    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)
    const input = screen.getByTestId('command-input')
    fireEvent.change(input, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(screen.getByTestId('command-empty')).toBeInTheDocument()
    }, { timeout: 1000 })
  })
})
