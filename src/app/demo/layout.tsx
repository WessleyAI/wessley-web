'use client'

import { Dashboard } from '@/components/ui/dashboard'
import '@/styles/demo-design-system.css'

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('='.repeat(80))
  console.log('[DemoLayout] 🎨 DEMO LAYOUT IS RENDERING!')
  console.log('='.repeat(80))

  if (typeof window !== 'undefined') {
    console.log('%c[DemoLayout] BROWSER: Demo layout rendering', 'background: #0f0; color: #000; font-size: 20px')
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
