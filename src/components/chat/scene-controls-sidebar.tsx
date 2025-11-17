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
      initial={{ width: 0 }}
      animate={{
        width: isMinimized ? '56px' : '320px'
      }}
      exit={{ width: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        "shrink-0 h-full flex flex-col overflow-hidden",
        className
      )}
      style={{
        backgroundColor: 'var(--app-bg-secondary)',
        borderLeft: '1px solid var(--app-border)'
      }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center p-4",
        isMinimized ? "justify-center" : "justify-between"
      )}>
        {!isMinimized && <h2 className="app-h6 app-text-primary">Scene Controls</h2>}
        <div className="flex items-center gap-1">
          {onToggleMinimized && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimized}
              className="h-8 w-8 p-0 app-text-muted hover:app-text-primary hover:bg-[var(--app-bg-hover)] transition-all duration-200"
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
                    "h-10 w-10 p-0 relative z-10 rounded-lg transition-all duration-200"
                  )}
                  style={{
                    color: activeTab === tab.id ? 'var(--app-text-primary)' : 'var(--app-text-secondary)',
                    backgroundColor: activeTab === tab.id ? 'var(--app-bg-hover)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'
                      e.currentTarget.style.color = 'var(--app-text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--app-text-secondary)'
                    }
                  }}
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
        <div className="flex" style={{ borderBottom: '1px solid var(--app-border)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center gap-1 p-3 app-caption app-fw-medium transition-colors"
                style={{
                  color: activeTab === tab.id ? 'var(--app-accent)' : 'var(--app-text-secondary)',
                  backgroundColor: activeTab === tab.id ? 'var(--app-accent-subtle)' : 'transparent',
                  borderBottom: activeTab === tab.id ? '2px solid var(--app-accent)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = 'var(--app-text-primary)'
                    e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = 'var(--app-text-secondary)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
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
        <div className="p-4" style={{ borderTop: '1px solid var(--app-border)' }}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-9 px-3 app-body-sm app-text-secondary transition-all duration-200"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'
              e.currentTarget.style.color = 'var(--app-text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--app-text-secondary)'
            }}
          >
            <IconSettings size={16} className="mr-3" />
            Scene Settings
          </Button>
        </div>
      )}
    </motion.div>
  )
}