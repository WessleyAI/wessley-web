'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Sparkles, Filter, SortAsc, Wrench, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { PartsMasonryGrid } from './parts-masonry-grid'
import { CarData } from './car-selector'
import { ComparisonDrawer } from './comparison-drawer'
import { toast } from 'sonner'
import Image from 'next/image'

type UrgencyLevel = 'urgent' | 'soon' | 'optional'
type Priority = 'high' | 'medium' | 'low'

interface RestorationSupply {
  name: string
  price: number
  selected: boolean
}

interface Part {
  id: string
  name: string
  urgency: UrgencyLevel
  priority: Priority
  aiVerified: boolean
  priceRange: string
  topPrice: string
  sellerName: string
  sellerInitials: string
  sellerRating: number
  sellerDistance: string
  sellerCount: number
  imageUrl?: string
  restorationSupplies?: RestorationSupply[]
}

interface BuySectionProps {
  parts: Part[]
  onPartsChange: (parts: Part[]) => void
  cars: CarData[]
  selectedItems: Set<string>
  onToggleItem: (itemId: string) => void
}

const aiDiagnoses = [
  { id: 'overheating', label: 'Overheating Issues', severity: 'urgent', relatedParts: ['Radiator'] },
  { id: 'charging issues', label: 'Charging Problems', severity: 'urgent', relatedParts: ['Alternator'] },
  { id: 'brake wear', label: 'Brake Wear Detected', severity: 'soon', relatedParts: ['Brake Pads'] },
  { id: 'stuff you asked to add', label: 'Recommended Maintenance', severity: 'optional', relatedParts: ['Oil Filter', 'Spark Plugs', 'Fuel Relay'] },
]

