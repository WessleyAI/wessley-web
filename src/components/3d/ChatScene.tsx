'use client'

import * as React from "react"
import { useEffect, useRef } from 'react'
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Grid, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useModelStore, type VehicleComponent } from '@/stores/model-store'
import { loadNDJSON, getPositionedNodes, buildSceneGraphFromNDJSON, type NDJSONNode } from '@/lib/ndjson-loader'
import { ComponentMeshes } from './ComponentMeshes'
import { HarnessesAndWires } from './HarnessesAndWires'

// Helper function to classify component type based on node_type
function classifyComponentType(nodeType: string): 'fuse' | 'relay' | 'sensor' | 'connector' | 'wire' | 'module' | 'ground_point' | 'ground_plane' | 'bus' | 'splice' | 'pin' | 'other' {
  const lower = nodeType.toLowerCase()
  if (lower === 'fuse') return 'fuse'
  if (lower === 'relay') return 'relay'
  if (lower === 'sensor') return 'sensor'
  if (lower === 'connector' || lower === 'plug') return 'connector'
  if (lower === 'wire' || lower === 'cable') return 'wire'
  if (lower === 'module' || lower === 'ecu' || lower === 'control') return 'module'
  if (lower === 'ground_point') return 'ground_point'
  if (lower === 'ground_plane') return 'ground_plane'
  if (lower === 'bus') return 'bus'
  if (lower === 'splice') return 'splice'
  if (lower === 'pin') return 'pin'
  if (lower === 'component') return 'other' // Generic component
  return 'other'
}

// Convert NDJSON node to VehicleComponent
function ndjsonNodeToComponent(node: NDJSONNode): VehicleComponent | null {
  if (!node.anchor_xyz) return null // Skip nodes without positions

  return {
    id: node.id,
    name: node.canonical_id || node.id,
    type: classifyComponentType(node.node_type || 'other'),
    position: node.anchor_xyz as [number, number, number],
    description: node.code_id || undefined,
    specifications: {
      voltage: node.voltage,
      mounting_surface: node.mounting_surface,
      service_access: node.service_access,
      anchor_zone: node.anchor_zone,
      bbox_m: node.bbox_m
    },
    metadata: node
  }
}

// NDJSON Data Loader Component
function NDJSONLoader() {
  const { setComponents, setNDJSONData, setSceneGraph } = useModelStore()
  const hasLoaded = useRef(false)

  // Load NDJSON component data
  useEffect(() => {
    if (hasLoaded.current) return
    hasLoaded.current = true

    const loadComponentData = async () => {
      try {
        console.log('[ChatScene] Loading enhanced NDJSON data...')
        const ndjsonData = await loadNDJSON('/models/enhanced_model.ndjson')
        console.log('[ChatScene] NDJSON data loaded:', {
          nodes: Object.keys(ndjsonData.nodesById).length,
          edges: ndjsonData.edges.length,
          zones: Object.keys(ndjsonData.byZone).length
        })

        setNDJSONData(ndjsonData)

        // Build scene graph from NDJSON
        const sceneGraph = buildSceneGraphFromNDJSON(ndjsonData)
        console.log('[ChatScene] Scene graph built:', sceneGraph)
        setSceneGraph(sceneGraph)

        // Convert positioned nodes to VehicleComponents
        const positionedNodes = getPositionedNodes(ndjsonData)
        const components: VehicleComponent[] = positionedNodes
          .map(ndjsonNodeToComponent)
          .filter((c): c is VehicleComponent => c !== null)

        console.log(`[ChatScene] Extracted ${components.length} positioned components`)
        console.log('[ChatScene] Sample components:', components.slice(0, 5))
        setComponents(components)
      } catch (error) {
        console.error('[ChatScene] Failed to load NDJSON data:', error)
      }
    }

    loadComponentData()
  }, [setComponents, setNDJSONData, setSceneGraph])

  return null
}

