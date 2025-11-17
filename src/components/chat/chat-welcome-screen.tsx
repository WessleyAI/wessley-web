"use client"

import { useState, useContext } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { IconPlus, IconMicrophone, IconPlayerRecord } from "@tabler/icons-react"
import { ChatbotUIContext } from "@/context/context"
import { createChat } from "@/db/chats"

export function ChatWelcomeScreen() {
  const router = useRouter()
  const { 
    profile, 
    setChats,
    setUserInput: setGlobalUserInput,
    setSelectedChat
  } = useContext(ChatbotUIContext)
  const [userInput, setUserInput] = useState("")

  const handleStartChat = async () => {
    if (!userInput.trim() || !profile) {
      console.log('Chat creation blocked:', { userInput: userInput.trim(), profile })
      return
    }
    
    console.log('Creating chat with profile:', profile)
    console.log('Profile user_id:', profile.user_id)
    
    try {
      console.log('About to call createChat with data:', {
        title: "New Chat",
        user_id: profile.user_id,
        workspace_id: null,
        ai_model: "gpt-4",
        system_prompt: null
      })
      
      // Create orphaned chat (not associated with any project/workspace)
      const newChat = await createChat({
        title: "New Chat", // Will be auto-named after first message
        user_id: profile.user_id,
        workspace_id: null, // Orphaned chat - will show under general "Chats" section
        ai_model: "gpt-4",
        system_prompt: null
      })
      
      console.log('createChat returned:', newChat)
      
      if (!newChat) {
        console.error('createChat returned null/undefined')
        return
      }
      
      // Add to chats list
      console.log('Adding chat to list...')
      setChats(prevChats => {
        console.log('Previous chats:', prevChats)
        const updated = [newChat, ...prevChats]
        console.log('Updated chats:', updated)
        return updated
      })
      
      // Set the selected chat in context
      setSelectedChat(newChat)
      
      // Set the user input for the chat
      setGlobalUserInput(userInput)
      
      // Navigate to the new chat
      console.log('Navigating to chat:', newChat.id)
      router.push(`/c/${newChat.id}`)
    } catch (error) {
      console.error('Error creating chat:', error)
      console.error('Error details:', error.message, error.code, error.details)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartChat()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full app-bg-tertiary px-6 py-12">
      {/* Title */}
      <motion.h1
        className="app-h1 app-text-primary mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Where should we begin?
      </motion.h1>

      {/* Chat Input */}
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="relative">
          <motion.div
            className="flex items-center gap-3 rounded-lg p-4"
            style={{
              backgroundColor: 'var(--app-bg-tertiary)',
              border: '1px solid var(--app-border)'
            }}
            whileHover={{ backgroundColor: 'var(--app-bg-hover)' }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={handleStartChat}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-lg transition-colors app-text-muted"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <IconPlus className="w-5 h-5" />
            </motion.button>

            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              className="flex-1 bg-transparent border-none app-text-primary app-fw-medium focus:ring-0 focus:border-none focus:outline-none text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ caretColor: 'var(--app-accent)' }}
              autoFocus
            />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="app-text-muted transition-colors"
            >
              <IconMicrophone className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="app-text-muted transition-colors"
            >
              <IconPlayerRecord className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Example prompts/suggestions */}
      <motion.div
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {[
          "Help me plan a project",
          "Explain a concept",
          "Write some code",
          "Analyze data"
        ].map((suggestion, index) => (
          <motion.button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="p-4 text-left rounded-lg transition-colors app-body-sm app-text-secondary"
            style={{
              backgroundColor: 'var(--app-bg-tertiary)',
              border: '1px solid var(--app-border)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--app-bg-tertiary)'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{suggestion}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}