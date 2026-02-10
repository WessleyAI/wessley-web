import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarSearch } from './sidebar-search'

describe('SidebarSearch', () => {
  it('renders with content type placeholder', () => {
    render(<SidebarSearch contentType="chats" searchTerm="" setSearchTerm={vi.fn()} />)
    expect(screen.getByPlaceholderText('Search chats...')).toBeInTheDocument()
  })

  it('displays the current search term', () => {
    render(<SidebarSearch contentType="chats" searchTerm="hello" setSearchTerm={vi.fn()} />)
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
  })

  it('calls setSearchTerm on input change', () => {
    const setSearchTerm = vi.fn()
    render(<SidebarSearch contentType="chats" searchTerm="" setSearchTerm={setSearchTerm} />)
    fireEvent.change(screen.getByPlaceholderText('Search chats...'), { target: { value: 'test' } })
    expect(setSearchTerm).toHaveBeenCalledWith('test')
  })

  it('uses different content types in placeholder', () => {
    render(<SidebarSearch contentType="prompts" searchTerm="" setSearchTerm={vi.fn()} />)
    expect(screen.getByPlaceholderText('Search prompts...')).toBeInTheDocument()
  })
})
