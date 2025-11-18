'use client'

import React, { useEffect, useRef } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { useModelStore } from '@/stores/model-store'
import { ChatMessages } from '@/components/chat/chat-messages'
import { BenchInput } from './bench-input'
import { HoverLabel } from '@/components/3d/HoverLabel'
import { ScrollArea } from '@/components/ui/scroll-area'

interface BenchChatInterfaceProps {
  className?: string
  onOnboardingComplete?: (vehicleInfo: any) => void
}

// Generate smart placeholder based on Wessley's question
function generatePlaceholder(lastAssistantMessage?: string): string {
  if (!lastAssistantMessage) return "Type your answer..."

  const lower = lastAssistantMessage.toLowerCase()

  // Check for vehicle model/brand/year question
  if (lower.includes('vehicle') && (lower.includes('model') || lower.includes('working with'))) {
    return "e.g., 2015 Honda Civic..."
  }

  // Check for nickname question
  if (lower.includes('nickname') || lower.includes('call')) {
    return "e.g., Blue Thunder, My Daily, etc..."
  }

  // Check for fault/problem question
  if (lower.includes('fault') || lower.includes('problem') || lower.includes('issue')) {
    return "e.g., tail lights not working, window stuck..."
  }

  // Default
  return "Type your answer..."
}

// Generate whimsical header based on conversation state
function generateHeader(messages: ChatMessage[]): string {
  const assistantMessages = messages.filter(m => m.role === 'assistant')

  // Keep simple header until after first question is answered (first 1-2 assistant messages)
  if (assistantMessages.length <= 1) {
    return "Hi! I'm Wessley."
  }

  // After first question answered - become whimsical based on current question
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]?.content
  if (!lastAssistantMessage) return "Hi! I'm Wessley."

  const lower = lastAssistantMessage.toLowerCase()

  // Check for vehicle model/brand/year question
  if (lower.includes('vehicle') && (lower.includes('model') || lower.includes('working with'))) {
    return "Hi! I'm Wessley. Tell me about your ride!"
  }

  // Check for nickname question
  if (lower.includes('nickname') || lower.includes('call')) {
    return "Hi! I'm Wessley. Let's give it a name!"
  }

  // Check for fault/problem question
  if (lower.includes('fault') || lower.includes('problem') || lower.includes('issue')) {
    return "Hi! I'm Wessley. What's troubling your vehicle?"
  }

  // Default whimsical
  return "Hi! I'm Wessley. Let's talk!"
}

export function BenchChatInterface({ className, onOnboardingComplete }: BenchChatInterfaceProps) {
  const {
    messages,
    isGenerating,
    addMessage,
    clearMessages
  } = useChatStore()

  const { setShowModels } = useModelStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  // Initialize bench mode - clear messages and add welcome
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      console.log('[BenchChatInterface] Initializing bench mode')

      // Hide models during onboarding
      setShowModels(false)

      // Clear any existing messages
      clearMessages()

      // Add welcome message (displays in header dynamically)
      const welcomeMessage = {
        id: crypto.randomUUID(),
        conversation_id: 'bench-local',
        content: "What vehicle are we working with today?",
        role: 'assistant' as const,
        user_id: null,
        ai_model: 'gpt-4',
        attached_media_ids: null,
        metadata: { benchMode: true, isWelcome: true },
        created_at: new Date().toISOString(),
        ai_tokens_used: null,
        ai_confidence_score: null
      }

      console.log('[BenchChatInterface] Adding welcome message:', welcomeMessage)
      addMessage(welcomeMessage)
    }

    // Cleanup: restore models when leaving bench
    return () => {
      console.log('[BenchChatInterface] Cleanup - restoring models')
      setShowModels(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Get last assistant message for dynamic placeholder
  const lastAssistantMessage = messages
    .filter(m => m.role === 'assistant')
    .slice(-1)[0]?.content

  const inputPlaceholder = generatePlaceholder(lastAssistantMessage)
  const headerText = generateHeader(messages)

  return (
    <div className={`flex-1 flex flex-col h-full app-bg-primary app-text-primary relative ${className}`}>
      {/* Content Layout - Input centered vertically, messages below */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl px-6 flex flex-col items-center">
          {/* Welcome Header */}
          <h1 className="app-h1 mb-6 text-center" style={{ color: 'var(--app-text-primary)', fontFamily: 'Space Grotesk, var(--app-font-heading)' }}>
            {headerText}
          </h1>

          {/* Bench Input - Centered in screen */}
          <div className="w-full mb-8">
            <BenchInput
              disabled={isGenerating}
              placeholder={inputPlaceholder}
              onOnboardingComplete={onOnboardingComplete}
            />
          </div>

          {/* Messages Area - Below Input */}
          <div className="w-full">
            <ScrollArea className="h-[40vh]">
              <ChatMessages messages={messages} />
              <div ref={messagesEndRef} />
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Hover label for 3D components */}
      <HoverLabel />
    </div>
  )
}
