'use client'

import React from 'react'
import { useChatStore } from '@/stores/chat-store'
import { Button } from '@/components/ui/button'
import { MessageCircle, Settings } from 'lucide-react'

export function ChatHeader() {
  const { activeConversation } = useChatStore()

  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold truncate">
          {activeConversation?.title}
        </h2>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}