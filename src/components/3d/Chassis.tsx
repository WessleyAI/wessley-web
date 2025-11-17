'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import * as THREE from 'three'

/**
 * Vehicle Chassis Component
 * Loads and displays the GAZ-69 chassis frame model
 */
export function Chassis() {
  const { scene } = useGLTF('/gaz-69_vehicle_chassis__frame.glb')

  // Apply non-reflective dark material to chassis
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Make chassis dark and completely matte (non-reflective)
          child.material = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a, // Dark gray
            metalness: 0,
            roughness: 1,
            emissive: 0x000000,
            emissiveIntensity: 0
          })
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      // Enable shadows on the entire scene object
      scene.castShadow = true
      scene.receiveShadow = true
    }
  }, [scene])

  return (
    <primitive
      object={scene}
      scale={1} // Original scale
      position={[0, -0.15, 0]} // Wheels touching floor
      rotation={[0, Math.PI / 2, 0]} // 90 degrees tilt on Y axis
      castShadow
      receiveShadow
    />
  )
}

// Preload the model for faster loading
useGLTF.preload('/gaz-69_vehicle_chassis__frame.glb')