export function BuySection({ parts, onPartsChange, cars, selectedItems, onToggleItem }: BuySectionProps) {
  const [hoveredDiagnosis, setHoveredDiagnosis] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonPart, setComparisonPart] = useState('')
  const [sortBy, setSortBy] = useState<'urgency' | 'price'>('urgency')
  const cartTotal = Array.from(selectedItems).reduce((total, id) => {
    const part = parts.find(p => p.id === id)
    if (!part) return total
    const partPrice = parseFloat(part.topPrice.replace('$', ''))
    const suppliesTotal = part.restorationSupplies?.reduce((sum, supply) =>
      supply.selected ? sum + supply.price : sum, 0) || 0
    return total + partPrice + suppliesTotal
  }, 0)

  const handleCompare = (partName: string) => {
    setComparisonPart(partName)
    setShowComparison(true)
    toast.info('Comparing offers', {
      description: `Finding best deals for ${partName}`,
    })
  }

  const tools = [
    { id: 'obd2', label: 'OBD2 Scanner' },
    { id: 'multimeter', label: 'Multimeter' },
    { id: 'compression', label: 'Compression Tester' },
    { id: 'torque', label: 'Torque Wrench' },
    { id: 'socket', label: 'Socket Set' },
    { id: 'fuel', label: 'Fuel Pressure Gauge' },
  ]

  const suggestedPrompts = [
    'Why are these parts urgent?',
    'Compare alternator prices',
    'Show me installation difficulty',
  ]

  return (
    <div className="relative w-full">
      {/* Mobile Simplified View - Direct and Actionable */}
      <div className="block lg:hidden">
        <div className="bg-[#1a1a1a] border border-[#808080]/30 rounded-xl p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-[#8BE196] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white mb-1" style={{ fontSize: 'clamp(0.875rem, 3.5vw, 1rem)' }}>
                  Wessley noticed you have several issues with your car
                </h4>
                <p className="text-[#C4C4C4]" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}>
                  For your <span className="text-[#8BE196] font-medium">2000 Hyundai Galloper</span>, these are the exact parts you need:
                </p>
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-2">
              {aiDiagnoses.slice(0, 3).map((diagnosis, idx) => {
                const partSerials = {
                  'overheating': { part: 'Radiator', serial: 'BEHR 8MK-376-713-721', tools: 'Wrench Set, Drain Pan, Coolant' },
                  'charging issues': { part: 'Alternator', serial: 'BOSCH 0-123-520-017', tools: '13mm Socket, Multimeter, Belt' },
                  'brake wear': { part: 'Brake Pads (Front)', serial: 'AKEBONO ACT-914', tools: 'C-Clamp, Socket Set, Jack' },
                }
                const info = partSerials[diagnosis.id as keyof typeof partSerials] || { part: diagnosis.relatedParts[0], serial: 'OEM-' + Math.random().toString(36).substr(2, 9).toUpperCase(), tools: 'Basic Tools' }

                return (
                  <div key={diagnosis.id} className="bg-[#161616] border border-[#808080]/20 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white font-medium" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}>
                        {diagnosis.label}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        diagnosis.severity === 'urgent' ? 'bg-[#ff6b6b]/20 text-[#ff6b6b]' :
                        diagnosis.severity === 'soon' ? 'bg-[#ffa726]/20 text-[#ffa726]' :
                        'bg-[#808080]/20 text-[#808080]'
                      }`} style={{ fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)' }}>
                        {diagnosis.severity}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[#8BE196] font-medium" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.8125rem)' }}>
                        {info.part}
                      </p>
                      <p className="text-[#C4C4C4]/70 font-mono" style={{ fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)' }}>
                        Part #: {info.serial}
                      </p>
                      <p className="text-[#C4C4C4]/70" style={{ fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)' }}>
                        Tools: {info.tools}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA */}
            <motion.button
              className="w-full bg-[#8BE196] hover:bg-[#9DF4A8] text-[#000000] font-semibold rounded-lg py-2.5 px-4 transition-colors"
              style={{ fontSize: 'clamp(0.8125rem, 2.75vw, 0.9375rem)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Should we order these for you?
            </motion.button>

            {/* Total estimated */}
            <p className="text-center text-[#C4C4C4]/60" style={{ fontSize: 'clamp(0.6875rem, 2.25vw, 0.8125rem)' }}>
              Est. total: ${parts.slice(0, 3).reduce((sum, p) => sum + parseFloat(p.topPrice.replace('$', '')), 0).toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Full "Priority Parts" Interface */}
      <div className="hidden lg:flex lg:flex-col lg:h-full">
        {/* Header with Priority Parts + AI Diagnosis Tags */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar + Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#808080]/30 flex items-center justify-center overflow-hidden">
                <Image
                  src="/header/logo.svg"
                  alt="Wessley"
                  width={24}
                  height={24}
                  className="brightness-200"
                />
              </div>
              <h2 className="font-semibold text-white font-['DM_Sans']" style={{ fontSize: 'clamp(1.125rem, 1.5vw, 1.25rem)' }}>Priority Parts</h2>
            </div>

            {/* AI Diagnosis Tags Inline */}
            <div className="flex items-center gap-2">
              <span className="text-[#C4C4C4]/60 font-['DM_Sans']" style={{ fontSize: 'clamp(0.8125rem, 1vw, 0.875rem)' }}>Wessley sees:</span>
              {aiDiagnoses.map((diagnosis, idx) => (
                <button
                  key={diagnosis.id}
                  onMouseEnter={() => setHoveredDiagnosis(diagnosis.id)}
                  onMouseLeave={() => setHoveredDiagnosis(null)}
                  className={`px-2 py-1 rounded transition-all font-['DM_Sans'] ${
                    diagnosis.severity === 'urgent' ? 'text-[#ff6b6b]' :
                    diagnosis.severity === 'soon' ? 'text-[#ffa726]' :
                    'text-[#808080]'
                  } hover:bg-[#1a1a1a]`}
                  style={{ fontSize: 'clamp(0.75rem, 0.85vw, 0.8125rem)' }}
                >
                  {diagnosis.label.toLowerCase()}
                  {idx < aiDiagnoses.length - 1 && <span className="text-[#808080] mx-1">·</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Tools Indicator */}
            <div className="flex items-center gap-2 text-[#C4C4C4]/60">
              <Wrench className="w-4 h-4" />
              <span className="font-['DM_Sans']" style={{ fontSize: 'clamp(0.8125rem, 1vw, 0.875rem)' }}>Tools</span>
            </div>
          </div>
        </div>

        {/* Main Content Area with Sidebar */}
        <div className="flex gap-6 flex-1">
          {/* Parts Grid - Main Area */}
          <div className="flex-1 flex flex-col">
            <div className="relative flex-1 max-h-[500px]">
              <PartsMasonryGrid
                parts={parts}
                onPartsChange={onPartsChange}
                onCompare={handleCompare}
                selectedItems={selectedItems}
                onToggleItem={onToggleItem}
                hoveredDiagnosis={hoveredDiagnosis}
              />
            </div>

            {/* Chat Input at Bottom */}
            <div className="mt-6 space-y-3">
              <div className="bg-[#1a1a1a] border border-[#808080]/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#808080]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Image
                      src="/header/logo.svg"
                      alt="Wessley"
                      width={16}
                      height={16}
                      className="brightness-200"
                    />
                  </div>
                  <input
                    placeholder="Ask Wessley AI anything about parts, tools, or repairs..."
                    className="flex-1 bg-transparent border-none text-white placeholder-[#C4C4C4]/60 focus:outline-none font-['DM_Sans']"
                    style={{ fontSize: 'clamp(0.8125rem, 1vw, 0.875rem)' }}
                  />
                  <button className="p-2 hover:bg-[#161616] rounded-lg transition-colors">
                    <Send className="w-4 h-4 text-[#8BE196]" />
                  </button>
                </div>

                {/* Suggested Prompts */}
                <div className="flex items-center gap-2 flex-wrap">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      className="px-3 py-1.5 bg-[#161616]/60 hover:bg-[#161616] border border-[#808080]/30 rounded-lg text-[#C4C4C4] transition-all font-['DM_Sans']"
                      style={{ fontSize: 'clamp(0.75rem, 0.85vw, 0.8125rem)' }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Powered by */}
                <p className="text-[#C4C4C4]/40 text-center mt-3 font-['DM_Sans']" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>
                  Powered by Wessley AI · Press Enter to send
                </p>
              </div>
            </div>
          </div>

          {/* Tools Sidebar */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-[#1a1a1a] border border-[#808080]/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-4 h-4 text-[#8BE196]" />
                <h3 className="font-medium text-white font-['DM_Sans']" style={{ fontSize: 'clamp(0.875rem, 1vw, 0.9375rem)' }}>Tools</h3>
              </div>
              <p className="text-[#C4C4C4]/60 mb-4 font-['DM_Sans']" style={{ fontSize: 'clamp(0.75rem, 0.85vw, 0.8125rem)' }}>For installation</p>

              <div className="space-y-3">
                {tools.map((tool) => (
                  <div key={tool.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={tool.id}
                      className="border-[#808080]/50 data-[state=checked]:bg-[#8BE196] data-[state=checked]:border-[#8BE196]"
                    />
                    <label
                      htmlFor={tool.id}
                      className="text-[#C4C4C4] cursor-pointer hover:text-white transition-colors font-['DM_Sans']"
                      style={{ fontSize: 'clamp(0.8125rem, 0.9vw, 0.875rem)' }}
                    >
                      {tool.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Drawer */}
      <ComparisonDrawer
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        partName={comparisonPart}
      />
    </div>
  )
}
