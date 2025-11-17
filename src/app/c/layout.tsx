'use client'

import { Dashboard } from '@/components/ui/dashboard'
import '@/styles/demo-design-system.css'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Dashboard>
      <div className="demo-typography flex flex-col h-full">
        {children}
      </div>
    </Dashboard>
  )
}
