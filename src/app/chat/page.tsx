'use client'

import { Suspense } from 'react'
import { Dashboard } from '@/components/ui/dashboard'
import { Bench } from '@/components/dashboard/bench'

export default function ChatPage() {
  return (
    <Dashboard>
      <Suspense fallback={<div>Loading...</div>}>
        <Bench />
      </Suspense>
    </Dashboard>
  )
}