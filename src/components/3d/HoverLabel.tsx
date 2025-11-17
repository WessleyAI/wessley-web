'use client'

import { useEffect, useState } from 'react'
import { useModelStore } from '@/stores/model-store'
import { motion, AnimatePresence } from 'framer-motion'

export function HoverLabel() {
  const { hoveredComponentId, components } = useModelStore()
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const hoveredComponent = components.find(c => c.id === hoveredComponentId)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (!hoveredComponent) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className="fixed pointer-events-none z-[1000]"
        style={{
          left: position.x + 15,
          top: position.y + 15,
        }}
      >
        <div className="bg-black/90 text-white px-3 py-2 rounded-md border border-blue-400/50 shadow-lg max-w-[250px]">
          <h4 className="text-blue-400 text-sm font-semibold mb-1">
            {hoveredComponent.name}
          </h4>
          {hoveredComponent.description && (
            <div className="text-gray-300 text-xs mb-1">
              {hoveredComponent.description}
            </div>
          )}
          {hoveredComponent.specifications?.anchor_zone && (
            <div className="text-gray-400 text-xs">
              Zone: {hoveredComponent.specifications.anchor_zone}
            </div>
          )}
          {hoveredComponent.specifications?.voltage && (
            <div className="text-gray-400 text-xs">
              Voltage: {hoveredComponent.specifications.voltage}
            </div>
          )}
          {hoveredComponent.position && (
            <div className="text-gray-500 text-[10px] mt-1 font-mono">
              ({hoveredComponent.position[0].toFixed(2)}, {hoveredComponent.position[1].toFixed(2)}, {hoveredComponent.position[2].toFixed(2)})
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
