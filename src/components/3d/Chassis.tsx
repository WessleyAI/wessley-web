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

  // Apply non-reflective dark material to chassis with performance optimizations
  useEffect(() => {
    if (scene) {
      // Create shared material for all chassis parts (better performance)
      const chassisMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a, // Dark gray
        metalness: 0,
        roughness: 1,
        emissive: 0x000000,
        emissiveIntensity: 0
      })

      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Use shared material
          child.material = chassisMaterial

          // Performance optimizations
          child.castShadow = true
          child.receiveShadow = true
          child.frustumCulled = true // Don't render when off-screen

          // Reduce geometry complexity if too detailed
          if (child.geometry && child.geometry.attributes.position) {
            const vertexCount = child.geometry.attributes.position.count
            // If mesh has too many vertices, mark it for simplified rendering
            if (vertexCount > 10000) {
              child.renderOrder = 1 // Render after simpler objects
            }
          }
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
