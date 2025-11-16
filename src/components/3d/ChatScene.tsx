'use client'

import * as React from "react"
import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Environment, PerspectiveCamera, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useModelStore } from '@/stores/model-store'

// Loading fallback component
function LoadingPlaceholder() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  )
}

// Simple car placeholder
function CarPlaceholder() {
  return (
    <group position={[0, 1, 0]}>
      {/* Car body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 4]} />
        <meshStandardMaterial color="#4a90e2" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Car cabin */}
      <mesh position={[0, 1.2, -0.2]} castShadow>
        <boxGeometry args={[1.8, 0.7, 2]} />
        <meshStandardMaterial color="#357abd" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Wheels */}
      <mesh position={[-0.9, 0, 1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.9, 0, 1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[-0.9, 0, -1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.9, 0, -1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  )
}

// Vehicle model component - just show placeholder for now
function VehicleModel() {
  // Always return placeholder until we have a valid GLB model
  return <CarPlaceholder />
}

// Camera controller that responds to store changes
function CameraController() {
  const { cameraView } = useModelStore()
  const controlsRef = useRef<any>(null)

  useFrame(() => {
    if (controlsRef.current) {
      const { target } = cameraView
      const targetVector = new THREE.Vector3(...target)
      controlsRef.current.target.lerp(targetVector, 0.1)
      controlsRef.current.update()
    }
  })

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
    />
  )
}

// Simplified scene setup for chat interface
function ChatSceneContent() {
  const { cameraView } = useModelStore()

  return (
    <>
      {/* Camera with store-controlled position */}
      <PerspectiveCamera
        makeDefault
        position={cameraView.position}
        fov={cameraView.fov || 50}
      />

      {/* Lighting setup */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#4a90e2" />

      {/* Environment for sky and reflections */}
      <Environment
        preset="city"
        background={true}
        backgroundBlurriness={0.8}
        backgroundIntensity={0.4}
      />

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

      {/* Vehicle Model */}
      <VehicleModel />

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
        camera={{ position: [8, 5, 8], fov: 50 }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottomLeftRadius: isExtended ? '8px' : '10rem', 
          borderBottomRightRadius: isExtended ? '8px' : '10rem' 
        }}
      >
        <Suspense fallback={<LoadingPlaceholder />}>
          <ChatSceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}