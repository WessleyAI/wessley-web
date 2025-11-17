'use client'

import { Dashboard } from '@/components/ui/dashboard'
import '@/styles/app-design-system.css'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Dashboard>
      {children}
    </Dashboard>
  )
}
