import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useChatStore, ChatMessage, ChatConversation } from './chat-store'

function createMockMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    conversation_id: 'conv-1',
    content: 'Hello world',
    role: 'user',
    user_id: 'user-1',
    ai_model: null,
    attached_media_ids: null,
    metadata: null,
    created_at: '2024-01-15T12:00:00Z',
    ai_tokens_used: null,
    ai_confidence_score: null,
    ...overrides,
  }
}

function createMockConversation(overrides: Partial<ChatConversation> = {}): ChatConversation {
  return {
    id: 'conv-1',
    title: 'Test Conversation',
    user_id: 'user-1',
    workspace_id: 'workspace-1',
    ai_model: 'gpt-4',
    system_prompt: null,
    context_data: null,
    is_active: true,
    is_archived: false,
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
    last_message_at: null,
    ...overrides,
  }
}

describe('useChatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      conversations: [],
      activeConversation: null,
      messages: [],
      isGenerating: false,
      userInput: '',
      abortController: null,
    })
  })

  describe('setMessages', () => {
    it('replaces all messages', () => {
      const messages = [
        createMockMessage({ id: 'msg-1' }),
        createMockMessage({ id: 'msg-2' }),
      ]

      useChatStore.getState().setMessages(messages)

      expect(useChatStore.getState().messages).toEqual(messages)
      expect(useChatStore.getState().messages.length).toBe(2)
    })

    it('clears messages when set to empty array', () => {
      useChatStore.setState({ messages: [createMockMessage()] })

      useChatStore.getState().setMessages([])

      expect(useChatStore.getState().messages).toEqual([])
    })
  })

  describe('addMessage', () => {
    it('appends message to existing messages', () => {
      const existingMessage = createMockMessage({ id: 'msg-1' })
      useChatStore.setState({ messages: [existingMessage] })

      const newMessage = createMockMessage({ id: 'msg-2', content: 'New message' })
      useChatStore.getState().addMessage(newMessage)

      const messages = useChatStore.getState().messages
      expect(messages.length).toBe(2)
      expect(messages[1].id).toBe('msg-2')
    })

    it('preserves message order', () => {
      const messages = [
        createMockMessage({ id: 'msg-1' }),
        createMockMessage({ id: 'msg-2' }),
      ]
      useChatStore.setState({ messages })

      const newMessage = createMockMessage({ id: 'msg-3' })
      useChatStore.getState().addMessage(newMessage)

      const result = useChatStore.getState().messages
      expect(result.map(m => m.id)).toEqual(['msg-1', 'msg-2', 'msg-3'])
    })
  })

  describe('updateMessage', () => {
    it('updates message content by ID', () => {
      const messages = [
        createMockMessage({ id: 'msg-1', content: 'Original' }),
        createMockMessage({ id: 'msg-2', content: 'Other' }),
      ]
      useChatStore.setState({ messages })

      useChatStore.getState().updateMessage('msg-1', 'Updated content')

      const result = useChatStore.getState().messages
      expect(result[0].content).toBe('Updated content')
      expect(result[1].content).toBe('Other')
    })

    it('does not modify other messages', () => {
      const messages = [
        createMockMessage({ id: 'msg-1' }),
        createMockMessage({ id: 'msg-2' }),
      ]
      useChatStore.setState({ messages })

      useChatStore.getState().updateMessage('msg-1', 'New content')

      expect(useChatStore.getState().messages[1]).toEqual(messages[1])
    })

    it('handles non-existent message ID gracefully', () => {
      const messages = [createMockMessage({ id: 'msg-1' })]
      useChatStore.setState({ messages })

      useChatStore.getState().updateMessage('non-existent', 'New content')

      expect(useChatStore.getState().messages.length).toBe(1)
      expect(useChatStore.getState().messages[0].content).toBe('Hello world')
    })
  })

  describe('setActiveConversation', () => {
    it('sets active conversation', () => {
      const conversation = createMockConversation()

      useChatStore.getState().setActiveConversation(conversation)

      expect(useChatStore.getState().activeConversation).toEqual(conversation)
    })

    it('does not clear messages when setting active conversation', () => {
      useChatStore.setState({ messages: [createMockMessage()] })
      const conversation = createMockConversation()

      useChatStore.getState().setActiveConversation(conversation)

      expect(useChatStore.getState().messages.length).toBe(1)
    })

    it('can set active conversation to null', () => {
      useChatStore.setState({ activeConversation: createMockConversation() })

      useChatStore.getState().setActiveConversation(null)

      expect(useChatStore.getState().activeConversation).toBeNull()
    })
  })

  describe('stopGeneration', () => {
    it('aborts the abort controller', () => {
      const mockAbort = vi.fn()
      const mockController = { abort: mockAbort } as unknown as AbortController
      useChatStore.setState({
        abortController: mockController,
        isGenerating: true,
      })

      useChatStore.getState().stopGeneration()

      expect(mockAbort).toHaveBeenCalled()
    })

    it('sets isGenerating to false', () => {
      const mockController = { abort: vi.fn() } as unknown as AbortController
      useChatStore.setState({
        abortController: mockController,
        isGenerating: true,
      })

      useChatStore.getState().stopGeneration()

      expect(useChatStore.getState().isGenerating).toBe(false)
    })

    it('sets abortController to null', () => {
      const mockController = { abort: vi.fn() } as unknown as AbortController
      useChatStore.setState({ abortController: mockController })

      useChatStore.getState().stopGeneration()

      expect(useChatStore.getState().abortController).toBeNull()
    })

    it('does nothing when no abort controller exists', () => {
      useChatStore.setState({ abortController: null, isGenerating: true })

      useChatStore.getState().stopGeneration()

      expect(useChatStore.getState().isGenerating).toBe(true)
    })
  })

  describe('updateConversationTitle', () => {
    it('updates title in conversations list', () => {
      const conversations = [
        createMockConversation({ id: 'conv-1', title: 'Old Title' }),
        createMockConversation({ id: 'conv-2', title: 'Other' }),
      ]
      useChatStore.setState({ conversations })

      useChatStore.getState().updateConversationTitle('conv-1', 'New Title')

      const result = useChatStore.getState().conversations
      expect(result[0].title).toBe('New Title')
      expect(result[1].title).toBe('Other')
    })

    it('updates title in active conversation if matched', () => {
      const conversation = createMockConversation({ id: 'conv-1', title: 'Old' })
      useChatStore.setState({
        conversations: [conversation],
        activeConversation: conversation,
      })

      useChatStore.getState().updateConversationTitle('conv-1', 'New')

      expect(useChatStore.getState().activeConversation?.title).toBe('New')
    })

    it('does not update active conversation if ID does not match', () => {
      useChatStore.setState({
        conversations: [createMockConversation({ id: 'conv-1' })],
        activeConversation: createMockConversation({ id: 'conv-2', title: 'Active' }),
      })

      useChatStore.getState().updateConversationTitle('conv-1', 'New')

      expect(useChatStore.getState().activeConversation?.title).toBe('Active')
    })
  })

  describe('updateConversationWorkspace', () => {
    it('updates workspace_id in conversations list', () => {
      const conversations = [
        createMockConversation({ id: 'conv-1', workspace_id: 'ws-old' }),
      ]
      useChatStore.setState({ conversations })

      useChatStore.getState().updateConversationWorkspace('conv-1', 'ws-new')

      expect(useChatStore.getState().conversations[0].workspace_id).toBe('ws-new')
    })

    it('updates active conversation workspace if matched', () => {
      const conversation = createMockConversation({ id: 'conv-1', workspace_id: 'ws-old' })
      useChatStore.setState({
        conversations: [conversation],
        activeConversation: conversation,
      })

      useChatStore.getState().updateConversationWorkspace('conv-1', 'ws-new')

      expect(useChatStore.getState().activeConversation?.workspace_id).toBe('ws-new')
    })

    it('can set workspace_id to null', () => {
      const conversation = createMockConversation({ id: 'conv-1', workspace_id: 'ws-1' })
      useChatStore.setState({
        conversations: [conversation],
        activeConversation: conversation,
      })

      useChatStore.getState().updateConversationWorkspace('conv-1', null)

      expect(useChatStore.getState().activeConversation?.workspace_id).toBeNull()
    })
  })

  describe('removeConversation', () => {
    it('removes conversation from list', () => {
      const conversations = [
        createMockConversation({ id: 'conv-1' }),
        createMockConversation({ id: 'conv-2' }),
      ]
      useChatStore.setState({ conversations })

      useChatStore.getState().removeConversation('conv-1')

      expect(useChatStore.getState().conversations.length).toBe(1)
      expect(useChatStore.getState().conversations[0].id).toBe('conv-2')
    })

    it('clears messages if removing active conversation', () => {
      const conversation = createMockConversation({ id: 'conv-1' })
      useChatStore.setState({
        conversations: [conversation],
        activeConversation: conversation,
        messages: [createMockMessage()],
      })

      useChatStore.getState().removeConversation('conv-1')

      expect(useChatStore.getState().messages).toEqual([])
    })

    it('sets activeConversation to null if removing active', () => {
      const conversation = createMockConversation({ id: 'conv-1' })
      useChatStore.setState({
        conversations: [conversation],
        activeConversation: conversation,
      })

      useChatStore.getState().removeConversation('conv-1')

      expect(useChatStore.getState().activeConversation).toBeNull()
    })

    it('preserves messages if removing non-active conversation', () => {
      const messages = [createMockMessage()]
      useChatStore.setState({
        conversations: [
          createMockConversation({ id: 'conv-1' }),
          createMockConversation({ id: 'conv-2' }),
        ],
        activeConversation: createMockConversation({ id: 'conv-1' }),
        messages,
      })

      useChatStore.getState().removeConversation('conv-2')

      expect(useChatStore.getState().messages).toEqual(messages)
    })
  })

  describe('addConversation', () => {
    it('adds conversation to beginning of list', () => {
      const existing = createMockConversation({ id: 'conv-1' })
      useChatStore.setState({ conversations: [existing] })

      const newConversation = createMockConversation({ id: 'conv-2' })
      useChatStore.getState().addConversation(newConversation)

      const result = useChatStore.getState().conversations
      expect(result.length).toBe(2)
      expect(result[0].id).toBe('conv-2')
      expect(result[1].id).toBe('conv-1')
    })
  })

  describe('clearMessages', () => {
    it('clears all messages', () => {
      useChatStore.setState({
        messages: [createMockMessage(), createMockMessage({ id: 'msg-2' })],
      })

      useChatStore.getState().clearMessages()

      expect(useChatStore.getState().messages).toEqual([])
    })
  })

  describe('setUserInput', () => {
    it('sets user input', () => {
      useChatStore.getState().setUserInput('Hello')

      expect(useChatStore.getState().userInput).toBe('Hello')
    })

    it('can set empty string', () => {
      useChatStore.setState({ userInput: 'something' })

      useChatStore.getState().setUserInput('')

      expect(useChatStore.getState().userInput).toBe('')
    })
  })

  describe('setIsGenerating', () => {
    it('sets isGenerating flag', () => {
      useChatStore.getState().setIsGenerating(true)
      expect(useChatStore.getState().isGenerating).toBe(true)

      useChatStore.getState().setIsGenerating(false)
      expect(useChatStore.getState().isGenerating).toBe(false)
    })
  })

  describe('setAbortController', () => {
    it('sets abort controller', () => {
      const controller = new AbortController()

      useChatStore.getState().setAbortController(controller)

      expect(useChatStore.getState().abortController).toBe(controller)
    })

    it('can set to null', () => {
      useChatStore.setState({ abortController: new AbortController() })

      useChatStore.getState().setAbortController(null)

      expect(useChatStore.getState().abortController).toBeNull()
    })
  })
})
