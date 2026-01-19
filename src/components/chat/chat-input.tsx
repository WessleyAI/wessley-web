'use client'

import React, { useState, useRef, KeyboardEvent } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { useModelStore } from '@/stores/model-store'
import { Button } from '@/components/ui/button'
import { Send, Loader2, Plus, Mic, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { SceneEvent } from '@/types/scene-events'

interface ChatInputProps {
  disabled?: boolean
  isWelcomeSetup?: boolean
}

export function ChatInput({ disabled, isWelcomeSetup }: ChatInputProps) {
  const {
    userInput,
    isGenerating,
    setUserInput,
    setIsGenerating,
    setAbortController,
    stopGeneration,
    activeConversation,
    addMessage
  } = useChatStore()

  const { executeSceneEvent } = useModelStore()

  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!userInput.trim() || isGenerating || disabled) return

    const message = userInput.trim()
    setUserInput('')
    setIsGenerating(true)

    // Create abort controller for this request
    const controller = new AbortController()
    setAbortController(controller)

    try {
      if (!activeConversation) return

      // Add user message immediately
      const userMessageId = crypto.randomUUID()
      addMessage({
        id: userMessageId,
        conversation_id: activeConversation.id,
        content: message,
        role: 'user',
        user_id: activeConversation.user_id,
        ai_model: null,
        attached_media_ids: null,
        metadata: null,
        created_at: new Date().toISOString(),
        ai_tokens_used: null,
        ai_confidence_score: null
      })

      // Call API to get assistant response
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId: activeConversation.id,
          userMessage: message,
          vehicle: activeConversation.context_data
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()

      // Add assistant message
      if (data.assistantMessage) {
        addMessage(data.assistantMessage)
      }

      // Dispatch scene events if any
      if (data.sceneEvents && Array.isArray(data.sceneEvents)) {
        data.sceneEvents.forEach((event: SceneEvent) => {
          executeSceneEvent(event)
        })
      }

      setIsGenerating(false)
      setAbortController(null)
    } catch (error) {
      // Don't show error for aborted requests
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('[ChatInput] Error sending message:', error)
      setIsGenerating(false)
      setAbortController(null)

      // Add error message
      addMessage({
        id: crypto.randomUUID(),
        conversation_id: activeConversation!.id,
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        role: 'assistant',
        user_id: null,
        ai_model: activeConversation!.ai_model,
        attached_media_ids: null,
        metadata: { error: true },
        created_at: new Date().toISOString(),
        ai_tokens_used: null,
        ai_confidence_score: null
      })
    }
  }

  const handleStop = () => {
    stopGeneration()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value)
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
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isWelcomeSetup ? "What vehicle model/brand/year are we working with?" : "Ask anything"}
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

        {isGenerating ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg transition-colors"
            onClick={handleStop}
            style={{
              color: 'var(--app-accent)',
              backgroundColor: 'rgba(139, 225, 150, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(139, 225, 150, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(139, 225, 150, 0.1)'
            }}
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg transition-colors"
            onClick={handleSubmit}
            disabled={!userInput.trim() || disabled}
            style={{
              color: userInput.trim() && !disabled ? 'var(--app-accent)' : 'var(--app-text-muted)',
              backgroundColor: userInput.trim() && !disabled ? 'rgba(139, 225, 150, 0.1)' : 'transparent'
            }}
            onMouseEnter={(e) => {
              if (userInput.trim() && !disabled) {
                e.currentTarget.style.backgroundColor = 'rgba(139, 225, 150, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = userInput.trim() && !disabled ? 'rgba(139, 225, 150, 0.1)' : 'transparent'
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}