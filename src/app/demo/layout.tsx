'use client'

import { Suspense } from 'react'
import { Dashboard } from '@/components/ui/dashboard'
import '@/styles/demo-design-system.css'

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Dashboard>
        <div className="demo-typography flex flex-col h-full">
          {/* Main Content - Pages render here */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </Dashboard>
    </Suspense>
  )
}
