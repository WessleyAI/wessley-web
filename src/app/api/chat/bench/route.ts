import { NextRequest, NextResponse } from 'next/server'
import { getSceneComponentsForGPT } from '@/lib/scene-components-loader'

export async function POST(request: NextRequest) {
  console.log('[API /chat/bench] POST request received - BENCH MODE (no database)')

  try {
    const body = await request.json()
    console.log('[API /chat/bench] Request body:', body)

    const { userMessage, conversationHistory, isFirstMessage } = body

    if (!userMessage) {
      console.log('[API /chat/bench] Missing userMessage')
      return NextResponse.json({ error: 'User message is required' }, { status: 400 })
    }

    // Check for OpenAI API key
    console.log('[API /chat/bench] Checking OpenAI API key...')
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('[API /chat/bench] OpenAI API key not found')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    // Load scene component data for GPT context
    console.log('[API /chat/bench] Loading scene components...')
    const sceneComponentsData = await getSceneComponentsForGPT()

    // Build system prompt based on onboarding phase
    let systemPrompt = ''
    let messageType = ''

    if (isFirstMessage) {
      // First message: extract vehicle info
      systemPrompt = `You are Wessley, a friendly automotive electrical assistant.

The user's LAST message contains their vehicle information. Extract whatever details they provided (year, make, model, engine - some may be missing, that's okay).

Your response MUST:
1. Acknowledge their vehicle with what they told you
2. Move forward to ask about problems - DO NOT ask for vehicle details again
3. Be brief and friendly

Example response format:
"Got it! Working with a **[Year Make Model]**.

What issues are you experiencing with it?"

IMPORTANT: Do not ask for vehicle information again. The user already provided it. Move straight to asking about problems.`
      messageType = 'onboarding_vehicle_info'
    } else {
      // Subsequent messages: collect problems and mark faulty components
      systemPrompt = `You are Wessley, an expert automotive electrical assistant specializing in vehicle restoration projects.

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
- mark_component_faulty: Mark component(s) as faulty/not working
- mark_component_healthy: Mark component(s) as healthy/working

${sceneComponentsData}

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Provide detailed, accurate technical guidance for electrical system repairs, component identification, wiring diagrams, and troubleshooting. Be concise but thorough, and always prioritize safety.`
      messageType = 'onboarding_problems'
    }

    // Build messages array for GPT-5.1
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt }
    ]

    // Add conversation history if exists
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        if (msg.role !== 'system') {
          messages.push({
            role: msg.role,
            content: msg.content
          })
        }
      })
    }

    // Call OpenAI GPT-5.1 Chat Completions API
    console.log('[API /chat/bench] Calling OpenAI GPT-5.1...')
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
      console.error('[API /chat/bench] OpenAI API error:', errorText)
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
    }

    const result = await openaiResponse.json()
    let assistantMessage = result.choices?.[0]?.message?.content || 'No response generated'
    const tokensUsed = result.usage?.total_tokens || null

    console.log('[API /chat/bench] GPT response received:', assistantMessage.substring(0, 100))

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
        console.log('[API /chat/bench] Parsed scene events:', sceneEvents)
        // Remove the scene-events block from the message
        assistantMessage = assistantMessage.replace(/```scene-events\n[\s\S]*?\n```/, '').trim()
      } catch (err) {
        console.error('[API /chat/bench] Failed to parse scene events:', err)
      }
    }

    // Check if onboarding is complete (user has provided problems and we've marked components)
    const onboardingComplete = !isFirstMessage && sceneEvents.some(
      (event: any) => event.type === 'mark_component_faulty'
    )

    return NextResponse.json({
      success: true,
      assistantMessage,
      sceneEvents,
      tokensUsed,
      messageType,
      onboardingComplete,
      vehicleInfo: null // TODO: Parse from first message if needed
    })

  } catch (error) {
    console.error('[API /chat/bench] Unhandled error:', error)
    console.error('[API /chat/bench] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
