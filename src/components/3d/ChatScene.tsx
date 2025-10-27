'use client'

import * as React from "react"
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// Loading fallback component
function LoadingPlaceholder() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  )
}

// Simplified scene setup for chat interface
function ChatSceneContent() {
  return (
    <>
      {/* Camera with good default position */}
      <PerspectiveCamera makeDefault position={[8, 5, 8]} fov={50} />
      
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
      
      {/* Orbit controls for interaction */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
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