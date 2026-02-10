import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatInput } from './chat-input'

// Mock stores
const mockSetUserInput = vi.fn()
const mockSetIsGenerating = vi.fn()
const mockSetAbortController = vi.fn()
const mockStopGeneration = vi.fn()
const mockAddMessage = vi.fn()

vi.mock('@/stores/chat-store', () => ({
  useChatStore: () => ({
    userInput: '',
    isGenerating: false,
    setUserInput: mockSetUserInput,
    setIsGenerating: mockSetIsGenerating,
    setAbortController: mockSetAbortController,
    stopGeneration: mockStopGeneration,
    activeConversation: null,
    addMessage: mockAddMessage,
  }),
}))

vi.mock('@/stores/model-store', () => ({
  useModelStore: () => ({
    executeSceneEvent: vi.fn(),
  }),
}))

vi.mock('@/lib/hooks/use-rag-query', () => ({
  useRAGQuery: () => ({
    queryRAG: vi.fn(),
    isLoading: false,
  }),
}))

describe('ChatInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the input with default placeholder', () => {
    render(<ChatInput />)
    expect(screen.getByPlaceholderText('Ask anything')).toBeInTheDocument()
  })

  it('renders welcome setup placeholder when isWelcomeSetup is true', () => {
    render(<ChatInput isWelcomeSetup />)
    expect(
      screen.getByPlaceholderText('What vehicle model/brand/year are we working with?')
    ).toBeInTheDocument()
  })

  it('calls setUserInput on input change', () => {
    render(<ChatInput />)
    const input = screen.getByPlaceholderText('Ask anything')
    fireEvent.change(input, { target: { value: 'hello' } })
    expect(mockSetUserInput).toHaveBeenCalledWith('hello')
  })

  it('disables input when disabled prop is true', () => {
    render(<ChatInput disabled />)
    const input = screen.getByPlaceholderText('Ask anything')
    expect(input).toBeDisabled()
  })
})
