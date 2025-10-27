"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Plus, Zap, Search, FileText, Wrench } from 'lucide-react'

interface ChatStarterProps {
  onNewChat: () => void
  onQuickStart?: (prompt: string) => void
}

const quickStarters = [
  {
    icon: Search,
    title: "Analyze Vehicle Wiring",
    description: "Upload photos to analyze electrical components",
    prompt: "Help me analyze the wiring in my vehicle's engine bay"
  },
  {
    icon: Wrench,
    title: "Troubleshoot Issue",
    description: "Get help diagnosing electrical problems",
    prompt: "My headlights aren't working, can you help me troubleshoot?"
  },
  {
    icon: FileText,
    title: "Explain Diagram",
    description: "Understand wiring diagrams and connections",
    prompt: "Can you explain how to read automotive wiring diagrams?"
  },
  {
    icon: Zap,
    title: "Component Guide",
    description: "Learn about electrical components",
    prompt: "What are the main electrical components in a vehicle?"
  }
]

export function ChatStarter({ onNewChat, onQuickStart }: ChatStarterProps) {
  const handleQuickStart = (prompt: string) => {
    if (onQuickStart) {
      onQuickStart(prompt)
    } else {
      onNewChat()
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Vehicle Assistant</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your expert automotive electrical assistant. Upload vehicle photos, analyze wiring diagrams, 
            and get help troubleshooting electrical issues.
          </p>
        </div>

        {/* Quick Start Button */}
        <div className="flex justify-center">
          <Button onClick={onNewChat} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Start New Conversation
          </Button>
        </div>

        {/* Quick Starters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {quickStarters.map((starter, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleQuickStart(starter.prompt)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <starter.icon className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{starter.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {starter.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            💡 Tip: You can upload images of your vehicle's electrical components for detailed analysis
          </p>
        </div>
      </div>
    </div>
  )
}