'use client'

import { Suspense } from 'react'
import { Bench } from '@/components/dashboard/bench'

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Bench />
    </Suspense>
  )
}