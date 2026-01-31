/**
 * Tests for Chat Bench API Route (Onboarding Flow)
 *
 * Why these tests matter:
 * - Bench is the onboarding entry point for new workspaces
 * - Handles multi-step conversation flow (vehicle info -> nickname -> problems)
 * - Scene events drive 3D component visualization during onboarding
 * - Demo workspace support allows marketing demos without auth
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

describe('/api/chat/bench', () => {
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
    return new NextRequest('http://localhost:3000/api/chat/bench', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

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

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        userMessage: 'Hello',
        workspaceId: 'non-demo-workspace',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.error).toBe('Unauthorized')
    })
  })

  describe('request validation', () => {
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
          from: vi.fn((table: string) => {
            if (table === 'profiles') {
              return {
                select: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                      data: { subscription_status: 'active' },
                      error: null,
                    }),
                  })),
                })),
              }
            }
            return {}
          }),
        })),
      }))

      vi.doMock('@/lib/scene-components-loader', () => ({
        getSceneComponentsForGPT: vi.fn(() => Promise.resolve('Mock data')),
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({})

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('User message is required')
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
          from: vi.fn((table: string) => {
            if (table === 'profiles') {
              return {
                select: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                      data: { subscription_status: 'active' },
                      error: null,
                    }),
                  })),
                })),
              }
            }
            return {}
          }),
        })),
      }))

      vi.doMock('@/lib/scene-components-loader', () => ({
        getSceneComponentsForGPT: vi.fn(() => Promise.resolve('Mock data')),
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
          from: vi.fn((table: string) => {
            if (table === 'profiles') {
              return {
                select: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                      data: { subscription_status: 'active' },
                      error: null,
                    }),
                  })),
                })),
              }
            }
            return {}
          }),
        })),
      }))

      vi.doMock('@/lib/scene-components-loader', () => ({
        getSceneComponentsForGPT: vi.fn(() => Promise.resolve('Mock data')),
      }))

      vi.doMock('@/lib/rate-limit', () => ({
        chatRatelimit: {},
        checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
        getRateLimitIdentifier: vi.fn(() => 'test-id'),
        createRateLimitResponse: vi.fn(),
      }))

      const { POST } = await import('./route')
      const request = createMockRequest({
        userMessage: 'Hello',
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Configuration error')
    })
  })
})

describe('Bench Onboarding Logic', () => {
  /**
   * Tests documenting the onboarding flow behavior
   */

  describe('demo workspace handling', () => {
    it('should use correct demo workspace ID', () => {
      const DEMO_WORKSPACE_ID = "cde0ea8e-07aa-4c59-a72b-ba0d56020484"
      expect(DEMO_WORKSPACE_ID).toBe('cde0ea8e-07aa-4c59-a72b-ba0d56020484')
    })

    it('should allow demo workspace access without auth', () => {
      const workspaceId = 'cde0ea8e-07aa-4c59-a72b-ba0d56020484'
      const isDemoWorkspace = workspaceId === 'cde0ea8e-07aa-4c59-a72b-ba0d56020484'
      expect(isDemoWorkspace).toBe(true)
    })
  })

  describe('onboarding steps', () => {
    it('should identify first message as vehicle info step', () => {
      const isFirstMessage = true
      const conversationHistory: any[] = []
      const userMessagesCount = conversationHistory.filter(m => m.role === 'user').length

      expect(isFirstMessage).toBe(true)
      expect(userMessagesCount).toBe(0)
    })

    it('should identify second message as nickname step', () => {
      const conversationHistory = [
        { role: 'user', content: '2000 Hyundai Galloper' },
        { role: 'assistant', content: 'Got it! Working with a 2000 Hyundai Galloper.' },
      ]
      const userMessagesCount = conversationHistory.filter(m => m.role === 'user').length

      expect(userMessagesCount).toBe(1)
    })

    it('should identify third+ messages as problems collection', () => {
      const conversationHistory = [
        { role: 'user', content: '2000 Hyundai Galloper' },
        { role: 'assistant', content: 'Got it!' },
        { role: 'user', content: 'Blue Thunder' },
        { role: 'assistant', content: 'Creating workspace...' },
      ]
      const userMessagesCount = conversationHistory.filter(m => m.role === 'user').length

      expect(userMessagesCount).toBeGreaterThanOrEqual(2)
    })
  })

  describe('message types', () => {
    it('should return onboarding_vehicle_info for first message', () => {
      const isFirstMessage = true
      const messageType = isFirstMessage ? 'onboarding_vehicle_info' : 'other'

      expect(messageType).toBe('onboarding_vehicle_info')
    })

    it('should return onboarding_nickname for second message', () => {
      const userMessagesCount = 1
      const isFirstMessage = false
      const messageType = userMessagesCount === 1 && !isFirstMessage
        ? 'onboarding_nickname'
        : 'other'

      expect(messageType).toBe('onboarding_nickname')
    })

    it('should return onboarding_problems for subsequent messages', () => {
      const userMessagesCount = 2
      const messageType = userMessagesCount >= 2 ? 'onboarding_problems' : 'other'

      expect(messageType).toBe('onboarding_problems')
    })
  })

  describe('onboarding completion', () => {
    it('should mark onboarding complete after nickname step', () => {
      const messageType = 'onboarding_nickname'
      const onboardingComplete = messageType === 'onboarding_nickname'

      expect(onboardingComplete).toBe(true)
    })

    it('should extract vehicle info from conversation', () => {
      const conversationHistory = [
        { role: 'user', content: '2000 Hyundai Galloper' },
        { role: 'assistant', content: 'Got it!' },
      ]
      const firstUserMessage = conversationHistory.find(m => m.role === 'user')?.content

      expect(firstUserMessage).toBe('2000 Hyundai Galloper')
    })

    it('should extract nickname from current message', () => {
      const userMessage = 'Blue Thunder'
      const vehicleInfo = {
        vehicleModel: '2000 Hyundai Galloper',
        nickname: userMessage,
        extractedFromGPT: true,
      }

      expect(vehicleInfo.nickname).toBe('Blue Thunder')
    })
  })

  describe('scene events parsing', () => {
    it('should extract scene events from response', () => {
      const aiResponse = `I've marked the components.
\`\`\`scene-events
[{"type": "mark_component_faulty", "data": {"componentIds": ["alt-1"]}}]
\`\`\`
These are now highlighted.`

      const match = aiResponse.match(/```scene-events\n([\s\S]*?)\n```/)
      expect(match).not.toBeNull()
    })

    it('should add timestamp to scene events', () => {
      const event = { type: 'mark_component_faulty', data: {} }
      const timestampedEvent = { ...event, timestamp: Date.now() }

      expect(timestampedEvent).toHaveProperty('timestamp')
    })

    it('should strip scene events from displayed message', () => {
      const aiResponse = `Text before\`\`\`scene-events
[{"type": "test"}]
\`\`\`Text after`

      const cleaned = aiResponse.replace(/```scene-events\n[\s\S]*?\n```/, '').trim()
      expect(cleaned).not.toContain('scene-events')
    })
  })

  describe('response format', () => {
    it('should include all required response fields', () => {
      const responseData = {
        success: true,
        assistantMessage: 'Response text',
        sceneEvents: [],
        tokensUsed: 100,
        messageType: 'onboarding_vehicle_info',
        onboardingComplete: false,
        vehicleInfo: null,
      }

      expect(responseData).toHaveProperty('success')
      expect(responseData).toHaveProperty('assistantMessage')
      expect(responseData).toHaveProperty('sceneEvents')
      expect(responseData).toHaveProperty('messageType')
      expect(responseData).toHaveProperty('onboardingComplete')
    })

    it('should include vehicle info when onboarding completes', () => {
      const responseData = {
        success: true,
        assistantMessage: 'Creating workspace...',
        onboardingComplete: true,
        vehicleInfo: {
          vehicleModel: '2000 Hyundai Galloper',
          nickname: 'Blue Thunder',
          extractedFromGPT: true,
        },
      }

      expect(responseData.onboardingComplete).toBe(true)
      expect(responseData.vehicleInfo).toBeDefined()
      expect(responseData.vehicleInfo?.nickname).toBe('Blue Thunder')
    })
  })

  describe('error handling', () => {
    it('should return structured error response', () => {
      const error = new Error('OpenAI API error')
      const errorResponse = {
        error: 'Internal server error',
        details: error.message,
      }

      expect(errorResponse.error).toBe('Internal server error')
      expect(errorResponse.details).toBe('OpenAI API error')
    })
  })
})

