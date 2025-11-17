'use client'

import * as THREE from 'three'

/**
 * Dark Room Environment
 * Creates a room with dark walls that reflect component lights
 */
export function DarkRoom() {
  return (
    <group name="dark-room">
      {/* Floor - closer to model for better light reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.2}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ceiling - very high to prevent looking above */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 20, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.1}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 10, -7.5]} receiveShadow>
        <planeGeometry args={[15, 40]} />
        <meshStandardMaterial
          color="#151515"
          metalness={0.15}
          roughness={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, 10, 7.5]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[15, 40]} />
        <meshStandardMaterial
          color="#151515"
          metalness={0.15}
          roughness={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7.5, 10, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[15, 40]} />
        <meshStandardMaterial
          color="#151515"
          metalness={0.15}
          roughness={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Right wall */}
      <mesh position={[7.5, 10, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[15, 40]} />
        <meshStandardMaterial
          color="#151515"
          metalness={0.15}
          roughness={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
