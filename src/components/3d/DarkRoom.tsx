'use client'

import { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Dark Room Environment
 * Creates a room with dark walls that reflect component lights
 */
interface DarkRoomProps {
  showLamp?: boolean
}

export function DarkRoom({ showLamp = true }: DarkRoomProps) {
  const lampRef = useRef<THREE.Group>(null)

  // Subtle swaying animation - like wind touching the lamp
  useFrame((state) => {
    if (lampRef.current) {
      const time = state.clock.elapsedTime
      // Gentle pendulum motion in X and Z - increased amplitude for visible light movement
      lampRef.current.rotation.x = Math.sin(time * 0.3) * 0.12 // ~7 degrees
      lampRef.current.rotation.z = Math.cos(time * 0.4) * 0.10 // Slightly different frequency
    }
  })

  // Load concrete texture from Poly Haven (free PBR textures)
  const concreteTexture = useLoader(
    THREE.TextureLoader,
    'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_floor_02/concrete_floor_02_diff_1k.jpg'
  )

  // Configure texture tiling
  concreteTexture.wrapS = THREE.RepeatWrapping
  concreteTexture.wrapT = THREE.RepeatWrapping
  concreteTexture.repeat.set(4, 4)

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
          map={concreteTexture}
          color="#3a3a3a"
          metalness={0}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ceiling - lower for more intimate space */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]} receiveShadow>
        <planeGeometry args={[15, 15, 32, 32]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0}
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 3, -7.5]} receiveShadow>
        <planeGeometry args={[15, 12, 32, 64]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, 3, 7.5]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[15, 12, 32, 64]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7.5, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[15, 12, 32, 64]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Right wall */}
      <mesh position={[7.5, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[15, 12, 32, 64]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Vertical corner cylinders - smooth rounded edges */}
      {[
        [-7.5, 3, -7.5],  // Back-left
        [7.5, 3, -7.5],   // Back-right
        [-7.5, 3, 7.5],   // Front-left
        [7.5, 3, 7.5]     // Front-right
      ].map((pos, i) => (
        <mesh key={`corner-${i}`} position={pos as [number, number, number]} receiveShadow>
          <cylinderGeometry args={[0.1, 0.1, 12, 16]} />
          <meshStandardMaterial {...wallMaterial} />
        </mesh>
      ))}

      {/* Ceiling Lamp - hangs from ceiling, visible and swaying */}
      {showLamp && (
        <group ref={lampRef} position={[0, 1.7, 0]}>
          {/* Lamp cord/cable - extends up to ceiling at Y=6 */}
          <mesh position={[0, 2.15, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 4.3, 8]} />
            <meshStandardMaterial color="#333333" metalness={0} roughness={0.9} />
          </mesh>

          {/* Lamp shade - industrial style, smaller and more compact */}
          <group position={[0, 0, 0]}>
            {/* Lamp shade cone - smaller */}
            <mesh rotation={[0, 0, 0]} castShadow>
              <coneGeometry args={[0.3, 0.4, 16, 1, true]} />
              <meshStandardMaterial
                color="#2a2a2a"
                metalness={0.4}
                roughness={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Light bulb glow - warm white */}
            <mesh position={[0, -0.15, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial
                color="#fffef5"
                emissive="#fffef5"
                emissiveIntensity={8.0}
                transparent
                opacity={0.95}
              />
            </mesh>

            {/* Point light from bulb - warm white */}
            <pointLight
              position={[0, -0.18, 0]}
              color="#fffef5"
              intensity={25.0}
              distance={25}
              decay={1.5}
              castShadow
            />
          </group>
        </group>
      )}
    </group>
  )
}
