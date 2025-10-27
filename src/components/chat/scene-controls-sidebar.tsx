'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  IconList, 
  IconHierarchy3, 
  IconAlertTriangle,
  IconX,
  IconSettings,
  IconEye,
  IconEyeOff,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface SceneControlsSidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  isMinimized?: boolean
  onToggleMinimized?: () => void
}

type TabType = 'components' | 'tree' | 'faults'

// Mock data for demonstration
const mockComponents = [
  { id: '1', name: 'Main Battery', type: 'Battery', visible: true, status: 'normal' },
  { id: '2', name: 'Alternator', type: 'Generator', visible: true, status: 'normal' },
  { id: '3', name: 'Starter Motor', type: 'Motor', visible: true, status: 'warning' },
  { id: '4', name: 'Headlight (Left)', type: 'Light', visible: false, status: 'normal' },
  { id: '5', name: 'Headlight (Right)', type: 'Light', visible: true, status: 'error' },
  { id: '6', name: 'ECU', type: 'Computer', visible: true, status: 'normal' },
]

const mockFaults = [
  { id: '1', component: 'Headlight (Right)', severity: 'high', message: 'Bulb burned out', code: 'H001' },
  { id: '2', component: 'Starter Motor', severity: 'medium', message: 'High resistance detected', code: 'S003' },
  { id: '3', component: 'Wire Harness', severity: 'low', message: 'Insulation wear', code: 'W015' },
]

export function SceneControlsSidebar({ isOpen, onClose, className, isMinimized = true, onToggleMinimized }: SceneControlsSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('components')

  const tabs = [
    { id: 'components' as TabType, label: 'Components', icon: IconList },
    { id: 'tree' as TabType, label: 'Tree', icon: IconHierarchy3 },
    { id: 'faults' as TabType, label: 'Faults', icon: IconAlertTriangle },
  ]

  const renderComponentsList = () => (
    <div className="space-y-1">
      {mockComponents.map((component) => (
        <Button
          key={component.id}
          variant="ghost"
          className="w-full justify-start h-auto p-3 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className={cn(
              "w-3 h-3 rounded-full flex-shrink-0",
              component.status === 'normal' && "bg-green-500",
              component.status === 'warning' && "bg-yellow-500",
              component.status === 'error' && "bg-red-500"
            )} />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{component.name}</div>
              <div className="text-xs text-white/60">{component.type}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation()
                /* Toggle visibility */
              }}
            >
              {component.visible ? (
                <IconEye className="h-3 w-3" />
              ) : (
                <IconEyeOff className="h-3 w-3" />
              )}
            </Button>
          </div>
        </Button>
      ))}
    </div>
  )

  const renderComponentTree = () => (
    <div className="space-y-1">
      <div className="text-sm font-medium text-white/90 mb-3 px-2">Electrical System</div>
      <div className="space-y-1">
        <Button variant="ghost" className="w-full justify-start h-8 px-2 text-white/80 hover:bg-white/10 hover:text-white">
          <span className="pl-2">🔋 Power System</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start h-7 px-2 text-white/60 hover:bg-white/10 hover:text-white text-xs">
          <span className="pl-6">• Main Battery</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start h-7 px-2 text-white/60 hover:bg-white/10 hover:text-white text-xs">
          <span className="pl-6">• Alternator</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start h-8 px-2 text-white/80 hover:bg-white/10 hover:text-white">
          <span className="pl-2">🚗 Engine</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start h-7 px-2 text-white/60 hover:bg-white/10 hover:text-white text-xs">
          <span className="pl-6">• Starter Motor</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start h-7 px-2 text-white/60 hover:bg-white/10 hover:text-white text-xs">
          <span className="pl-6">• ECU</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start h-8 px-2 text-white/80 hover:bg-white/10 hover:text-white">
          <span className="pl-2">💡 Lighting</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start h-7 px-2 text-white/60 hover:bg-white/10 hover:text-white text-xs">
          <span className="pl-6">• Headlight (Left)</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start h-7 px-2 text-white/60 hover:bg-white/10 hover:text-white text-xs">
          <span className="pl-6">• Headlight (Right)</span>
        </Button>
      </div>
    </div>
  )

  const renderFaultsList = () => (
    <div className="space-y-1">
      {mockFaults.map((fault) => (
        <Button
          key={fault.id}
          variant="ghost"
          className="w-full justify-start h-auto p-3 text-white/80 hover:bg-white/10 hover:text-white border-l-2 border-l-red-500/50 transition-all duration-200"
        >
          <div className="flex items-start justify-between w-full">
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{fault.component}</div>
              <div className="text-xs text-white/60 mt-1">{fault.message}</div>
              <div className="text-xs text-white/40 mt-1">Code: {fault.code}</div>
            </div>
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2",
              fault.severity === 'high' && "bg-red-500/20 text-red-400",
              fault.severity === 'medium' && "bg-yellow-500/20 text-yellow-400",
              fault.severity === 'low' && "bg-blue-500/20 text-blue-400"
            )}>
              {fault.severity}
            </div>
          </div>
        </Button>
      ))}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'components':
        return renderComponentsList()
      case 'tree':
        return renderComponentTree()
      case 'faults':
        return renderFaultsList()
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ 
        x: 0,
        width: isMinimized ? '60px' : '320px'
      }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed top-0 right-0 h-full z-50 flex flex-col",
        className
      )}
      style={{
        backgroundColor: '#0f0f0f' // Slightly brighter than left sidebar's #090909
      }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center p-4",
        isMinimized ? "justify-center" : "justify-between"
      )}>
        {!isMinimized && <h2 className="text-lg font-semibold text-white/90">Scene Controls</h2>}
        <div className="flex items-center gap-1">
          {onToggleMinimized && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimized}
              className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? (
                <IconChevronLeft className="h-4 w-4" />
              ) : (
                <IconChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      {isMinimized ? (
        /* Minimized: Vertical icon stack with tooltips */
        <div className="space-y-2 p-2 overflow-visible">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <div key={tab.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "h-10 w-10 p-0 text-white/80 hover:bg-white/10 hover:text-white relative z-10 rounded-lg transition-all duration-200",
                    activeTab === tab.id ? "bg-white/10 text-white" : ""
                  )}
                  title={tab.label}
                >
                  <Icon size={20} />
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        /* Expanded: Horizontal tabs */
        <div className="flex border-b border-gray-600/20">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 p-3 text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "text-blue-400 bg-blue-500/10 border-b-2 border-blue-400"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {renderTabContent()}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Footer */}
      {!isMinimized && (
        <div className="p-4 border-t border-gray-600/20">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-9 px-3 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <IconSettings size={16} className="mr-3" />
            Scene Settings
          </Button>
        </div>
      )}
    </motion.div>
  )
}