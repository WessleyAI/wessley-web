'use client'

import { useRef, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useModelStore, type VehicleComponent } from '@/stores/model-store'
import { traceElectricalPath, getPathSummary, type TracedPaths } from '@/lib/electrical-path-tracer'

interface ComponentMeshProps {
  component: VehicleComponent
}

// Color scheme for different component types (matching enhanced viewer)
const COMPONENT_COLORS: Record<string, number> = {
  fuse: 0xffeb3b,      // Yellow
  relay: 0x2196f3,     // Blue
  sensor: 0x4caf50,    // Green
  connector: 0x9c27b0, // Purple
  wire: 0x9e9e9e,      // Gray
  module: 0xff9800,    // Orange
  ground_point: 0x000000, // Black
  ground_plane: 0x000000, // Black
  bus: 0xff5722,       // Deep Orange
  splice: 0xf44336,    // Red
  pin: 0x607d8b,       // Blue Gray
  other: 0x00bcd4      // Cyan
}

export function ComponentMesh({ component }: ComponentMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const {
    selectedComponentId,
    hoveredComponentId,
    highlightedComponentIds,
    setSelectedComponent,
    setHoveredComponent,
    setHighlightedComponents,
    focusOnComponent,
    ndjsonData
  } = useModelStore()
  const [hovered, setHovered] = useState(false)

  const isSelected = selectedComponentId === component.id
  const isHovered = hoveredComponentId === component.id || hovered
  const isHighlighted = highlightedComponentIds.includes(component.id)

  // Debug: Log when highlighting changes
  if (isHighlighted && component.id !== selectedComponentId) {
    console.log('[ComponentMesh] Component highlighted:', component.name, component.id)
  }

  // Get bounding box dimensions from specifications
  const bbox = component.specifications?.bbox_m as [number, number, number] | undefined
  const [width, height, depth] = bbox || [0.05, 0.05, 0.025]

  // Determine color based on type and state
  const baseColor = COMPONENT_COLORS[component.type] || COMPONENT_COLORS.other
  const emissiveColor = isSelected ? baseColor : isHighlighted ? 0x8BE196 : 0x000000 // Mint green for highlighted
  const emissiveIntensity = isSelected ? 0.5 : isHighlighted ? 0.4 : isHovered ? 0.2 : 0

  // Pulsing animation for selected component
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1
      meshRef.current.scale.setScalar(pulse)
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1)
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    console.log('[ComponentMesh] ===== CLICKED =====')
    console.log('[ComponentMesh] Component:', component.name, component.id)
    console.log('[ComponentMesh] NDJSON Data available?', !!ndjsonData)

    if (ndjsonData) {
      console.log('[ComponentMesh] NDJSON edges:', ndjsonData.edges?.length)
      console.log('[ComponentMesh] NDJSON nodes:', Object.keys(ndjsonData.nodesById || {}).length)
    }

    // Clear previous highlights and circuit path FIRST
    console.log('[ComponentMesh] Clearing previous highlights...')
    setHighlightedComponents([])
    ;(window as any).currentCircuitPath = []

    setSelectedComponent(component.id)
    focusOnComponent(component.id)

    // Trace and highlight electrical path for NEW component
    if (ndjsonData) {
      console.log('[ComponentMesh] Starting path trace...')
      const tracedPaths = traceElectricalPath(component.id, ndjsonData)
      console.log('[ComponentMesh] Traced paths:', tracedPaths)
      console.log('[ComponentMesh] Setting highlighted components:', tracedPaths.allHighlighted.length, 'components')
      setHighlightedComponents(tracedPaths.allHighlighted)

      // Store the ordered circuit path for wire generation
      ;(window as any).currentCircuitPath = tracedPaths.completeCircuit

      // Log path summary
      const summary = getPathSummary(tracedPaths.allHighlighted, ndjsonData)
      console.log('[ComponentMesh] Path Summary:', summary)
    } else {
      console.error('[ComponentMesh] ERROR: No NDJSON data available!')
      // Still clear if no data
      setHighlightedComponents([])
    }
  }

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    setHoveredComponent(component.id)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    setHovered(false)
    setHoveredComponent(null)
    document.body.style.cursor = 'default'
  }

  if (!component.position) return null

  // Different geometry based on component type (enhanced, matching viewer)
  let geometry: JSX.Element
  let hasGroundCone = false

  switch (component.type) {
    case 'fuse':
      geometry = <cylinderGeometry args={[width / 2, width / 2, depth, 8]} />
      break
    case 'relay':
      geometry = <boxGeometry args={[width, height, depth]} />
      break
    case 'bus':
      geometry = <boxGeometry args={[width, height, depth]} />
      break
    case 'ground_point':
      geometry = <sphereGeometry args={[0.04, 16, 12]} />
      hasGroundCone = true
      break
    case 'ground_plane':
      geometry = <sphereGeometry args={[0.06, 16, 12]} />
      hasGroundCone = true
      break
    case 'connector':
      geometry = <boxGeometry args={[width, height, depth]} />
      break
    case 'splice':
      // Dynamic size based on connections (fallback to bbox)
      geometry = <boxGeometry args={[width, height, depth * 0.5]} />
      break
    case 'pin':
      geometry = <cylinderGeometry args={[0.005, 0.005, 0.015, 6]} />
      break
    case 'sensor':
      geometry = <sphereGeometry args={[Math.min(width, height, depth) / 2, 8, 8]} />
      break
    case 'module':
      geometry = <boxGeometry args={[width, height, depth]} />
      break
    default:
      geometry = <boxGeometry args={[width, height, depth]} />
  }

  return (
    <mesh
      ref={meshRef}
      position={component.position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      castShadow
      receiveShadow
    >
      {geometry}
      <meshStandardMaterial
        color={baseColor}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
        metalness={0.6}
        roughness={0.4}
        opacity={isHighlighted ? 1 : isHovered ? 1 : 0.75}
        transparent
      />

      {/* Ground indicator cone (points down) */}
      {hasGroundCone && (
        <mesh position={[0, -0.06, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.03, 0.08, 8]} />
          <meshLambertMaterial color={0x000000} opacity={0.9} transparent />
        </mesh>
      )}

      {/* Selection outline */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[meshRef.current?.geometry!]} />
          <lineBasicMaterial color={0xffffff} linewidth={2} />
        </lineSegments>
      )}

      {/* Highlight outline for path components */}
      {isHighlighted && !isSelected && (
        <lineSegments>
          <edgesGeometry args={[meshRef.current?.geometry!]} />
          <lineBasicMaterial color={0x8BE196} linewidth={1} />
        </lineSegments>
      )}
    </mesh>
  )
}

