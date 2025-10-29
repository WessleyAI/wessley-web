'use client'

import { TopNav } from './TopNav'
import { FloatingButtons } from './FloatingButtons'

interface AppShellProps {
  children: React.ReactNode
  onDashboardOpen?: () => void
}

export function AppShell({ children, onDashboardOpen }: AppShellProps) {
  return (
    <div className="min-h-screen bg-transparent font-sans antialiased">
      <TopNav onDashboardOpen={onDashboardOpen} />
      <main className="container mx-auto px-6">
        {children}
      </main>
      <FloatingButtons />
    </div>
  )
}