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
  const { components, selectedComponentId, highlightedComponentIds, setSelectedComponent, focusOnComponent } = useModelStore()
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
      <div className="p-3 text-xs text-muted-foreground">
        No components found. Loading model...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
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
        {filteredComponents.map((component) => {
          const isSelected = selectedComponentId === component.id
          const isHighlighted = highlightedComponentIds.includes(component.id)

          return (
            <div
              key={component.id}
              className="p-2 rounded-lg cursor-pointer transition-colors"
              style={{
                backgroundColor: isSelected
                  ? 'var(--app-accent)'
                  : isHighlighted
                    ? 'rgba(139, 225, 150, 0.2)'
                    : 'transparent',
                color: isSelected ? '#000000' : 'var(--app-text-primary)',
                border: isHighlighted && !isSelected ? '1px solid var(--app-accent)' : '1px solid transparent',
                boxShadow: isSelected ? '0 0 15px rgba(139, 225, 150, 0.4), inset 0 0 10px rgba(139, 225, 150, 0.2)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isHighlighted) {
                  e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isHighlighted) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
              onClick={() => focusOnComponent(component.id)}
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
                <div className="text-[10px] mt-1" style={{ color: isSelected ? '#00000080' : 'var(--app-text-muted)' }}>
                  Position: ({component.position[0].toFixed(2)}, {component.position[1].toFixed(2)}, {component.position[2].toFixed(2)})
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Results count */}
      <div className="p-2 border-t text-[10px] text-muted-foreground">
        {filteredComponents.length} / {components.length} components
      </div>
    </div>
  )
}