"use client"

import React, { useEffect, useContext, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '@/stores/chat-store'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ChatScene } from '@/components/3d/ChatScene'
import { ChatStarter } from './chat-starter'
import { WelcomeScreen } from '@/components/onboarding/welcome-screen'
import { getMessagesByChatId } from '@/db/messages'

interface BenchProps {
  chatId?: string
}

export function Bench({ chatId }: BenchProps) {
  const router = useRouter()
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    addConversation,
    setMessages,
    setUserInput,
    addMessage
  } = useChatStore()

  const {
    isOnboarding,
    currentStep,
    completeWelcome,
    startProblemsCollection,
    showWorkspaceAnimation
  } = useOnboardingStore()

  const [showWelcome, setShowWelcome] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

  // Check if first time visit (no chatId and no conversations) - show welcome
  useEffect(() => {
    if (!chatId && conversations.length === 0) {
      console.log('[Bench] First time visit - showing welcome screen')
      setShowWelcome(true)
    }
  }, [chatId, conversations.length])

  // Handle welcome completion - create demo workspace
  const handleWelcomeComplete = (carModel: string, nickname: string) => {
    console.log('[Bench] Welcome complete:', { carModel, nickname })

    // For demo, we use the existing model (2000 Hyundai Galloper)
    const demoCarModel = '2000 Hyundai Galloper 3.0L'
    const projectName = nickname || 'Project Galloper'

    completeWelcome(demoCarModel, projectName)
    setShowWelcome(false)
    setShowAnimation(true)

    // After animation, create initial chat and ask about problems
    setTimeout(() => {
      setShowAnimation(false)
      createProblemsChat(projectName)
    }, 3000) // Animation duration
  }

  // Create initial chat asking about problems
  const createProblemsChat = (projectName: string) => {
    const newConversation = {
      id: crypto.randomUUID(),
      title: projectName,
      user_id: 'demo-user',
      workspace_id: crypto.randomUUID(), // Demo workspace ID
      ai_model: 'gpt-4o',
      system_prompt: 'You are Wessley, an expert automotive electrical assistant helping diagnose vehicle problems.',
      context_data: { vehicle: '2000 Hyundai Galloper 3.0L' },
      is_active: true,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString()
    }

    addConversation(newConversation)
    setActiveConversation(newConversation)

    // Add AI's first message asking about problems
    const welcomeMessage = {
      id: crypto.randomUUID(),
      conversation_id: newConversation.id,
      content: `Great! I've created your workspace for the **${projectName}**.\n\nNow, tell me - what problems are you experiencing with your vehicle? I'll help you diagnose them and identify which components might be faulty.`,
      role: 'assistant' as const,
      user_id: null,
      ai_model: 'gpt-4o',
      attached_media_ids: null,
      metadata: { type: 'onboarding_problems' },
      created_at: new Date().toISOString(),
      ai_tokens_used: null,
      ai_confidence_score: null
    }

    setMessages([welcomeMessage])
    startProblemsCollection(newConversation.workspace_id!)

    // Navigate to the new chat
    router.push(`/c/${newConversation.id}`)
  }

  // Handle chat ID from URL
  useEffect(() => {
    if (chatId) {
      console.log('[Bench] Loading chat:', chatId)
      let conversation = conversations.find(c => c.id === chatId)

      if (!conversation) {
        // Create a new conversation with the provided ID
        conversation = {
          id: chatId,
          title: 'Vehicle Assistant Chat',
          user_id: 'demo-user', // TODO: Get from auth
          workspace_id: null,
          ai_model: 'gpt-4',
          system_prompt: 'You are an expert vehicle electrical assistant.',
          context_data: null,
          is_active: true,
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: null
        }

        addConversation(conversation)
      }

      setActiveConversation(conversation)

      // Load messages from database
      const loadMessages = async () => {
        try {
          // First clear old messages from previous chat
          setMessages([])

          console.log('[Bench] Loading messages for chat:', chatId)
          const messages = await getMessagesByChatId(chatId)
          console.log('[Bench] Loaded messages:', messages.length)
          setMessages(messages)
        } catch (error) {
          console.error('[Bench] Error loading messages:', error)
          // If no messages found (new chat), just set empty array
          setMessages([])
        }
      }

      loadMessages()
    }
  }, [chatId, conversations, addConversation, setActiveConversation, setMessages])

  const handleNewChat = (aiModel: string = 'gpt-4o') => {
    const newConversation = {
      id: crypto.randomUUID(),
      title: 'New Vehicle Chat',
      user_id: 'demo-user', // TODO: Get from auth
      workspace_id: null,
      ai_model: aiModel,
      system_prompt: 'You are an expert vehicle electrical assistant.',
      context_data: null,
      is_active: true,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: null
    }

    addConversation(newConversation)
    setActiveConversation(newConversation)

    // Navigate to the new chat URL
    router.push(`/c/${newConversation.id}`)
  }

  const handleQuickStart = (prompt: string, aiModel: string = 'gpt-4o') => {
    const newConversation = {
      id: crypto.randomUUID(),
      title: 'New Vehicle Chat',
      user_id: 'demo-user', // TODO: Get from auth
      workspace_id: null,
      ai_model: aiModel,
      system_prompt: 'You are an expert vehicle electrical assistant.',
      context_data: null,
      is_active: true,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: null
    }

    addConversation(newConversation)
    setActiveConversation(newConversation)
    setUserInput(prompt) // Pre-fill the input with the selected prompt

    // Navigate to the new chat URL
    router.push(`/c/${newConversation.id}`)
  }

  const renderMainContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={chatId || 'default'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full h-full"
        >
          <ChatInterface onNewChat={handleNewChat} onQuickStart={handleQuickStart} chatId={chatId} />
        </motion.div>
      </AnimatePresence>
    )
  }

  // Show welcome screen if first time
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />
  }

  // Show workspace entrance animation
  if (showAnimation) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto border-4 border-green-500 border-t-transparent rounded-full"
          />
          <h2 className="text-3xl font-bold text-white">Creating Your Workspace...</h2>
          <p className="text-gray-400">Setting up your vehicle's 3D electrical system</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full"
    >
      {renderMainContent()}
    </motion.div>
  )
}