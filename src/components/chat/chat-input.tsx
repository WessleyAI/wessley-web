'use client'

import React, { useState, useRef, KeyboardEvent } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { Button } from '@/components/ui/button'
import { Send, Loader2, Plus, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface ChatInputProps {
  disabled?: boolean
}

export function ChatInput({ disabled }: ChatInputProps) {
  const { 
    userInput, 
    isGenerating, 
    setUserInput, 
    setIsGenerating,
    activeConversation,
    addMessage
  } = useChatStore()
  
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!userInput.trim() || isGenerating || disabled) return
    
    const message = userInput.trim()
    setUserInput('')
    setIsGenerating(true)
    
    try {
      // Add user message
      if (activeConversation) {
        addMessage({
          id: crypto.randomUUID(),
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
        
        // TODO: Call API to get assistant response
        // For now, add a placeholder response
        setTimeout(() => {
          addMessage({
            id: crypto.randomUUID(),
            conversation_id: activeConversation.id,
            content: "I'm a vehicle electrical assistant. I can help you understand wiring diagrams, troubleshoot electrical issues, and answer questions about automotive electrical systems. What would you like to know?",
            role: 'assistant',
            user_id: null,
            ai_model: 'gpt-4',
            attached_media_ids: null,
            metadata: null,
            created_at: new Date().toISOString(),
            ai_tokens_used: 150,
            ai_confidence_score: 0.95
          })
          setIsGenerating(false)
        }, 1000)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsGenerating(false)
    }
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
          placeholder="Ask anything"
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