// Component that renders all components as 3D meshes
export function ComponentMeshes() {
  const { components, selectedComponentId, highlightedComponentIds, modelRotation } = useModelStore()
  const groupRef = useRef<THREE.Group>(null)
  const rotationGroupRef = useRef<THREE.Group>(null)

  console.log('[ComponentMeshes] Rendering with', highlightedComponentIds.length, 'highlighted components')

  // Gentle left to right rolling animation (stops when component is selected)
  useFrame((state) => {
    if (groupRef.current && !selectedComponentId) {
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.1
    } else if (groupRef.current && selectedComponentId) {
      // Reset to center when component is selected
      groupRef.current.position.x = 0
      groupRef.current.rotation.z = 0
    }

    // Smoothly apply model rotation from store
    if (rotationGroupRef.current) {
      const targetRotation = new THREE.Euler(modelRotation.x, modelRotation.y, modelRotation.z)
      rotationGroupRef.current.rotation.x += (targetRotation.x - rotationGroupRef.current.rotation.x) * 0.1
      rotationGroupRef.current.rotation.y += (targetRotation.y - rotationGroupRef.current.rotation.y) * 0.1
      rotationGroupRef.current.rotation.z += (targetRotation.z - rotationGroupRef.current.rotation.z) * 0.1
    }
  })

  console.log('[ComponentMeshes] Rendering', components.length, 'component meshes')

  return (
    <group ref={rotationGroupRef} name="model-rotation-pivot">
      <group ref={groupRef} name="component-meshes" rotation={[Math.PI / 2, Math.PI, 0]}>
        {components.map(component => (
          <ComponentMesh key={component.id} component={component} />
        ))}
      </group>
    </group>
  )
}
