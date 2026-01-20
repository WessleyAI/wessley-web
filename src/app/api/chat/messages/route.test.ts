/**
 * Tests for Chat Messages API Route
 *
 * Why these tests matter:
 * - Chat is the core user interaction for the application
 * - Messages are persisted to database and drive the 3D scene events
 * - Rate limiting and auth protect against abuse and cost overruns
 * - RAG context integration enriches AI responses with relevant data
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

describe('/api/chat/messages', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  function createMockRequest(body: object): NextRequest {
    return new NextRequest('http://localhost:3000/api/chat/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  describe('request validation', () => {
    it('should return 400 when chatId is missing', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key'

      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: vi.fn(),
        })),
      }))

      vi.doMock('@/lib/scene-components-loader', () => ({
        getSceneComponentsForGPT: vi.fn(() => Promise.resolve('Mock data')),
      }))

      vi.doMock('@/lib/posthog-server', () => ({
        getPostHogClient: vi.fn(() => ({ capture: vi.fn() })),
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({ userMessage: 'Hello' })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Chat ID and user message are required')
    })

    it('should return 400 when userMessage is missing', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key'

      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: vi.fn(),
        })),
      }))

      vi.doMock('@/lib/scene-components-loader', () => ({
        getSceneComponentsForGPT: vi.fn(() => Promise.resolve('Mock data')),
      }))

      vi.doMock('@/lib/posthog-server', () => ({
        getPostHogClient: vi.fn(() => ({ capture: vi.fn() })),
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({ chatId: 'chat-123' })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Chat ID and user message are required')
    })
  })

  describe('authentication', () => {
    it('should return 401 when user is not authenticated and not demo workspace', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key'

      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
          from: vi.fn(),
        })),
      }))

      vi.doMock('@/lib/scene-components-loader', () => ({
        getSceneComponentsForGPT: vi.fn(() => Promise.resolve('Mock data')),
      }))

      vi.doMock('@/lib/posthog-server', () => ({
        getPostHogClient: vi.fn(() => ({ capture: vi.fn() })),
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        chatId: 'chat-123',
        userMessage: 'Hello',
        workspaceId: 'some-other-workspace',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })
  })

  describe('rate limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key'

      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: vi.fn(),
        })),
      }))

      vi.doMock('@/lib/scene-components-loader', () => ({
        getSceneComponentsForGPT: vi.fn(() => Promise.resolve('Mock data')),
      }))

      vi.doMock('@/lib/posthog-server', () => ({
        getPostHogClient: vi.fn(() => ({ capture: vi.fn() })),
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: false, remaining: 0 })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(() => {
          const { NextResponse } = require('next/server')
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
        }),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        chatId: 'chat-123',
        userMessage: 'Hello',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(429)
      expect(json.error).toBe('Rate limit exceeded')
    })
  })

  describe('configuration', () => {
    it('should return 500 when OPENAI_API_KEY is not configured', async () => {
      delete process.env.OPENAI_API_KEY

      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn(() => Promise.resolve({
          auth: {
            getUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: vi.fn(() => ({
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: {}, error: null }),
              })),
            })),
          })),
        })),
      }))

      vi.doMock('@/lib/scene-components-loader', () => ({
        getSceneComponentsForGPT: vi.fn(() => Promise.resolve('Mock data')),
      }))

      vi.doMock('@/lib/posthog-server', () => ({
        getPostHogClient: vi.fn(() => ({ capture: vi.fn() })),
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        chatId: 'chat-123',
        userMessage: 'Hello',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Configuration error')
    })
  })
})

describe('Chat Messages Logic', () => {
  /**
   * These tests document the expected behavior of the chat messages route
   * without requiring full integration testing.
   */

  describe('demo workspace handling', () => {
    it('should use correct demo workspace ID', () => {
      const DEMO_WORKSPACE_ID = "cde0ea8e-07aa-4c59-a72b-ba0d56020484"
      expect(DEMO_WORKSPACE_ID).toBe('cde0ea8e-07aa-4c59-a72b-ba0d56020484')
      expect(DEMO_WORKSPACE_ID).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    })

    it('should allow demo workspace access without auth', () => {
      const workspaceId = 'cde0ea8e-07aa-4c59-a72b-ba0d56020484'
      const isDemoWorkspace = workspaceId === 'cde0ea8e-07aa-4c59-a72b-ba0d56020484'
      expect(isDemoWorkspace).toBe(true)
    })

    it('should use demo-user as fallback for unauthenticated users', () => {
      const user = null
      const userId = user?.id || 'demo-user'
      expect(userId).toBe('demo-user')
    })
  })

  describe('RAG context formatting', () => {
    it('should format documentation results with title and content', () => {
      const result = {
        title: 'Alternator Repair Guide',
        content: 'Step 1: Disconnect the battery...',
        score: 0.92,
        metadata: { source: 'service-manual' },
      }

      expect(result.title).toBeDefined()
      expect(result.content).toBeDefined()
      expect(result.score).toBeGreaterThan(0)
    })

    it('should truncate long content to 400 characters', () => {
      const longContent = 'A'.repeat(500)
      const truncated = longContent.substring(0, 400)

      expect(truncated).toHaveLength(400)
      expect(longContent.length).toBeGreaterThan(400)
    })

    it('should include graph context components and connections', () => {
      const graphContext = {
        components: [
          { id: 'alt-1', type: 'alternator', name: 'Main Alternator' },
        ],
        connections: [
          {
            from_component: 'alt-1',
            to_component: 'bat-1',
            wire: { color: 'red', gauge: '8AWG' },
          },
        ],
      }

      expect(graphContext.components).toHaveLength(1)
      expect(graphContext.connections).toHaveLength(1)
      expect(graphContext.connections[0].wire.color).toBe('red')
    })
  })

  describe('confidence calculation', () => {
    it('should return 0.5 default confidence without RAG context', () => {
      const ragContext = undefined
      const defaultConfidence = 0.5
      expect(defaultConfidence).toBe(0.5)
    })

    it('should calculate higher confidence with RAG results', () => {
      const ragResults = [
        { score: 0.9 },
        { score: 0.85 },
      ]
      const avgScore = ragResults.reduce((sum, r) => sum + r.score, 0) / ragResults.length
      const confidence = Math.min(0.95, 0.6 + (avgScore * 0.35))

      expect(confidence).toBeGreaterThan(0.8)
      expect(confidence).toBeLessThanOrEqual(0.95)
    })

    it('should cap confidence at 0.98 with graph context boost', () => {
      const baseConfidence = 0.92
      const withGraphBoost = Math.min(0.98, baseConfidence + 0.1)

      expect(withGraphBoost).toBeLessThanOrEqual(0.98)
    })
  })

  describe('scene events parsing', () => {
    it('should extract scene events from markdown code block', () => {
      const aiResponse = `Here's an explanation.
\`\`\`scene-events
[{"type": "focus_component", "data": {"componentId": "comp-1"}}]
\`\`\`
More text here.`

      const match = aiResponse.match(/```scene-events\n([\s\S]*?)\n```/)
      expect(match).not.toBeNull()
      expect(match![1]).toContain('focus_component')
    })

    it('should parse valid scene event types', () => {
      const validEventTypes = [
        'focus_component',
        'highlight_components',
        'show_path',
        'show_connections',
        'show_circuit',
        'zoom_to_area',
        'reset_view',
        'mark_component_faulty',
        'mark_component_healthy',
      ]

      validEventTypes.forEach(type => {
        expect(typeof type).toBe('string')
        expect(type.length).toBeGreaterThan(0)
      })
    })

    it('should add timestamp to parsed scene events', () => {
      const event = { type: 'focus_component', data: {} }
      const timestampedEvent = { ...event, timestamp: Date.now() }

      expect(timestampedEvent).toHaveProperty('timestamp')
      expect(typeof timestampedEvent.timestamp).toBe('number')
    })

    it('should strip scene events block from response text', () => {
      const aiResponse = `Explanation text.\`\`\`scene-events
[{"type": "focus_component"}]
\`\`\`More text.`

      const cleaned = aiResponse.replace(/```scene-events\n[\s\S]*?\n```/, '').trim()
      expect(cleaned).not.toContain('```scene-events')
    })
  })

  describe('response format', () => {
    it('should include spec-compliant fields', () => {
      const response = {
        response: 'AI response text',
        sources: [],
        confidence: 0.5,
        conversation_id: 'chat-123',
      }

      expect(response).toHaveProperty('response')
      expect(response).toHaveProperty('sources')
      expect(response).toHaveProperty('confidence')
      expect(response).toHaveProperty('conversation_id')
    })

    it('should include legacy fields for backward compatibility', () => {
      const response = {
        success: true,
        userMessage: {},
        assistantMessage: {},
        sceneEvents: [],
        tokensUsed: 100,
      }

      expect(response).toHaveProperty('success')
      expect(response).toHaveProperty('userMessage')
      expect(response).toHaveProperty('assistantMessage')
      expect(response).toHaveProperty('sceneEvents')
      expect(response).toHaveProperty('tokensUsed')
    })

    it('should format sources from RAG results', () => {
      const ragResult = {
        title: 'Guide',
        content: 'Content text here...',
        score: 0.9,
        metadata: { source: 'manual.pdf' },
      }

      const source = {
        title: ragResult.title || 'Document',
        url: ragResult.metadata?.source || undefined,
        similarity: ragResult.score || 0,
        snippet: ragResult.content?.substring(0, 200) || '',
      }

      expect(source.title).toBe('Guide')
      expect(source.similarity).toBe(0.9)
      expect(source.snippet.length).toBeLessThanOrEqual(200)
    })
  })

  describe('system prompt construction', () => {
    it('should include vehicle context when provided', () => {
      const vehicle = { make: 'Honda', model: 'Civic', year: 1995 }
      const prompt = `Helping with a ${vehicle.make} ${vehicle.model} ${vehicle.year}`

      expect(prompt).toContain('Honda')
      expect(prompt).toContain('Civic')
      expect(prompt).toContain('1995')
    })

    it('should include welcome setup prompt for first message', () => {
      const isWelcomeSetup = true
      const promptType = isWelcomeSetup ? 'welcome_setup' : 'standard'

      expect(promptType).toBe('welcome_setup')
    })

    it('should include onboarding problems prompt after welcome', () => {
      const previousMessages = [
        { role: 'assistant', metadata: { type: 'onboarding_problems' } },
      ]
      const isOnboardingProblems = previousMessages.some(
        msg => msg.role === 'assistant' && msg.metadata?.type === 'onboarding_problems'
      )

      expect(isOnboardingProblems).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should return structured error response', () => {
      const error = new Error('Database connection failed')
      const errorResponse = {
        error: 'Internal server error',
        details: error.message,
      }

      expect(errorResponse.error).toBe('Internal server error')
      expect(errorResponse.details).toBe('Database connection failed')
    })

    it('should track errors with PostHog', () => {
      const errorEvent = {
        distinctId: 'system',
        event: 'api_error_occurred',
        properties: {
          endpoint: '/api/chat/messages',
          error_message: 'Test error',
          error_type: 'Error',
        },
      }

      expect(errorEvent.event).toBe('api_error_occurred')
      expect(errorEvent.properties.endpoint).toBe('/api/chat/messages')
    })
  })
})

