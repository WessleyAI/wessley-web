"use client"

import React, { useEffect, useContext } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '@/stores/chat-store'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ChatScene } from '@/components/3d/ChatScene'
import { ChatStarter } from './chat-starter'
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
    setUserInput
  } = useChatStore()

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