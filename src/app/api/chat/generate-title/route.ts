import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userMessage, assistantMessage } = await request.json()

    if (!userMessage) {
      return NextResponse.json({ error: 'User message is required' }, { status: 400 })
    }

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('OpenAI API key not found')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    // Call OpenAI API to generate a title
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates concise, contextual titles for vehicle restoration project chat conversations. The title should be 3-6 words long and capture the main topic or intent related to the vehicle project. Return only the title, no quotes or extra text.'
          },
          {
            role: 'user',
            content: `Generate a short, contextful title for this vehicle restoration conversation:

User: ${userMessage}
Assistant: ${assistantMessage || 'No response yet'}`
          }
        ],
        max_tokens: 25,
        temperature: 0.7
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      return NextResponse.json({ error: 'Failed to generate title' }, { status: 500 })
    }

    const result = await openaiResponse.json()
    const title = result.choices?.[0]?.message?.content?.trim() || userMessage.substring(0, 50)
    
    return NextResponse.json({ 
      title: title,
      success: true 
    })

  } catch (error) {
    console.error('Title generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}