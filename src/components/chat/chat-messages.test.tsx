import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatMessages } from './chat-messages'
import { ChatMessage } from '@/stores/chat-store'

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}))

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'msg-1',
  conversation_id: 'conv-1',
  content: 'Hello world',
  role: 'user',
  user_id: 'user-1',
  ai_model: null,
  attached_media_ids: null,
  metadata: null,
  created_at: new Date().toISOString(),
  ai_tokens_used: null,
  ai_confidence_score: null,
  ...overrides,
})

describe('ChatMessages', () => {
  it('returns null when messages array is empty', () => {
    const { container } = render(<ChatMessages messages={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders user messages with correct content', () => {
    const messages = [makeMessage({ content: 'How do I fix my brakes?' })]
    render(<ChatMessages messages={messages} />)
    expect(screen.getByText('How do I fix my brakes?')).toBeInTheDocument()
  })

  it('renders assistant messages with avatar and toolbar', () => {
    const messages = [
      makeMessage({
        id: 'msg-2',
        role: 'assistant',
        content: 'You should check the brake pads first.',
      }),
    ]
    render(<ChatMessages messages={messages} />)
    expect(screen.getByText('You should check the brake pads first.')).toBeInTheDocument()
    expect(screen.getByTitle('Copy')).toBeInTheDocument()
    expect(screen.getByTitle('Good response')).toBeInTheDocument()
    expect(screen.getByTitle('Bad response')).toBeInTheDocument()
    expect(screen.getByTitle('Download')).toBeInTheDocument()
    expect(screen.getByTitle('Regenerate')).toBeInTheDocument()
    expect(screen.getByTitle('More options')).toBeInTheDocument()
  })

  it('does not show toolbar buttons for user messages', () => {
    const messages = [makeMessage({ role: 'user', content: 'User text' })]
    render(<ChatMessages messages={messages} />)
    expect(screen.queryByTitle('Copy')).not.toBeInTheDocument()
  })

  it('renders multiple messages in order', () => {
    const messages = [
      makeMessage({ id: '1', role: 'user', content: 'First question' }),
      makeMessage({ id: '2', role: 'assistant', content: 'First answer' }),
      makeMessage({ id: '3', role: 'user', content: 'Follow-up' }),
    ]
    render(<ChatMessages messages={messages} />)
    expect(screen.getByText('First question')).toBeInTheDocument()
    expect(screen.getByText('First answer')).toBeInTheDocument()
    expect(screen.getByText('Follow-up')).toBeInTheDocument()
  })

  it('renders the Wessley avatar image for assistant messages', () => {
    const messages = [
      makeMessage({ id: 'a1', role: 'assistant', content: 'Hi there' }),
    ]
    render(<ChatMessages messages={messages} />)
    const img = screen.getByAltText('Wessley')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/logo-dark.svg')
  })
})
