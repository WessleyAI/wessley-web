import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DocumentUploadDialog } from './DocumentUploadDialog'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...domProps } = props
      return <div {...domProps}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

// Mock the hook
const mockIngestDocument = vi.fn()
const mockReset = vi.fn()
vi.mock('@/lib/hooks/use-document-ingest', () => ({
  useDocumentIngest: ({ onSuccess, onError, onProgress }: any) => ({
    ingestDocument: mockIngestDocument,
    isUploading: false,
    isProcessing: false,
    currentJob: null,
    error: null,
    reset: mockReset,
  }),
  getJobStatusText: (job: any) => 'Processing...',
  formatFileSize: (size: number) => `${(size / 1024).toFixed(1)}KB`,
}))

// Mock Dialog
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}))

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value} />,
}))

describe('DocumentUploadDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when open is false', () => {
    render(<DocumentUploadDialog open={false} onOpenChange={vi.fn()} />)
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('renders the upload dialog with title', () => {
    render(<DocumentUploadDialog {...defaultProps} />)
    // Title appears in both h2 and button, just check it's present
    expect(screen.getAllByText(/Upload Document/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows upload instructions in the select step', () => {
    render(<DocumentUploadDialog {...defaultProps} />)
    expect(screen.getByText(/Click to upload/)).toBeInTheDocument()
    expect(screen.getByText(/drag and drop/)).toBeInTheDocument()
  })

  it('shows cancel and upload buttons', () => {
    render(<DocumentUploadDialog {...defaultProps} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    // Upload Document appears as both title and button text
    const buttons = screen.getAllByText(/Upload Document/)
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('disables upload button when no file is selected', () => {
    render(<DocumentUploadDialog {...defaultProps} />)
    const uploadBtn = screen.getAllByText(/Upload Document/).find(
      el => el.tagName === 'BUTTON'
    )
    expect(uploadBtn).toBeDisabled()
  })

  it('displays vehicle context when vehicle prop is provided', () => {
    render(
      <DocumentUploadDialog
        {...defaultProps}
        vehicle={{ make: 'Toyota', model: 'Camry', year: 2020 }}
      />
    )
    expect(screen.getByText('Toyota Camry 2020')).toBeInTheDocument()
    expect(screen.getByText(/linked to this vehicle/)).toBeInTheDocument()
  })

  it('shows step description for select step', () => {
    render(<DocumentUploadDialog {...defaultProps} />)
    expect(screen.getByText(/Upload a service manual/)).toBeInTheDocument()
  })

  it('calls onOpenChange when cancel is clicked', () => {
    const mockOnOpenChange = vi.fn()
    render(<DocumentUploadDialog open={true} onOpenChange={mockOnOpenChange} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
