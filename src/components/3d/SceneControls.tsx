'use client'

import { useModelStore } from '@/stores/model-store'
import { Eye, EyeOff, Sparkles, Box } from 'lucide-react'

/**
 * Scene Controls - Toggles for chassis and effects visibility
 */
export function SceneControls() {
  const { showChassis, showEffects, showModels, setShowChassis, setShowEffects } = useModelStore()

  // Don't show controls if models aren't loaded yet
  if (!showModels) return null

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-row gap-2">
      {/* Chassis Toggle */}
      <button
        onClick={() => setShowChassis(!showChassis)}
        className={`
          group relative flex items-center gap-2 px-3 py-2 rounded-lg
          backdrop-blur-md transition-all duration-200
          ${showChassis
            ? 'bg-white/10 hover:bg-white/15 text-white'
            : 'bg-black/30 hover:bg-black/40 text-white/50'
          }
        `}
        title={showChassis ? 'Hide Chassis' : 'Show Chassis'}
      >
        <Box className="w-4 h-4" />
        <span className="text-sm font-medium">Chassis</span>
        {showChassis ? (
          <Eye className="w-4 h-4 opacity-70" />
        ) : (
          <EyeOff className="w-4 h-4 opacity-50" />
        )}
      </button>

      {/* Effects Toggle */}
      <button
        onClick={() => setShowEffects(!showEffects)}
        className={`
          group relative flex items-center gap-2 px-3 py-2 rounded-lg
          backdrop-blur-md transition-all duration-200
          ${showEffects
            ? 'bg-white/10 hover:bg-white/15 text-white'
            : 'bg-black/30 hover:bg-black/40 text-white/50'
          }
        `}
        title={showEffects ? 'Hide Effects' : 'Show Effects'}
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">Effects</span>
        {showEffects ? (
          <Eye className="w-4 h-4 opacity-70" />
        ) : (
          <EyeOff className="w-4 h-4 opacity-50" />
        )}
      </button>
    </div>
  )
}
