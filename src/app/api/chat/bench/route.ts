import { NextRequest, NextResponse } from 'next/server'
import { getSceneComponentsForGPT } from '@/lib/scene-components-loader'

export async function POST(request: NextRequest) {

  try {
    const body = await request.json()

    const { userMessage, conversationHistory, isFirstMessage } = body


    if (!userMessage) {
      return NextResponse.json({ error: 'User message is required' }, { status: 400 })
    }

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('[API /chat/bench] OpenAI API key not found')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    // Load scene component data for GPT context
    const sceneComponentsData = await getSceneComponentsForGPT()

    // Build system prompt based on onboarding phase
    let systemPrompt = ''
    let messageType = ''

    // Count user messages in conversation history to determine onboarding step
    const userMessagesCount = conversationHistory?.filter((m: any) => m.role === 'user').length || 0

    if (isFirstMessage) {
      // Step 1: User just provided vehicle info → Ask for nickname
      systemPrompt = `You are Wessley, a friendly automotive electrical assistant helping users create workspaces for their vehicles.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ YOUR ROLE: Chatty Onboarding Assistant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are creating a workspace for the user's vehicle. Your job:
1. Extract the EXACT vehicle info from their message (year, make, model)
2. Repeat it back EXACTLY as they said it (don't change years or models)
3. Ask for a nickname

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The user's message: "${userMessage}"

Extract from this message:
- Year (if provided)
- Make (brand)
- Model

Then respond with:

"Got it! Working with a **[EXACT year make model from their message]**.

Do you have a nickname for it? Something like 'Blue Thunder', 'The Daily', or anything you call it?"

CRITICAL: Use the EXACT vehicle they mentioned. Do not hallucinate or change it.

Example:
User says: "2000 Hyundai Galloper"
You say: "Got it! Working with a **2000 Hyundai Galloper**."

User says: "1995 Honda Civic"
You say: "Got it! Working with a **1995 Honda Civic**."

DO NOT make up different years or models!`
      messageType = 'onboarding_vehicle_info'
    } else if (userMessagesCount === 1) {
      // Step 2: User just provided nickname → Create project and trigger animation
      const conversationContext = conversationHistory?.map((m: any) => `${m.role}: ${m.content}`).join('\n') || ''

      systemPrompt = `You are Wessley, a friendly automotive electrical assistant helping users create workspaces for their vehicles.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ YOUR ROLE: Workspace Creation Confirmation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The user just provided a nickname for their vehicle (or said they don't have one).
Their message: "${userMessage}"

Your job:
1. Acknowledge the nickname they provided (use EXACTLY what they said)
2. Announce you're creating their workspace
3. Keep it brief and enthusiastic

Conversation context:
${conversationContext}

Current user message: "${userMessage}"

Response format (if they gave a nickname):
"Love it! **[EXACT nickname they said]** it is!

Creating your workspace now... I'll have your [vehicle model]'s electrical system ready in just a moment."

Response format (if no nickname):
"No problem! We'll just call it **[Vehicle Model]**.

Creating your workspace now... I'll have the electrical system ready in just a moment."

CRITICAL:
- Use the EXACT nickname they provided
- Reference the correct vehicle from earlier messages
- Keep it very brief - workspace animation starts after this`
      messageType = 'onboarding_nickname'
    } else {
      // Subsequent messages: collect problems and mark faulty components
      systemPrompt = `You are Wessley, an expert automotive electrical assistant specializing in vehicle restoration projects.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ CRITICAL: THE USER JUST DESCRIBED THEIR PROBLEMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The user's CURRENT message contains the electrical problems they're experiencing.
DO NOT ask them to describe problems again - they ALREADY did in their message.
Your job: PROCESS the problems they just described and mark components as faulty.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
🚗 YOUR TASK: Process the problems from the user's message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The user just told you what's wrong. Now you must:
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
- Acknowledge what problems they described
- Confirm which components you've identified and marked as faulty in the 3D model
- Provide a brief explanation of what might be causing the issue
- Ask what they want to start diagnosing first
- Keep responses concise and action-oriented
- DO NOT ask them to describe problems - they already did

Example response:
"Got it — I've identified the issues:

**Windows not working:** I've marked the window actuators and their relays as potentially faulty.
**Left tail light intermittent:** I've marked the left tail light assembly and its relay.

These are now highlighted in red in the 3D model. The windows could be a wiring issue, bad actuators, or faulty relays. The tail light is likely a loose connection, bad bulb, or relay.

Which one would you like to start diagnosing first?"

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
        console.error('[API /chat/bench] Failed to parse scene events:', err)
      }
    }

    // Check if onboarding is complete (user has provided nickname - 2nd message)
    const onboardingComplete = messageType === 'onboarding_nickname'

    // Extract vehicle info and nickname for project creation
    let vehicleInfo = null
    if (onboardingComplete && conversationHistory && conversationHistory.length >= 2) {
      const firstUserMessage = conversationHistory.find((m: any) => m.role === 'user')?.content || ''
      const secondUserMessage = userMessage // Current message is the nickname


      vehicleInfo = {
        vehicleModel: firstUserMessage, // Raw vehicle description from user
        nickname: secondUserMessage, // Nickname from user
        extractedFromGPT: true
      }

    }

    const responseData = {
      success: true,
      assistantMessage,
      sceneEvents,
      tokensUsed,
      messageType,
      onboardingComplete,
      vehicleInfo
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('[API /chat/bench] Unhandled error:', error)
    console.error('[API /chat/bench] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
