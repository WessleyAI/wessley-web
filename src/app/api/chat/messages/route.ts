import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createMessage } from '@/db/messages'

export async function POST(request: NextRequest) {
  try {
    const { chatId, userMessage, vehicle } = await request.json()

    if (!chatId || !userMessage) {
      return NextResponse.json({ error: 'Chat ID and user message are required' }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('OpenAI API key not found')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    // Save user message to database
    const userMessageRecord = await createMessage({
      chat_id: chatId,
      user_id: user.id,
      content: userMessage,
      role: 'user',
      ai_model: 'gpt-5.1-chat-latest'
    })

    // Build system context for vehicle restoration
    const systemPrompt = vehicle
      ? `You are an expert automotive electrical assistant specializing in vehicle restoration projects. You are currently helping with a ${vehicle.make} ${vehicle.model} ${vehicle.year}. Provide detailed, accurate technical guidance for electrical system repairs, component identification, wiring diagrams, and troubleshooting. Be concise but thorough, and always prioritize safety.`
      : `You are an expert automotive electrical assistant specializing in vehicle restoration projects. Provide detailed, accurate technical guidance for electrical system repairs, component identification, wiring diagrams, and troubleshooting. Be concise but thorough, and always prioritize safety.`

    // Get conversation history
    const { data: previousMessages } = await supabase
      .from('messages')
      .select('content, role')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(20) // Last 20 messages for context

    // Build messages array for GPT-5.1
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt }
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
        reasoning_effort: 'none', // Low-latency for GPT-5.1
        prompt_cache_retention: '24h', // Enable caching
        max_tokens: 1500,
        temperature: 0.7,
        stream: false // Set to true for streaming implementation
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
    }

    const result = await openaiResponse.json()
    const assistantMessage = result.choices?.[0]?.message?.content || 'No response generated'
    const tokensUsed = result.usage?.total_tokens || null

    // Save assistant message to database
    const assistantMessageRecord = await createMessage({
      chat_id: chatId,
      user_id: null, // AI message
      content: assistantMessage,
      role: 'assistant',
      ai_model: 'gpt-5.1-chat-latest',
      ai_tokens_used: tokensUsed
    })

    // Update chat's last_message_at
    await supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId)

    return NextResponse.json({
      success: true,
      userMessage: userMessageRecord,
      assistantMessage: assistantMessageRecord,
      tokensUsed
    })

  } catch (error) {
    console.error('Chat message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
