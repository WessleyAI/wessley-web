'use client'

import { useParams } from 'next/navigation'
import { Bench } from '@/components/dashboard/bench'

export default function ChatPage() {
  const params = useParams()
  const chatId = params['chat-id'] as string
  
  return <Bench chatId={chatId} />
}