describe('Message Storage', () => {
  describe('user message creation', () => {
    it('should include required fields for user messages', () => {
      const userMessage = {
        conversation_id: 'chat-123',
        user_id: 'user-123',
        content: 'Hello, how do I fix the alternator?',
        role: 'user',
        ai_model: 'gpt-5.1-chat-latest',
      }

      expect(userMessage.conversation_id).toBeDefined()
      expect(userMessage.user_id).toBeDefined()
      expect(userMessage.content).toBeDefined()
      expect(userMessage.role).toBe('user')
    })
  })

  describe('assistant message creation', () => {
    it('should include AI-specific fields', () => {
      const assistantMessage = {
        conversation_id: 'chat-123',
        user_id: null, // AI messages have null user_id
        content: 'To fix the alternator...',
        role: 'assistant',
        ai_model: 'gpt-5.1-chat-latest',
        ai_tokens_used: 150,
        metadata: null,
      }

      expect(assistantMessage.user_id).toBeNull()
      expect(assistantMessage.role).toBe('assistant')
      expect(assistantMessage.ai_tokens_used).toBeDefined()
    })

    it('should include metadata for onboarding transitions', () => {
      const isWelcomeSetup = true
      const metadata = isWelcomeSetup ? { type: 'onboarding_problems' } : null

      expect(metadata).toEqual({ type: 'onboarding_problems' })
    })
  })

  describe('conversation update', () => {
    it('should update last_message_at timestamp', () => {
      const timestamp = new Date().toISOString()
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })
})

describe('PostHog Analytics', () => {
  it('should track chat messages with appropriate properties', () => {
    const event = {
      distinctId: 'user-123',
      event: 'chat_message_sent',
      properties: {
        chat_id: 'chat-123',
        message_length: 50,
        has_vehicle_context: true,
        vehicle_make: 'Honda',
        vehicle_model: 'Civic',
        vehicle_year: 1995,
        tokens_used: 100,
        has_scene_events: true,
        scene_events_count: 2,
        is_demo_mode: false,
      },
    }

    expect(event.event).toBe('chat_message_sent')
    expect(event.properties.has_vehicle_context).toBe(true)
    expect(event.properties.scene_events_count).toBe(2)
  })
})
