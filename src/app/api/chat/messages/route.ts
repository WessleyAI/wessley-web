import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSceneComponentsForGPT } from '@/lib/scene-components-loader'
import { getPostHogClient } from '@/lib/posthog-server'
import {
  chatRatelimit,
  checkRateLimit,
  getRateLimitIdentifier,
  createRateLimitResponse,
} from '@/lib/rate-limit'

// Demo workspace ID for unauthenticated access
const DEMO_WORKSPACE_ID = "cde0ea8e-07aa-4c59-a72b-ba0d56020484"

// Type for RAG context passed from frontend
interface RAGContext {
  results?: Array<{
    title?: string
    content?: string
    metadata?: {
      source?: string
      [key: string]: unknown
    }
    score?: number
  }>
  graphContext?: {
    components?: Array<{
      id: string
      type: string
      name: string
    }>
    connections?: Array<{
      from_component: string
      to_component: string
      wire: {
        color: string
        gauge: string
      }
    }>
  }
  processingTimeMs?: number
}

/**
 * Format RAG context for inclusion in the system prompt
 */
function formatRAGContextForSystemPrompt(ragContext: RAGContext): string {
  const parts: string[] = []

  if (ragContext.results && ragContext.results.length > 0) {
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    parts.push('📚 RELEVANT DOCUMENTATION FROM KNOWLEDGE BASE:')
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    ragContext.results.forEach((result, index) => {
      const snippet = result.content?.substring(0, 400) || ''
      parts.push(`\n${index + 1}. **${result.title || 'Document'}**`)
      if (snippet) {
        parts.push(`   ${snippet}${result.content && result.content.length > 400 ? '...' : ''}`)
      }
      if (result.metadata?.source) {
        parts.push(`   Source: ${result.metadata.source}`)
      }
    })
    parts.push('')
  }

  if (ragContext.graphContext) {
    const { components, connections } = ragContext.graphContext

    if (components && components.length > 0) {
      parts.push('🔌 RELATED ELECTRICAL COMPONENTS FROM GRAPH:')
      components.forEach(comp => {
        parts.push(`- ${comp.name} (${comp.type})`)
      })
      parts.push('')
    }

    if (connections && connections.length > 0) {
      parts.push('⚡ COMPONENT WIRING CONNECTIONS:')
      connections.forEach(conn => {
        parts.push(`- ${conn.from_component} → ${conn.to_component} via ${conn.wire.color} ${conn.wire.gauge} wire`)
      })
      parts.push('')
    }
  }

  if (parts.length > 0) {
    parts.push('Use the above documentation and component information to provide more accurate and specific answers.')
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }

  return parts.join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { chatId, userMessage, vehicle, workspaceId, ragContext } = body

    if (!chatId || !userMessage) {
      return NextResponse.json({ error: 'Chat ID and user message are required' }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Only allow unauthenticated requests for demo workspace
    const isDemoWorkspace = workspaceId === DEMO_WORKSPACE_ID

    if (!user && !isDemoWorkspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user?.id || 'demo-user'
    const isDemoMode = !user

    // Apply rate limiting (60 requests per minute for chat endpoints)
    const rateLimitIdentifier = getRateLimitIdentifier(user?.id, request)
    const rateLimitResult = await checkRateLimit(chatRatelimit, rateLimitIdentifier)

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('[API /chat/messages] OpenAI API key not found')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    // Save user message to database using server client (not browser client)
    const { data: userMessageRecord, error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: chatId,
        user_id: userId,
        content: userMessage,
        role: 'user',
        ai_model: 'gpt-5.1-chat-latest'
      })
      .select('*')
      .single()

    if (userMessageError) {
      console.error('[API /chat/messages] Failed to create user message:', userMessageError)
      return NextResponse.json({ error: 'Failed to save user message' }, { status: 500 })
    }

    // Load scene component data for GPT context
    const sceneComponentsData = await getSceneComponentsForGPT()

    // Build system context for vehicle restoration with scene interaction capabilities
    const systemPrompt = vehicle
      ? `You are an expert automotive electrical assistant specializing in vehicle restoration projects. You are currently helping with a ${vehicle.make} ${vehicle.model} ${vehicle.year}.

IMPORTANT: You have access to a 3D interactive model of the vehicle's electrical system. When answering questions, you can control the 3D view to highlight components, show connections, and demonstrate circuits.

To interact with the 3D scene, include a JSON block in your response using this format:
\`\`\`scene-events
[
  {
    "type": "focus_component",
    "data": { "componentId": "component_123", "componentName": "Window Actuator" },
    "description": "Focusing on the window actuator"
  }
]
\`\`\`

Available event types:
- focus_component: Focus camera on a specific component
- highlight_components: Highlight one or more components
- show_path: Show electrical path between two components
- show_connections: Show all connections for a component
- show_circuit: Show a complete circuit
- zoom_to_area: Zoom to a specific area (dashboard, engine_bay, etc)
- reset_view: Reset to default view

When users ask about specific components or circuits, ALWAYS include scene events to visualize what you're explaining. This makes your explanations much more helpful.

${sceneComponentsData}

${ragContext ? formatRAGContextForSystemPrompt(ragContext) : ''}

Provide detailed, accurate technical guidance for electrical system repairs, component identification, wiring diagrams, and troubleshooting. Be concise but thorough, and always prioritize safety.`
      : `You are an expert automotive electrical assistant specializing in vehicle restoration projects. Provide detailed, accurate technical guidance for electrical system repairs, component identification, wiring diagrams, and troubleshooting. Be concise but thorough, and always prioritize safety.`

    // Get conversation history
    const { data: previousMessages } = await supabase
      .from('chat_messages')
      .select('content, role, metadata')
      .eq('conversation_id', chatId)
      .order('created_at', { ascending: true })
      .limit(20) // Last 20 messages for context

    // Get conversation to check if it's welcome setup
    const { data: conversation } = await supabase
      .from('chat_conversations')
      .select('context_data')
      .eq('id', chatId)
      .single()

    // Check if we're in welcome setup phase (first user message in welcome setup conversation)
    const isWelcomeSetup = conversation?.context_data?.isWelcomeSetup === true &&
                           previousMessages?.length === 0

    // Check if we're in onboarding problems collection phase
    const isOnboardingProblems = previousMessages?.some(msg =>
      msg.role === 'assistant' && msg.metadata?.type === 'onboarding_problems'
    )

    // Add special instructions for welcome setup phase
    let finalSystemPrompt = systemPrompt
    if (isWelcomeSetup) {
      // This is the first user message in welcome setup
      finalSystemPrompt = `You are Wessley, a friendly automotive electrical assistant.

The user just told you about their vehicle. Your task:
1. Extract the vehicle information from their message (year, make, model, engine)
2. Extract the project name if they provided one, otherwise create a simple one
3. Respond with a friendly confirmation

Respond in this format:
"Great! I've set up your workspace for the **[Vehicle Info]** - **[Project Name]**.

Now, tell me - what problems are you experiencing with your vehicle? I'll help you diagnose them and identify which components might be faulty."

Keep it short and friendly. Do not include any scene events in this response.`
    } else if (isOnboardingProblems) {
      finalSystemPrompt += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚗 ONBOARDING MODE: Collecting Initial Problems
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When the user describes problems with their vehicle:
1. Parse their description to identify which electrical components are likely faulty
2. Search the component list above for matching component IDs (use fuzzy matching on canonical_id, type, or description)
3. Mark those components as faulty in the 3D scene using mark_component_faulty events
4. Provide a helpful diagnostic response explaining what you've identified

COMPONENT MATCHING RULES:
- Use fuzzy/partial string matching on the canonical_id or description fields
- Examples:
  * "tail lights not working" → search for components with "tail" or "light" and "rear" in canonical_id
  * "alternator issues" → search for component with "alternator" in canonical_id
  * "right window won't go down" → search for "window" + "right" or "actuator" + "right"
  * "fuel pump" → search for "fuel" + "pump" or "fuel" + "relay"

- If you can't find exact matches, use the most likely related components (e.g., relays, fuses in the related zone)
- When in doubt, mark related relays and fuses as potentially faulty

SCENE EVENT FORMAT:
\`\`\`scene-events
[
  {
    "type": "mark_component_faulty",
    "data": {
      "componentIds": ["actual_component_id_from_list"],
      "reason": "User reported: [exact user description]"
    },
    "description": "Marking [component names] as faulty"
  },
  {
    "type": "highlight_components",
    "data": {
      "componentIds": ["actual_component_id_from_list"],
      "color": "#ff0000",
      "duration": 5000
    },
    "description": "Highlighting faulty components for user"
  }
]
\`\`\`

RESPONSE STYLE:
- Be empathetic and acknowledge the user's problem
- Confirm which components you've marked as faulty in the 3D model
- Provide a brief explanation of what might be causing the issue
- Ask if there are any other problems or if they'd like to start diagnosing what you've identified
- Keep responses concise and action-oriented

Example response:
"I understand you're having issues with the tail lights. I've marked the **right tail light** and its related relay in the 3D model as potentially faulty (you'll see them highlighted in red). This could be due to a blown bulb, faulty relay, or wiring issue.

Are there any other electrical problems you're experiencing, or would you like me to help diagnose the tail light issue?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    }

    // Build messages array for GPT-5.1
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: finalSystemPrompt }
    ]

    // Add conversation history
    if (previousMessages && previousMessages.length > 0) {
      previousMessages.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      })
    }

    // Call OpenAI GPT-5.1 Chat Completions API with streaming
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.1-chat-latest',
        messages: messages,
        max_completion_tokens: 1500,
        stream: false
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
    }

    const result = await openaiResponse.json()
    let assistantMessage = result.choices?.[0]?.message?.content || 'No response generated'
    const tokensUsed = result.usage?.total_tokens || null

    // Parse scene events from the response
    let sceneEvents: any[] = []
    const sceneEventsMatch = assistantMessage.match(/```scene-events\n([\s\S]*?)\n```/)
    if (sceneEventsMatch) {
      try {
        const eventsJSON = sceneEventsMatch[1]
        sceneEvents = JSON.parse(eventsJSON)
        // Add timestamp to events
        sceneEvents = sceneEvents.map((event: any) => ({
          ...event,
          timestamp: Date.now()
        }))
        // Remove the scene-events block from the message
        assistantMessage = assistantMessage.replace(/```scene-events\n[\s\S]*?\n```/, '').trim()
      } catch (err) {
        console.error('[API /chat/messages] Failed to parse scene events:', err)
      }
    }

    // Determine metadata for assistant message
    let assistantMetadata = null
    if (isWelcomeSetup) {
      // This is the response to the welcome setup, transition to problems phase
      assistantMetadata = { type: 'onboarding_problems' }
    }

    // Save assistant message to database using server client (not browser client)
    const { data: assistantMessageRecord, error: assistantMessageError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: chatId,
        user_id: null, // AI message
        content: assistantMessage,
        role: 'assistant',
        ai_model: 'gpt-5.1-chat-latest',
        ai_tokens_used: tokensUsed,
        metadata: assistantMetadata
      })
      .select('*')
      .single()

    if (assistantMessageError) {
      console.error('[API /chat/messages] Failed to create assistant message:', assistantMessageError)
      return NextResponse.json({ error: 'Failed to save assistant message' }, { status: 500 })
    }

    // Update chat's last_message_at
    await supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId)

    // Track chat message with PostHog (server-side)
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: userId,
      event: 'chat_message_sent',
      properties: {
        chat_id: chatId,
        message_length: userMessage.length,
        has_vehicle_context: !!vehicle,
        vehicle_make: vehicle?.make,
        vehicle_model: vehicle?.model,
        vehicle_year: vehicle?.year,
        tokens_used: tokensUsed,
        has_scene_events: sceneEvents.length > 0,
        scene_events_count: sceneEvents.length,
        is_demo_mode: isDemoMode,
      }
    })

    return NextResponse.json({
      success: true,
      userMessage: userMessageRecord,
      assistantMessage: assistantMessageRecord,
      sceneEvents: sceneEvents,
      tokensUsed
    })

  } catch (error) {
    console.error('[API /chat/messages] Unhandled error:', error)
    console.error('[API /chat/messages] Error stack:', error instanceof Error ? error.stack : 'No stack')

    // Track API error with PostHog
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: 'system',
      event: 'api_error_occurred',
      properties: {
        endpoint: '/api/chat/messages',
        error_message: error instanceof Error ? error.message : String(error),
        error_type: error instanceof Error ? error.name : 'UnknownError',
      }
    })

    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
