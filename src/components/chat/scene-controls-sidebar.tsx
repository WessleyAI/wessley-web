'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  IconList,
  IconHierarchy3,
  IconAlertTriangle,
  IconX,
  IconSettings,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ComponentTree } from '@/components/scene-explorer/component-tree'
import { ComponentList } from '@/components/scene-explorer/component-list'
import { ErrorList } from '@/components/scene-explorer/error-list'

interface SceneControlsSidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  isMinimized?: boolean
  onToggleMinimized?: () => void
}

type TabType = 'components' | 'tree' | 'faults'

export function SceneControlsSidebar({ isOpen, onClose, className, isMinimized = true, onToggleMinimized }: SceneControlsSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('components')

  const tabs = [
    { id: 'components' as TabType, label: 'Components', icon: IconList },
    { id: 'tree' as TabType, label: 'Tree', icon: IconHierarchy3 },
    { id: 'faults' as TabType, label: 'Faults', icon: IconAlertTriangle },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'components':
        return <ComponentList />
      case 'tree':
        return <ComponentTree />
      case 'faults':
        return <ErrorList />
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