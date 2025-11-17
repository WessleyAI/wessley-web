'use client'

import { FC, useState, useMemo } from 'react'
import { useModelStore } from '@/stores/model-store'
import { Search } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  fuse: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  relay: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  sensor: 'bg-green-500/20 text-green-700 dark:text-green-300',
  connector: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  wire: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
  module: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
  other: 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
}

export const ComponentList: FC = () => {
  const { components, selectedComponentId, setSelectedComponent, focusOnComponent } = useModelStore()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return components
    const query = searchQuery.toLowerCase()
    return components.filter(comp =>
      comp.name.toLowerCase().includes(query) ||
      comp.type.toLowerCase().includes(query)
    )
  }, [components, searchQuery])

  if (components.length === 0) {
    return (
      <div className="p-3 text-xs">
        <div className="text-yellow-500 mb-2">DEBUG: No components (count: {components.length})</div>
        <div className="text-muted-foreground">No components found. Loading model...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Debug Info */}
      <div className="p-2 border-b bg-green-500/10">
        <div className="text-xs text-green-500">
          DEBUG: {components.length} components loaded
        </div>
      </div>

      {/* Search bar */}
      <div className="p-2 border-b">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-xs bg-background border rounded focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredComponents.map((component) => (
          <div
            key={component.id}
            className={`p-2 rounded cursor-pointer hover:bg-accent/50 transition-colors ${
              selectedComponentId === component.id ? 'bg-accent text-accent-foreground' : ''
            }`}
            onClick={() => {
              console.log('[ComponentList] Focusing on:', component.name)
              focusOnComponent(component.id)
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs truncate font-medium" title={component.name}>
                {component.name}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_COLORS[component.type]}`}>
                {component.type}
              </span>
            </div>
            {component.position && (
              <div className="text-[10px] text-muted-foreground mt-1">
                Position: ({component.position[0].toFixed(2)}, {component.position[1].toFixed(2)}, {component.position[2].toFixed(2)})
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Results count */}
      <div className="p-2 border-t text-[10px] text-muted-foreground">
        {filteredComponents.length} / {components.length} components
      </div>
    </div>
  )
}