// Camera controller that responds to store changes
function CameraController() {
  const { cameraView, setUserControllingCamera } = useModelStore()
  const controlsRef = useRef<any>(null)
  const isUserControllingRef = useRef(false) // Use ref for immediate check
  const hasReachedTargetRef = useRef(false)

  useFrame(({ camera }) => {
    // Don't lerp if user is controlling OR we've already reached target
    if (controlsRef.current && !isUserControllingRef.current && !hasReachedTargetRef.current) {
      const { target, position } = cameraView
      const targetVector = new THREE.Vector3(...target)
      const positionVector = new THREE.Vector3(...position)

      // Check if we're close enough to stop animating
      const positionDistance = camera.position.distanceTo(positionVector)
      const targetDistance = controlsRef.current.target.distanceTo(targetVector)

      // Stop lerping if we're very close (within 0.01 units)
      if (positionDistance < 0.01 && targetDistance < 0.01) {
        hasReachedTargetRef.current = true
        return
      }

      // Lerp to target
      camera.position.lerp(positionVector, 0.1)
      controlsRef.current.target.lerp(targetVector, 0.1)
      controlsRef.current.update()
    }
  })

  // Reset flags when camera view changes (new component selected)
  React.useEffect(() => {
    isUserControllingRef.current = false
    hasReachedTargetRef.current = false
  }, [cameraView])

  const handleControlStart = () => {
    isUserControllingRef.current = true
    setUserControllingCamera(true)
  }

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={50}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2.1}
      target={cameraView.target}
      autoRotate={false}
      autoRotateSpeed={0.5}
      onStart={handleControlStart}
      onChange={handleControlStart}
    />
  )
}

// Simplified scene setup for chat interface
function ChatSceneContent() {
  const { cameraView, resetView } = useModelStore()

  // Handle clicking on empty space to deselect
  const handleCanvasClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.eventObject.type === 'Scene') {
      resetView()
    }
  }

  return (
    <>
      {/* Camera with store-controlled position */}
      <PerspectiveCamera
        makeDefault
        position={cameraView.position}
        fov={cameraView.fov || 50}
      />

      {/* Extreme fog for maximum visibility */}
      <fog attach="fog" args={['#666666', 1, 8]} />

      {/* Dramatic lighting for depth */}
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Strong rim lights for edge definition */}
      <pointLight position={[-6, 4, -6]} intensity={1.5} color="#ffffff" />
      <pointLight position={[6, 2, 6]} intensity={1.2} color="#cccccc" />
      <spotLight position={[0, 12, 0]} intensity={1.5} angle={0.5} penumbra={0.8} castShadow />
      <pointLight position={[0, -2, -8]} intensity={0.8} color="#666666" />

      {/* Environment for reflections */}
      <Environment preset="studio" background={false} />

      {/* Ground Grid */}
      <Grid
        position={[0, 0, 0]}
        args={[50, 50]}
        cellSize={2}
        cellThickness={0.8}
        cellColor="#555"
        sectionSize={10}
        sectionThickness={1.5}
        sectionColor="#777"
        fadeDistance={100}
        fadeStrength={1}
        infiniteGrid={true}
      />

      {/* Load NDJSON data */}
      <NDJSONLoader />

      {/* Harnesses and wires (from scene config + NDJSON edges) */}
      <HarnessesAndWires />

      {/* Interactive component meshes with animation */}
      <ComponentMeshes />

      {/* Smart camera controls */}
      <CameraController />
    </>
  )
}

interface ChatSceneProps {
  isExtended?: boolean
}

export function ChatScene({ isExtended = false }: ChatSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [2, 1.5, 2], fov: 60 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        style={{
          background: 'radial-gradient(circle at center, #2a2a2a 0%, #000000 70%)',
          borderBottomLeftRadius: isExtended ? '8px' : '10rem',
          borderBottomRightRadius: isExtended ? '8px' : '10rem'
        }}
      >
        <ChatSceneContent />
      </Canvas>
    </div>
  )
}