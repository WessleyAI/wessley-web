'use client'

import { Suspense } from 'react'
import { Dashboard } from '@/components/ui/dashboard'
import { Bench } from '@/components/dashboard/bench'

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Dashboard>
        <Bench />
      </Dashboard>
    </Suspense>
  )
}