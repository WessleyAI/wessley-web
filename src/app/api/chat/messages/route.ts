import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSceneComponentsForGPT } from '@/lib/scene-components-loader'

export async function POST(request: NextRequest) {
  console.log('[API /chat/messages] POST request received')

  try {
    const body = await request.json()
    console.log('[API /chat/messages] Request body:', body)

    const { chatId, userMessage, vehicle } = body

    if (!chatId || !userMessage) {
      console.log('[API /chat/messages] Missing chatId or userMessage')
      return NextResponse.json({ error: 'Chat ID and user message are required' }, { status: 400 })
    }

    // Get authenticated user (or use demo mode)
    console.log('[API /chat/messages] Getting authenticated user...')
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('[API /chat/messages] Auth result:', { user: !!user, error: authError })

    // For demo mode, allow unauthenticated requests
    const isDemoMode = !user || authError
    const userId = user?.id || 'demo-user'

    if (!isDemoMode && authError) {
      console.log('[API /chat/messages] Auth failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[API /chat/messages] User ID:', userId, 'Demo mode:', isDemoMode)

    // Check for OpenAI API key
    console.log('[API /chat/messages] Checking OpenAI API key...')
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('[API /chat/messages] OpenAI API key not found')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }
    console.log('[API /chat/messages] OpenAI API key found:', openaiApiKey.substring(0, 10) + '...')

    // Save user message to database using server client (not browser client)
    console.log('[API /chat/messages] Creating user message in database...')
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

    console.log('[API /chat/messages] User message created:', userMessageRecord)

    // Load scene component data for GPT context
    console.log('[API /chat/messages] Loading scene components...')
    const sceneComponentsData = await getSceneComponentsForGPT()
    console.log('[API /chat/messages] Scene components loaded')

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

Provide detailed, accurate technical guidance for electrical system repairs, component identification, wiring diagrams, and troubleshooting. Be concise but thorough, and always prioritize safety.`
      : `You are an expert automotive electrical assistant specializing in vehicle restoration projects. Provide detailed, accurate technical guidance for electrical system repairs, component identification, wiring diagrams, and troubleshooting. Be concise but thorough, and always prioritize safety.`

    // Get conversation history
    const { data: previousMessages } = await supabase
      .from('chat_messages')
      .select('content, role, metadata')
      .eq('conversation_id', chatId)
      .order('created_at', { ascending: true })
      .limit(20) // Last 20 messages for context

    // Check if we're in onboarding problems collection phase
    const isOnboardingProblems = previousMessages?.some(msg =>
      msg.role === 'assistant' && msg.metadata?.type === 'onboarding_problems'
    )

    // Add special instructions for onboarding problems phase
    let finalSystemPrompt = systemPrompt
    if (isOnboardingProblems) {
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
        console.log('[API /chat/messages] Parsed scene events:', sceneEvents)
        // Remove the scene-events block from the message
        assistantMessage = assistantMessage.replace(/```scene-events\n[\s\S]*?\n```/, '').trim()
      } catch (err) {
        console.error('[API /chat/messages] Failed to parse scene events:', err)
      }
    }

    // Save assistant message to database using server client (not browser client)
    console.log('[API /chat/messages] Creating assistant message in database...')
    const { data: assistantMessageRecord, error: assistantMessageError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: chatId,
        user_id: null, // AI message
        content: assistantMessage,
        role: 'assistant',
        ai_model: 'gpt-5.1-chat-latest',
        ai_tokens_used: tokensUsed
      })
      .select('*')
      .single()

    if (assistantMessageError) {
      console.error('[API /chat/messages] Failed to create assistant message:', assistantMessageError)
      return NextResponse.json({ error: 'Failed to save assistant message' }, { status: 500 })
    }

    console.log('[API /chat/messages] Assistant message created:', assistantMessageRecord)

    // Update chat's last_message_at
    await supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId)

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
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
