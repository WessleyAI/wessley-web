'use client'

import React, { useState, useRef, KeyboardEvent } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { useModelStore } from '@/stores/model-store'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Plus, Mic } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SceneEvent } from '@/types/scene-events'

interface BenchInputProps {
  disabled?: boolean
  placeholder?: string
  onOnboardingComplete?: (vehicleInfo: any) => void
}

export function BenchInput({ disabled, placeholder = "Ask anything", onOnboardingComplete }: BenchInputProps) {
  const {
    isGenerating,
    setIsGenerating,
    addMessage,
    messages
  } = useChatStore()

  const { executeSceneEvent } = useModelStore()
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [localInput, setLocalInput] = useState('')

  const handleSubmit = async () => {
    if (!localInput.trim() || isGenerating || disabled) return

    const message = localInput.trim()
    setLocalInput('')
    setIsGenerating(true)

    // Determine if this is first user message (vehicle info)
    // Count user messages BEFORE adding the current one
    const userMessageCount = messages.filter(m => m.role === 'user').length
    const isFirstMessage = userMessageCount === 0

    try {
      // Add user message immediately (local only, no conversation_id)
      const userMessageId = crypto.randomUUID()
      addMessage({
        id: userMessageId,
        conversation_id: 'bench-local', // Temporary ID for bench mode
        content: message,
        role: 'user',
        user_id: user?.id ?? 'anonymous',
        ai_model: null,
        attached_media_ids: null,
        metadata: { benchMode: true },
        created_at: new Date().toISOString(),
        ai_tokens_used: null,
        ai_confidence_score: null
      })

      // Call API in bench mode (no database persistence)
      const response = await fetch('/api/chat/bench', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userMessage: message,
          conversationHistory: messages,
          isFirstMessage
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()

      // Add assistant message (local only)
      if (data.assistantMessage) {
        addMessage({
          id: crypto.randomUUID(),
          conversation_id: 'bench-local',
          content: data.assistantMessage,
          role: 'assistant',
          user_id: null,
          ai_model: 'gpt-5.1-chat-latest',
          attached_media_ids: null,
          metadata: {
            benchMode: true,
            type: data.messageType
          },
          created_at: new Date().toISOString(),
          ai_tokens_used: data.tokensUsed,
          ai_confidence_score: null
        })
      }

      // Dispatch scene events if any
      if (data.sceneEvents && Array.isArray(data.sceneEvents)) {
        data.sceneEvents.forEach((event: SceneEvent) => {
          executeSceneEvent(event)
        })
      }

      // If onboarding complete, notify parent
      if (data.onboardingComplete && onOnboardingComplete) {
        onOnboardingComplete(data.vehicleInfo)
      }

      setIsGenerating(false)
    } catch (error) {
      console.error('[BenchInput] Error sending message:', error)
      setIsGenerating(false)

      // Add error message
      addMessage({
        id: crypto.randomUUID(),
        conversation_id: 'bench-local',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        role: 'assistant',
        user_id: null,
        ai_model: 'gpt-5.1-chat-latest',
        attached_media_ids: null,
        metadata: { error: true, benchMode: true },
        created_at: new Date().toISOString(),
        ai_tokens_used: null,
        ai_confidence_score: null
      })
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalInput(e.target.value)
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 rounded-lg p-3" style={{ backgroundColor: 'var(--app-bg-tertiary)', border: '1px solid var(--app-border)' }}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-lg transition-colors app-text-muted"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--app-text-secondary)'
            e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--app-text-muted)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Input
          ref={inputRef}
          value={localInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isGenerating}
          className="flex-1 bg-transparent border-none app-text-primary app-fw-medium focus:ring-0 focus:border-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-0"
          style={{
            caretColor: 'var(--app-accent)'
          }}
        />

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-lg transition-colors app-text-muted"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--app-text-secondary)'
            e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--app-text-muted)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Mic className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-lg transition-colors app-text-muted"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--app-text-secondary)'
            e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--app-text-muted)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--app-text-muted)' }}></div>
            <div className="w-2 h-2 rounded-full ml-0.5" style={{ backgroundColor: 'var(--app-text-muted)' }}></div>
            <div className="w-2 h-2 rounded-full ml-0.5" style={{ backgroundColor: 'var(--app-text-muted)' }}></div>
          </div>
        </Button>
      </div>
    </div>
  )
}
