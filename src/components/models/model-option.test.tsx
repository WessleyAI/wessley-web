import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModelOption } from './model-option'
import { LLM } from '@/types'

// Mock ModelIcon
vi.mock('./model-icon', () => ({
  ModelIcon: ({ provider }: any) => <div data-testid="model-icon">{provider}</div>,
}))

// Mock WithTooltip to just render the trigger
vi.mock('../ui/with-tooltip', () => ({
  WithTooltip: ({ trigger, display }: any) => (
    <div>
      {trigger}
      <div data-testid="tooltip-content">{display}</div>
    </div>
  ),
}))

describe('ModelOption', () => {
  const mockOnSelect = vi.fn()

  const baseModel: LLM = {
    modelId: 'gpt-4' as any,
    modelName: 'GPT-4',
    provider: 'openai' as any,
    hostedId: 'gpt-4',
    platformLink: 'https://openai.com',
    imageInput: true,
    pricing: {
      currency: 'USD',
      unit: '1M tokens',
      inputCost: '30.00',
      outputCost: '60.00',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the model name', () => {
    render(<ModelOption model={baseModel} onSelect={mockOnSelect} />)
    expect(screen.getByText('GPT-4')).toBeInTheDocument()
  })

  it('renders the model icon with correct provider', () => {
    render(<ModelOption model={baseModel} onSelect={mockOnSelect} />)
    expect(screen.getByTestId('model-icon')).toHaveTextContent('openai')
  })

  it('calls onSelect when clicked', () => {
    render(<ModelOption model={baseModel} onSelect={mockOnSelect} />)
    fireEvent.click(screen.getByText('GPT-4'))
    expect(mockOnSelect).toHaveBeenCalledOnce()
  })

  it('displays pricing info in tooltip for non-ollama models', () => {
    render(<ModelOption model={baseModel} onSelect={mockOnSelect} />)
    const tooltip = screen.getByTestId('tooltip-content')
    expect(tooltip).toHaveTextContent('Input Cost')
    expect(tooltip).toHaveTextContent('30.00')
    expect(tooltip).toHaveTextContent('Output Cost')
    expect(tooltip).toHaveTextContent('60.00')
  })

  it('does not display pricing for ollama models', () => {
    const ollamaModel = { ...baseModel, provider: 'ollama' as any }
    render(<ModelOption model={ollamaModel} onSelect={mockOnSelect} />)
    const tooltip = screen.getByTestId('tooltip-content')
    expect(tooltip).not.toHaveTextContent('Input Cost')
  })
})
