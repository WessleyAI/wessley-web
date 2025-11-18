'use client'

import { Dashboard } from '@/components/ui/dashboard'
import '@/styles/demo-design-system.css'

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {

  if (typeof window !== 'undefined') {
  }

  return (
    <Dashboard>
      <div className="demo-typography flex flex-col h-full">
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
