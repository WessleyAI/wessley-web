'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useChatStore } from '@/stores/chat-store'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { ChatScene } from '@/components/3d/ChatScene'
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
  onNewChat?: () => void
  onQuickStart?: (prompt: string) => void
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
    onQuickStart(chatInput.trim())
    setChatInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartChat()
    }
  }

  return (
    <div className="flex h-full">
      <div className={`flex-1 flex flex-col h-full bg-[#2a2a2a] text-white relative ${className}`}
        style={{
          marginRight: showSceneControls ? (isSceneControlsMinimized ? '60px' : '320px') : '0px',
          transition: 'margin-right 0.3s ease-in-out'
        }}
      >
      {/* Top Bar with Model Selection - Floating above scene */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Select defaultValue="chatgpt5">
            <SelectTrigger className="w-[140px] bg-transparent border-none text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chatgpt5">ChatGPT 5</SelectItem>
              <SelectItem value="gpt4">GPT-4</SelectItem>
              <SelectItem value="claude35">Claude 3.5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
            title="User"
          >
            <IconUser className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
            title="Settings"
          >
            <IconSettings className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
            title="Scene Controls"
            onClick={() => {
              setShowSceneControls(true)
              setIsSceneControlsMinimized(false)
            }}
          >
            <IconMenu2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200 text-sm"
          >
            Share
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
          >
            •••
          </motion.button>
        </div>
      </div>

      {/* 3D Scene - Dynamic size based on conversation state */}
      <motion.div 
        className="flex justify-center"
        animate={{
          height: (activeConversation && messages.length > 0) || chatId ? "40vh" : "35vh",
          paddingTop: (activeConversation && messages.length > 0) || chatId ? "0px" : "16px",
          paddingBottom: (activeConversation && messages.length > 0) || chatId ? "0px" : "16px"
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
        </motion.div>
      </motion.div>

      {/* Content Layout - Changes based on conversation state */}
      {(!activeConversation || messages.length === 0) && !chatId ? (
        /* Initial State - Centered content */
        <div className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full px-6 py-6">
          {/* Question Header */}
          <div className="w-full text-center mb-6">
            <h1 className="text-2xl font-medium mb-2">What are we working on?</h1>
            <p className="text-gray-400 text-sm">Ask questions about your vehicle's electrical system</p>
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
                className="flex items-center gap-3 bg-[#3a3a3a] rounded-full p-4 border border-gray-600/20"
                whileHover={{ backgroundColor: "#404040" }}
                transition={{ duration: 0.2 }}
              >
                <motion.button 
                  onClick={handleStartChat}
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  className="p-1 rounded-md hover:bg-gray-600/50 transition-colors"
                >
                  <IconPlus className="w-5 h-5 text-gray-400 hover:text-gray-300" />
                </motion.button>
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything"
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 focus:border-none font-medium focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconMicrophone className="w-5 h-5 text-gray-400 hover:text-gray-300 transition-colors" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconPlayerRecord className="w-5 h-5 text-gray-400 hover:text-gray-300 transition-colors" />
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
    </div>
  )
}