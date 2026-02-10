import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { APIStep } from './api-step'

describe('APIStep', () => {
  const defaultProps = {
    openaiAPIKey: '',
    openaiOrgID: '',
    azureOpenaiAPIKey: '',
    azureOpenaiEndpoint: '',
    azureOpenai35TurboID: '',
    azureOpenai45TurboID: '',
    azureOpenai45VisionID: '',
    azureOpenaiEmbeddingsID: '',
    anthropicAPIKey: '',
    googleGeminiAPIKey: '',
    mistralAPIKey: '',
    groqAPIKey: '',
    perplexityAPIKey: '',
    openrouterAPIKey: '',
    useAzureOpenai: false,
    onOpenaiAPIKeyChange: vi.fn(),
    onOpenaiOrgIDChange: vi.fn(),
    onAzureOpenaiAPIKeyChange: vi.fn(),
    onAzureOpenaiEndpointChange: vi.fn(),
    onAzureOpenai35TurboIDChange: vi.fn(),
    onAzureOpenai45TurboIDChange: vi.fn(),
    onAzureOpenai45VisionIDChange: vi.fn(),
    onAzureOpenaiEmbeddingsIDChange: vi.fn(),
    onAnthropicAPIKeyChange: vi.fn(),
    onGoogleGeminiAPIKeyChange: vi.fn(),
    onMistralAPIKeyChange: vi.fn(),
    onGroqAPIKeyChange: vi.fn(),
    onPerplexityAPIKeyChange: vi.fn(),
    onUseAzureOpenaiChange: vi.fn(),
    onOpenrouterAPIKeyChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders OpenAI API Key input by default', () => {
    render(<APIStep {...defaultProps} />)
    expect(screen.getByPlaceholderText('OpenAI API Key')).toBeInTheDocument()
  })

  it('shows Azure toggle button', () => {
    render(<APIStep {...defaultProps} />)
    expect(screen.getByText('Switch To Azure OpenAI')).toBeInTheDocument()
  })

  it('shows Azure fields when useAzureOpenai is true', () => {
    render(<APIStep {...defaultProps} useAzureOpenai={true} />)
    expect(screen.getByPlaceholderText('Azure OpenAI API Key')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://your-endpoint.openai.azure.com')).toBeInTheDocument()
  })

  it('shows OpenAI Org ID field when not using Azure', () => {
    render(<APIStep {...defaultProps} />)
    expect(screen.getByPlaceholderText('OpenAI Organization ID (optional)')).toBeInTheDocument()
  })

  it('renders all provider API key fields', () => {
    render(<APIStep {...defaultProps} />)
    expect(screen.getByPlaceholderText('Anthropic API Key')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Google Gemini API Key')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Mistral API Key')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Groq API Key')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Perplexity API Key')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('OpenRouter API Key')).toBeInTheDocument()
  })

  it('calls onOpenaiAPIKeyChange when typing in OpenAI field', () => {
    render(<APIStep {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('OpenAI API Key'), {
      target: { value: 'sk-test' },
    })
    expect(defaultProps.onOpenaiAPIKeyChange).toHaveBeenCalledWith('sk-test')
  })

  it('calls onAnthropicAPIKeyChange when typing in Anthropic field', () => {
    render(<APIStep {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Anthropic API Key'), {
      target: { value: 'ant-key' },
    })
    expect(defaultProps.onAnthropicAPIKeyChange).toHaveBeenCalledWith('ant-key')
  })

  it('calls onUseAzureOpenaiChange when toggle is clicked', () => {
    render(<APIStep {...defaultProps} />)
    fireEvent.click(screen.getByText('Switch To Azure OpenAI'))
    expect(defaultProps.onUseAzureOpenaiChange).toHaveBeenCalledWith(true)
  })
})
