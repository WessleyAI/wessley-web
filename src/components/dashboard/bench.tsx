"use client"

import React, { useEffect, useContext } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Dashboard } from '@/components/ui/dashboard'
import { useChatStore } from '@/stores/chat-store'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ChatScene } from '@/components/3d/ChatScene'
import { ChatStarter } from './chat-starter'

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
      setMessages([]) // Clear messages for this conversation
    }
  }, [chatId, conversations, addConversation, setActiveConversation, setMessages])

  const handleNewChat = () => {
    const newConversation = {
      id: crypto.randomUUID(),
      title: 'New Vehicle Chat',
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
    
    addConversation(newConversation)
    setActiveConversation(newConversation)
    
    // Navigate to the new chat URL
    router.push(`/c/${newConversation.id}`)
  }

  const handleQuickStart = (prompt: string) => {
    const newConversation = {
      id: crypto.randomUUID(),
      title: 'New Vehicle Chat',
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
    >
      <Dashboard>
        {renderMainContent()}
      </Dashboard>
    </motion.div>
  )
}