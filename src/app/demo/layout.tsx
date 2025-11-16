'use client'

import { Dashboard } from '@/components/ui/dashboard'
import { ChatHeader } from '@/components/chat/chat-header'

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Dashboard>
      <div className="flex flex-col h-full">
        {/* Header - Model selector, user, settings, share */}
        <ChatHeader />

        {/* Main Content - Pages render here */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Footer - if needed in future */}
        {/* <ChatFooter /> */}
      </div>
    </Dashboard>
  )
}
