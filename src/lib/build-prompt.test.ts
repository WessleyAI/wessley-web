/**
 * Tests for Build Prompt Utility
 *
 * Tests cover:
 * - buildFinalMessages() - Building chat messages with context
 * - adaptMessagesForGoogleGemini() - Adapting messages for Gemini API
 * - Token counting and context window management
 * - File item retrieval text formatting
 * - Image URL handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buildFinalMessages,
  adaptMessagesForGoogleGemini,
} from './build-prompt'
import type { Tables } from '@/supabase/types'
import type { ChatPayload, MessageImage, ChatMessage } from '@/types'

// Mock the gpt-tokenizer module
vi.mock('gpt-tokenizer', () => ({
  encode: (text: string) => {
    // Simple mock that returns roughly 1 token per 4 characters
    return new Array(Math.ceil(text.length / 4)).fill(1)
  },
}))

// Mock utils
vi.mock('@/lib/utils', () => ({
  getBase64FromDataURL: (url: string) => {
    // Extract base64 portion from data URL
    const match = url.match(/base64,(.*)$/)
    return match ? match[1] : ''
  },
  getMediaTypeFromDataURL: (url: string) => {
    // Extract media type from data URL
    const match = url.match(/^data:([^;]+)/)
    return match ? match[1] : 'image/jpeg'
  },
}))

describe('build-prompt utility', () => {
  // Create mock profile
  const mockProfile: Tables<'profiles'> = {
    id: 'user-123',
    user_id: 'user-123',
    bio: 'Test user bio',
    has_onboarded: true,
    image_url: null,
    image_path: '',
    profile_context: 'I am a mechanic working on European vehicles',
    display_name: 'Test User',
    username: 'testuser',
    use_azure_openai: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    anthropic_api_key: null,
    azure_openai_35_turbo_id: null,
    azure_openai_45_turbo_id: null,
    azure_openai_45_vision_id: null,
    azure_openai_api_key: null,
    azure_openai_embeddings_id: null,
    azure_openai_endpoint: null,
    google_gemini_api_key: null,
    groq_api_key: null,
    mistral_api_key: null,
    openai_api_key: null,
    openai_organization_id: null,
    openrouter_api_key: null,
    perplexity_api_key: null,
  }

  // Create base chat payload
  const createMockPayload = (overrides?: Partial<ChatPayload>): ChatPayload => ({
    chatSettings: {
      model: 'gpt-4',
      prompt: 'You are a helpful automotive assistant.',
      temperature: 0.7,
      contextLength: 8192,
      includeProfileContext: true,
      includeWorkspaceInstructions: true,
      embeddingsProvider: 'openai',
      ...overrides?.chatSettings,
    },
    workspaceInstructions: 'Always provide safety warnings when discussing electrical work.',
    chatMessages: overrides?.chatMessages || [],
    assistant: overrides?.assistant || null,
    messageFileItems: overrides?.messageFileItems || [],
    chatFileItems: overrides?.chatFileItems || [],
    ...overrides,
  })

  // Create mock chat message
  const createMockChatMessage = (
    role: 'user' | 'assistant',
    content: string,
    options?: { image_paths?: string[]; fileItems?: string[] }
  ): ChatMessage => ({
    message: {
      id: `msg-${Math.random().toString(36).substring(7)}`,
      chat_id: 'chat-123',
      content,
      role,
      model: 'gpt-4',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      sequence_number: 1,
      user_id: 'user-123',
      assistant_id: null,
      image_paths: options?.image_paths || [],
    },
    fileItems: options?.fileItems || [],
  })

  const mockChatImages: MessageImage[] = []

  describe('buildFinalMessages', () => {
    it('builds messages with system prompt containing profile context', async () => {
      const payload = createMockPayload({
        chatMessages: [
          createMockChatMessage('user', 'How do I replace a fuse?'),
        ],
      })

      const result = await buildFinalMessages(payload, mockProfile, mockChatImages)

      // First message should be system message
      expect(result[0].role).toBe('system')
      expect(result[0].content).toContain('You are a helpful automotive assistant.')
      expect(result[0].content).toContain('I am a mechanic working on European vehicles')
    })

    it('includes workspace instructions when enabled', async () => {
      const payload = createMockPayload({
        chatMessages: [
          createMockChatMessage('user', 'Test message'),
        ],
      })

      const result = await buildFinalMessages(payload, mockProfile, mockChatImages)

      expect(result[0].content).toContain('Always provide safety warnings')
    })

    it('excludes profile context when disabled', async () => {
      const payload = createMockPayload({
        chatSettings: {
          model: 'gpt-4',
          prompt: 'You are a helpful assistant.',
          temperature: 0.7,
          contextLength: 8192,
          includeProfileContext: false,
          includeWorkspaceInstructions: true,
          embeddingsProvider: 'openai',
        },
        chatMessages: [
          createMockChatMessage('user', 'Test message'),
        ],
      })

      const result = await buildFinalMessages(payload, mockProfile, mockChatImages)

      expect(result[0].content).not.toContain('I am a mechanic working on European vehicles')
    })

    it('excludes workspace instructions when disabled', async () => {
      const payload = createMockPayload({
        chatSettings: {
          model: 'gpt-4',
          prompt: 'You are a helpful assistant.',
          temperature: 0.7,
          contextLength: 8192,
          includeProfileContext: true,
          includeWorkspaceInstructions: false,
          embeddingsProvider: 'openai',
        },
        chatMessages: [
          createMockChatMessage('user', 'Test message'),
        ],
      })

      const result = await buildFinalMessages(payload, mockProfile, mockChatImages)

      expect(result[0].content).not.toContain('Always provide safety warnings')
    })

    it('includes assistant persona when provided', async () => {
      const mockAssistant: Tables<'assistants'> = {
        id: 'assistant-123',
        user_id: 'user-123',
        name: 'AutoMechanic Pro',
        description: 'Expert automotive assistant',
        model: 'gpt-4',
        prompt: 'You are an expert mechanic.',
        temperature: 0.7,
        context_length: 8192,
        include_profile_context: true,
        include_workspace_instructions: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        folder_id: null,
        sharing: 'private',
        embeddings_provider: 'openai',
        image_path: '',
      }

      const payload = createMockPayload({
        assistant: mockAssistant,
        chatMessages: [
          createMockChatMessage('user', 'Test message'),
        ],
      })

      const result = await buildFinalMessages(payload, mockProfile, mockChatImages)

      expect(result[0].content).toContain('You are not an AI')
      expect(result[0].content).toContain('AutoMechanic Pro')
    })

    it('includes date in system prompt', async () => {
      const payload = createMockPayload({
        chatMessages: [
          createMockChatMessage('user', 'Test message'),
        ],
      })

      const result = await buildFinalMessages(payload, mockProfile, mockChatImages)

      expect(result[0].content).toContain('Today is')
    })

    it('preserves message order with user and assistant messages', async () => {
      const payload = createMockPayload({
        chatMessages: [
          createMockChatMessage('user', 'What is a relay?'),
          createMockChatMessage('assistant', 'A relay is an electrically operated switch.'),
          createMockChatMessage('user', 'How do I test one?'),
        ],
      })

      const result = await buildFinalMessages(payload, mockProfile, mockChatImages)

      expect(result).toHaveLength(4) // 1 system + 3 messages
      expect(result[0].role).toBe('system')
      expect(result[1].role).toBe('user')
      expect(result[1].content).toBe('What is a relay?')
      expect(result[2].role).toBe('assistant')
      expect(result[3].role).toBe('user')
      expect(result[3].content).toBe('How do I test one?')
    })

    it('handles messages with data URL images', async () => {
      const payload = createMockPayload({
        chatMessages: [
          createMockChatMessage('user', 'What is this component?', {
            image_paths: ['data:image/jpeg;base64,/9j/4AAQSkZJRg...'],
          }),
        ],
      })

      const result = await buildFinalMessages(payload, mockProfile, mockChatImages)

      // User message should have content array with text and image
      const userMessage = result[1]
      expect(Array.isArray(userMessage.content)).toBe(true)
      expect(userMessage.content[0]).toEqual({
        type: 'text',
        text: 'What is this component?',
      })
      expect(userMessage.content[1].type).toBe('image_url')
    })

    it('handles messages with external image paths', async () => {
      const chatImages: MessageImage[] = [
        {
          path: '/uploads/image123.jpg',
          base64: 'data:image/jpeg;base64,/9j/4AAQBase64Content...',
          type: 'image/jpeg',
          file: null,
        },
      ]

      const payload = createMockPayload({
        chatMessages: [
          createMockChatMessage('user', 'Check this image', {
            image_paths: ['/uploads/image123.jpg'],
          }),
        ],
      })

      const result = await buildFinalMessages(payload, mockProfile, chatImages)

      const userMessage = result[1]
      expect(Array.isArray(userMessage.content)).toBe(true)
      expect(userMessage.content[1].image_url.url).toBe(
        'data:image/jpeg;base64,/9j/4AAQBase64Content...'
      )
    })

    it('appends file retrieval text to user message when messageFileItems provided', async () => {
      const mockFileItems: Tables<'file_items'>[] = [
        {
          id: 'file-item-1',
          file_id: 'file-1',
          user_id: 'user-123',
          content: 'This is the content from a repair manual about fuses.',
          tokens: 100,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
          local_embedding: null,
          openai_embedding: null,
          sharing: 'private',
        },
      ]

      const payload = createMockPayload({
        chatMessages: [
          createMockChatMessage('user', 'Tell me about fuses'),
        ],
        messageFileItems: mockFileItems,
      })

      const result = await buildFinalMessages(payload, mockProfile, mockChatImages)

      const userMessage = result[1]
      expect(userMessage.content).toContain('Tell me about fuses')
      expect(userMessage.content).toContain('This is the content from a repair manual about fuses.')
      expect(userMessage.content).toContain('<BEGIN SOURCE>')
      expect(userMessage.content).toContain('</END SOURCE>')
    })

    it('respects context length limits by trimming older messages', async () => {
      // Create many messages to exceed context length
      const manyMessages = []
      for (let i = 0; i < 100; i++) {
        manyMessages.push(
          createMockChatMessage(
            i % 2 === 0 ? 'user' : 'assistant',
            `This is message number ${i} with some content to increase token count significantly.`
          )
        )
      }

      const payload = createMockPayload({
        chatSettings: {
          model: 'gpt-4',
          prompt: 'You are a helpful assistant.',
          temperature: 0.7,
          contextLength: 500, // Very small context to force trimming
          includeProfileContext: false,
          includeWorkspaceInstructions: false,
          embeddingsProvider: 'openai',
        },
        chatMessages: manyMessages,
      })

      const result = await buildFinalMessages(payload, mockProfile, mockChatImages)

      // Should have system message + some recent messages, but not all 100
      expect(result.length).toBeLessThan(101)
      expect(result.length).toBeGreaterThan(1)
      expect(result[0].role).toBe('system')
    })
  })

  describe('adaptMessagesForGoogleGemini', () => {
    it('converts OpenAI format to Gemini format', async () => {
      const payload = createMockPayload()
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ]

      const result = await adaptMessagesForGoogleGemini(payload, messages)

      // System messages become user role in Gemini
      expect(result[0].role).toBe('user')
      expect(result[0].parts).toEqual([{ text: 'You are a helpful assistant.' }])

      // User messages stay as user
      expect(result[1].role).toBe('user')
      expect(result[1].parts).toEqual([{ text: 'Hello' }])

      // Assistant becomes model
      expect(result[2].role).toBe('model')
      expect(result[2].parts).toEqual([{ text: 'Hi there!' }])
    })

    it('handles messages with image content', async () => {
      const payload = createMockPayload()
      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What is this?' },
            {
              type: 'image_url',
              image_url: { url: 'data:image/jpeg;base64,/9j/4AAQTestImage...' },
            },
          ],
        },
      ]

      const result = await adaptMessagesForGoogleGemini(payload, messages)

      expect(result[0].role).toBe('user')
      expect(result[0].parts).toHaveLength(2)
      expect(result[0].parts[0]).toEqual({ text: 'What is this?' })
      expect(result[0].parts[1]).toEqual({
        inlineData: {
          data: '/9j/4AAQTestImage...',
          mimeType: 'image/jpeg',
        },
      })
    })

    it('handles gemini-pro-vision model with special formatting', async () => {
      const payload = createMockPayload({
        chatSettings: {
          model: 'gemini-pro-vision',
          prompt: 'You are an image analyzer.',
          temperature: 0.7,
          contextLength: 8192,
          includeProfileContext: false,
          includeWorkspaceInstructions: false,
          embeddingsProvider: 'openai',
        },
      })

      const messages = [
        { role: 'system', content: 'Analyze images carefully.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What component is this?' },
            {
              type: 'image_url',
              image_url: { url: 'data:image/png;base64,iVBORw0KGgo...' },
            },
          ],
        },
      ]

      const result = await adaptMessagesForGoogleGemini(payload, messages)

      // For gemini-pro-vision, messages are reformatted into a single message
      expect(result).toHaveLength(1)
      expect(result[0].role).toBe('user')
    })

    it('handles array content with multiple text parts', async () => {
      const payload = createMockPayload()
      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'First part of the question.' },
            { type: 'text', text: 'Second part.' },
          ],
        },
      ]

      const result = await adaptMessagesForGoogleGemini(payload, messages)

      expect(result[0].parts).toHaveLength(2)
      expect(result[0].parts[0]).toEqual({ text: 'First part of the question.' })
      expect(result[0].parts[1]).toEqual({ text: 'Second part.' })
    })

    it('handles plain string content', async () => {
      const payload = createMockPayload()
      const messages = [
        { role: 'user', content: 'Simple text message' },
      ]

      const result = await adaptMessagesForGoogleGemini(payload, messages)

      expect(result[0].parts).toEqual([{ text: 'Simple text message' }])
    })
  })
})
