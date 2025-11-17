'use client'

import * as THREE from 'three'

/**
 * Dark Room Environment
 * Creates a room with dark walls that reflect component lights
 */
export function DarkRoom() {
  const wallMaterial = {
    color: "#151515",
    metalness: 0,
    roughness: 1,
    side: THREE.DoubleSide
  }

  return (
    <group name="dark-room">
      {/* Floor - closer to model for better light reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[15, 15, 32, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0}
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ceiling - very high to prevent looking above */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 20, 0]} receiveShadow>
        <planeGeometry args={[15, 15, 32, 32]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0}
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 10, -7.5]} receiveShadow>
        <planeGeometry args={[15, 40, 32, 64]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, 10, 7.5]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[15, 40, 32, 64]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7.5, 10, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[15, 40, 32, 64]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Right wall */}
      <mesh position={[7.5, 10, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[15, 40, 32, 64]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Vertical corner cylinders - smooth rounded edges */}
      {[
        [-7.5, 10, -7.5],  // Back-left
        [7.5, 10, -7.5],   // Back-right
        [-7.5, 10, 7.5],   // Front-left
        [7.5, 10, 7.5]     // Front-right
      ].map((pos, i) => (
        <mesh key={`corner-${i}`} position={pos as [number, number, number]} receiveShadow>
          <cylinderGeometry args={[0.1, 0.1, 40, 16]} />
          <meshStandardMaterial {...wallMaterial} />
        </mesh>
      ))}
    </group>
  )
}
