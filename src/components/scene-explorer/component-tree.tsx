'use client'

import { FC, useState } from 'react'
import { useModelStore, SceneNode } from '@/stores/model-store'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface TreeNodeProps {
  node: SceneNode
  depth?: number
  onNodeClick?: (nodeId: string) => void
}

const TreeNode: FC<TreeNodeProps> = ({ node, depth = 0, onNodeClick }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2) // Auto-expand first 2 levels
  const hasChildren = node.children && node.children.length > 0
  const { selectedComponentId } = useModelStore()
  const isSelected = selectedComponentId === node.id

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-accent/50 transition-colors ${
          isSelected ? 'bg-accent text-accent-foreground' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded)
          }
          onNodeClick?.(node.id)
        }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown size={14} className="flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="flex-shrink-0" />
          )
        ) : (
          <span className="w-[14px]" />
        )}
        <span className="text-xs truncate" title={node.name}>
          {node.name}
        </span>
        <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">
          {node.type}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const ComponentTree: FC = () => {
  const { sceneGraph, setSelectedComponent, focusOnComponent, components } = useModelStore()

  console.log('[ComponentTree] sceneGraph:', sceneGraph)

  const handleNodeClick = (nodeId: string) => {
    console.log('[ComponentTree] Node clicked:', nodeId)

    // Check if this is an actual component (not a zone node)
    const component = components.find(c => c.id === nodeId)
    if (component) {
      console.log('[ComponentTree] Focusing on component:', component.name)
      focusOnComponent(nodeId)
    } else {
      // Just select it if it's a zone node
      setSelectedComponent(nodeId)
    }
  }

  if (!sceneGraph) {
    console.log('[ComponentTree] No scene graph yet')
    return (
      <div className="p-3 text-xs">
        <div className="text-yellow-500 mb-2">DEBUG: No scene graph</div>
        <div className="text-muted-foreground">Loading scene graph...</div>
      </div>
    )
  }

  console.log('[ComponentTree] Rendering tree with', sceneGraph)
  return (
    <div className="p-2">
      <div className="text-xs text-green-500 mb-2">
        DEBUG: Scene graph loaded! Root: {sceneGraph.name} ({sceneGraph.children.length} children)
      </div>
      <TreeNode node={sceneGraph} onNodeClick={handleNodeClick} />
    </div>
  )
}