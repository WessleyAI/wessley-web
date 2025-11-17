'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useChatStore } from '@/stores/chat-store'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { ChatScene } from '@/components/3d/ChatScene'
import { SceneExplorer } from '@/components/scene-explorer/scene-explorer'
import { HoverLabel } from '@/components/3d/HoverLabel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconPlus,
  IconMicrophone,
  IconPlayerRecord,
  IconUser,
  IconSettings,
  IconMenu2
} from '@tabler/icons-react'
import { SceneControlsSidebar } from './scene-controls-sidebar'

interface ChatInterfaceProps {
  className?: string
  onNewChat?: (aiModel?: string) => void
  onQuickStart?: (prompt: string, aiModel?: string) => void
  chatId?: string
}

export function ChatInterface({ className, onNewChat, onQuickStart, chatId }: ChatInterfaceProps) {
  const {
    activeConversation,
    messages,
    isGenerating,
    setUserInput,
    userInput
  } = useChatStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatInput, setChatInput] = useState('')
  const [showSceneControls, setShowSceneControls] = useState(false)
  const [isSceneControlsMinimized, setIsSceneControlsMinimized] = useState(true)
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  
  // Auto-show scene controls in extended view
  const isExtendedView = (activeConversation && messages.length > 0) || !!chatId
  
  useEffect(() => {
    if (isExtendedView) {
      setShowSceneControls(true)
    }
  }, [isExtendedView])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])


  const handleStartChat = () => {
    if (!chatInput.trim() || !onQuickStart) return
    onQuickStart(chatInput.trim(), selectedModel)
    setChatInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartChat()
    }
  }

  return (
    <div className="flex h-full">
      <div className={`flex-1 flex flex-col h-full app-bg-primary app-text-primary relative ${className}`}
        style={{
          marginRight: showSceneControls ? (isSceneControlsMinimized ? '56px' : '320px') : '0px',
          transition: 'margin-right 0.3s ease-in-out'
        }}
      >
      {/* Top Bar - Floating above scene */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-end p-4">
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg app-text-secondary hover:app-text-primary transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="User"
          >
            <IconUser className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg app-text-secondary hover:app-text-primary transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Settings"
          >
            <IconSettings className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg app-text-secondary hover:app-text-primary transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Scene Controls"
            onClick={() => {
              setShowSceneControls(true)
              setIsSceneControlsMinimized(false)
            }}
          >
            <IconMenu2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-lg app-body-sm app-text-secondary hover:app-text-primary transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Share
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-lg app-text-secondary hover:app-text-primary transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            •••
          </motion.button>
        </div>
      </div>

      {/* 3D Scene - Dynamic size based on conversation state */}
      <motion.div
        className="flex justify-center px-6"
        animate={{
          height: (activeConversation && messages.length > 0) || chatId ? "56vh" : "49vh",
          paddingTop: (activeConversation && messages.length > 0) || chatId ? "24px" : "24px",
          paddingBottom: (activeConversation && messages.length > 0) || chatId ? "16px" : "16px"
        }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="overflow-hidden relative"
          animate={{
            width: (activeConversation && messages.length > 0) || chatId ? "100%" : "60%",
            borderRadius: (activeConversation && messages.length > 0) || chatId ? "8px" : "50%"
          }}
          transition={{ duration: 0.5 }}
        >
          <ChatScene isExtended={(activeConversation && messages.length > 0) || !!chatId} />
          {/* Scene Explorer Overlay */}
          <SceneExplorer />
        </motion.div>
      </motion.div>

      {/* Content Layout - Changes based on conversation state */}
      {(!activeConversation || messages.length === 0) && !chatId ? (
        /* Initial State - Centered content */
        <div className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full px-6 py-6">
          {/* Question Header */}
          <div className="w-full text-center mb-6">
            <h1 className="app-h3 mb-2">What are we working on?</h1>
            <p className="app-body-sm app-text-muted">Ask questions about your vehicle's electrical system</p>
          </div>

          {/* Chat Input - Centered */}
          <motion.div 
            className="w-full mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <motion.div
                className="flex items-center gap-3 rounded-lg p-4"
                style={{
                  backgroundColor: 'var(--app-bg-hover)',
                  border: '1px solid var(--app-border)'
                }}
                whileHover={{}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  onClick={handleStartChat}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 rounded-lg app-text-muted hover:app-text-secondary transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <IconPlus className="w-5 h-5" />
                </motion.button>
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything"
                  className="flex-1 bg-transparent border-none app-text-primary app-fw-medium focus:ring-0 focus:border-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ color: 'var(--app-text-primary)' }}
                />
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="app-text-muted hover:app-text-secondary transition-colors">
                  <IconMicrophone className="w-5 h-5" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="app-text-muted hover:app-text-secondary transition-colors">
                  <IconPlayerRecord className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      ) : (
        /* Active Chat State - Full layout */
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <ChatMessages messages={messages} />
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Chat Input - Bottom of page */}
          <div className="px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <ChatInput disabled={isGenerating} />
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Scene Controls Sidebar */}
      <SceneControlsSidebar
        isOpen={showSceneControls}
        onClose={() => setShowSceneControls(false)}
        isMinimized={isSceneControlsMinimized}
        onToggleMinimized={() => setIsSceneControlsMinimized(!isSceneControlsMinimized)}
      />

      {/* Hover label for 3D components */}
      <HoverLabel />
    </div>
  )
}