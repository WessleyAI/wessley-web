import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FileIcon } from './file-icon'

describe('FileIcon', () => {
  it('renders image icon for image types', () => {
    const { container } = render(<FileIcon type="image/png" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders pdf icon for pdf types', () => {
    const { container } = render(<FileIcon type="application/pdf" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders csv icon for csv types', () => {
    const { container } = render(<FileIcon type="text/csv" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders docx icon for docx types', () => {
    const { container } = render(<FileIcon type="application/docx" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders text icon for plain text types', () => {
    const { container } = render(<FileIcon type="text/plain" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders json icon for json types', () => {
    const { container } = render(<FileIcon type="application/json" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders markdown icon for markdown types', () => {
    const { container } = render(<FileIcon type="text/markdown" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders default file icon for unknown types', () => {
    const { container } = render(<FileIcon type="application/octet-stream" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('uses default size of 32', () => {
    const { container } = render(<FileIcon type="text/plain" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '32')
  })

  it('accepts custom size prop', () => {
    const { container } = render(<FileIcon type="text/plain" size={24} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '24')
  })
})
