'use client'

import React from 'react'
import { ChatMessage } from '@/stores/chat-store'
import { Button } from '@/components/ui/button'
import { 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw, 
  Share, 
  MoreHorizontal,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessagesProps {
  messages: ChatMessage[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  if (messages.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  if (isUser) {
    // User message - right aligned with rounded bubble
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%]">
          <div className="bg-[#2f2f2f] text-white rounded-2xl px-4 py-3 text-sm">
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Assistant message - left aligned with no bubble, includes toolbar
  return (
    <div className="flex flex-col space-y-3">
      <div className="text-white text-sm leading-relaxed">
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
      
      {/* Feedback Toolbar */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Copy"
        >
          <Copy className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Good response"
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Bad response"
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Regenerate"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          title="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}