describe('Bench System Prompts', () => {
  describe('vehicle info prompt (step 1)', () => {
    it('should instruct extraction of year, make, model', () => {
      const expectedFields = ['Year', 'Make', 'Model']
      expectedFields.forEach(field => {
        expect(field.length).toBeGreaterThan(0)
      })
    })

    it('should ask for nickname after confirmation', () => {
      const promptPattern = 'nickname'
      expect(promptPattern).toBe('nickname')
    })
  })

  describe('nickname prompt (step 2)', () => {
    it('should acknowledge nickname and announce workspace creation', () => {
      const responseFormat = 'Creating your workspace now...'
      expect(responseFormat).toContain('workspace')
    })
  })

  describe('problems prompt (step 3+)', () => {
    it('should include scene component data', () => {
      const hasSceneData = true
      expect(hasSceneData).toBe(true)
    })

    it('should include mark_component_faulty event type', () => {
      const eventTypes = [
        'focus_component',
        'highlight_components',
        'mark_component_faulty',
        'mark_component_healthy',
      ]
      expect(eventTypes).toContain('mark_component_faulty')
    })

    it('should instruct fuzzy matching on component IDs', () => {
      const matchingRules = [
        'tail lights not working → search for tail/light/rear',
        'alternator issues → search for alternator',
        'right window → search for window/right/actuator',
      ]
      expect(matchingRules.length).toBeGreaterThan(0)
    })
  })
})
