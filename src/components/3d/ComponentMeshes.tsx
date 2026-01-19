'use client'

import { useRef, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useModelStore, type VehicleComponent } from '@/stores/model-store'
import { traceElectricalPath, getPathSummary } from '@/lib/electrical-path-tracer'

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
    setCurrentCircuitPath,
    focusOnComponent,
    ndjsonData
  } = useModelStore()
  const [hovered, setHovered] = useState(false)

  const isSelected = selectedComponentId === component.id
  const isHovered = hoveredComponentId === component.id || hovered
  const isHighlighted = highlightedComponentIds.includes(component.id)
  const isFaulty = component.faulty === true

  // Get bounding box dimensions from specifications
  const bbox = component.specifications?.bbox_m as [number, number, number] | undefined
  const [width, height, depth] = bbox || [0.05, 0.05, 0.025]

  // Determine color based on type and state - FAULTY components override to RED
  // Ground points and ground planes ALWAYS DARK GRAY, no glow, no highlight
  const isGround = component.type === 'ground_point' || component.type === 'ground_plane'

  // Check if this is a light component (only lights should emit)
  const componentName = component.name.toLowerCase()
  const componentId = component.id.toLowerCase()
  const isLight = componentName.includes('lamp') || componentName.includes('light') || componentId.includes('lamp')

  const baseColor = isGround ? 0x1a1a1a : (isFaulty ? 0xff0000 : (COMPONENT_COLORS[component.type] || COMPONENT_COLORS.other))
  const emissiveColor = isGround ? 0x000000 : (isFaulty ? 0xff0000 : 0x000000)
  // ONLY lights and faulty components emit - everything else is ZERO emissive
  const emissiveIntensity = isGround ? 0 : (isFaulty ? 0.8 : 0)

  // Pulsing animation for faulty components only
  const pulseRef = useRef(0)
  useFrame((state) => {
    if (isFaulty && pulseRef.current !== undefined) {
      pulseRef.current = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5 // Oscillate 0-1
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    // Clear previous state
    setHighlightedComponents([])
    setCurrentCircuitPath([])

    setSelectedComponent(component.id)
    focusOnComponent(component.id) // Snap camera to component

    // Trace and highlight ONLY the circuit path from this component to fuse
    if (ndjsonData) {
      const tracedPaths = traceElectricalPath(component.id, ndjsonData)
      const summary = getPathSummary(tracedPaths.allHighlighted, ndjsonData)

      console.log('🎯 CLICKED:', component.name)
      console.log('   Circuit path nodes:', tracedPaths.allHighlighted.length)
      console.log('   🔌 Fuses:', summary.fuseCount)

      setHighlightedComponents(tracedPaths.allHighlighted)
      setCurrentCircuitPath(tracedPaths.completeCircuit)
    } else {
      console.error('❌ NO NDJSON DATA!')
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

  // Different geometry based on component type and name
  let geometryElements: JSX.Element[] = []

  // SPECIAL COMPONENTS - Realistic 3D models
  if (componentName.includes('alternator') || componentId.includes('alternator')) {
    // Alternator - cylindrical body with pulley
    geometryElements.push(
      <group key="alternator">
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.12, 16]} />
          <meshBasicMaterial color={0x808080} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
          <meshBasicMaterial color={0x404040} />
        </mesh>
      </group>
    )
  } else if (componentName.includes('battery') || componentId.includes('battery')) {
    // Battery - rectangular with terminals
    geometryElements.push(
      <group key="battery">
        <mesh>
          <boxGeometry args={[0.25, 0.18, 0.2]} />
          <meshBasicMaterial color={0x1a1a1a} />
        </mesh>
        <mesh position={[-0.08, 0.12, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.03, 8]} />
          <meshBasicMaterial color={0xff0000} />
        </mesh>
        <mesh position={[0.08, 0.12, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.03, 8]} />
          <meshBasicMaterial color={0x000000} />
        </mesh>
      </group>
    )
  } else if (componentName.includes('lamp') || componentName.includes('light') || componentId.includes('lamp')) {
    // Determine light type and color based on actual component naming
    const isHeadlight = componentName.includes('headlamp') || componentName.includes('head lamp') || componentId.includes('headlamp')
    const isFogLight = componentName.includes('fog') || componentId.includes('fog')
    const isTaillight = componentName.includes('tail') || componentName.includes('rear combination') || componentId.includes('tail')
    const isStopLight = componentName.includes('stop') || componentId.includes('stop')
    const isTurnSignal = componentName.includes('turn') || componentName.includes('signal') || componentName.includes('indicator')
    const isParking = componentName.includes('park') || componentName.includes('position')
    const isInterior = componentName.includes('courtesy') || componentName.includes('room') || componentName.includes('cargo') || componentName.includes('luggage') || componentName.includes('glove')

    // Color selection based on light type
    const lightColor = isStopLight ? 0xff0000 :         // Bright red for stop/brake
                      isTaillight ? 0xff3333 :          // Red for tail
                      isTurnSignal ? 0xffaa00 :         // Amber for turn signals
                      isParking ? 0xff8800 :            // Orange for parking
                      isFogLight ? 0xffffaa :           // Warm yellow for fog
                      isInterior ? 0xffffdd :           // Warm white for interior
                      0xffffff                          // Pure white for headlights

    const lightIntensity = isHeadlight ? 5.0 :          // Very bright headlights
                          isFogLight ? 2.5 :            // Bright fog lights
                          isStopLight ? 4.0 :           // Bright stop lights
                          isTaillight ? 3.5 :           // Bright tail lights
                          isInterior ? 0.8 :            // Interior lighting
                          1.0

    const lightDistance = isHeadlight ? 5.0 :           // Far-reaching headlights
                         isFogLight ? 4.0 :             // Wide fog coverage
                         isStopLight ? 4.0 :            // Visible stop lights
                         isTaillight ? 3.5 :            // Tail lights
                         1.2                            // Interior/small lights

    // Determine rotation based on light position
    const isLeftSide = componentName.includes('left') || componentId.includes('_l')
    const isRightSide = componentName.includes('right') || componentId.includes('_r')
    const isFront = isHeadlight || isFogLight
    const isRear = isTaillight || isStopLight

    // Calculate rotation to face correct direction
    // After parent rotation, need Z rotation to control forward/backward
    let rotationZ = 0
    if (isFront) {
      // Front lights point FORWARD (+X direction)
      rotationZ = -Math.PI / 2  // -90 degrees
      if (isLeftSide) rotationZ = -Math.PI / 2 - Math.PI / 12  // Slightly left
      if (isRightSide) rotationZ = -Math.PI / 2 + Math.PI / 12 // Slightly right
    } else if (isRear) {
      // Rear lights point BACKWARD (-X direction)
      rotationZ = Math.PI / 2  // +90 degrees
      if (isLeftSide) rotationZ = Math.PI / 2 + Math.PI / 12  // Slightly left
      if (isRightSide) rotationZ = Math.PI / 2 - Math.PI / 12 // Slightly right
    }

    // Lamp/Light - cone with lens and actual point light
    geometryElements.push(
      <group key="lamp" rotation={[0, 0, rotationZ]}>
        {/* Light housing */}
        <mesh>
          <cylinderGeometry args={[0.04, 0.05, 0.06, 12]} />
          <meshBasicMaterial color={0xcccccc} />
        </mesh>

        {/* Glowing lens */}
        <mesh position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.01, 12]} />
          <meshStandardMaterial
            color={lightColor}
            transparent
            opacity={0.98}
            emissive={lightColor}
            emissiveIntensity={10.0}
            metalness={0}
            roughness={1}
          />
        </mesh>

        {/* Point light emanating from bulb */}
        <pointLight
          position={[0, 0.04, 0]}
          color={lightColor}
          intensity={lightIntensity}
          distance={lightDistance}
          decay={2}
          castShadow={false}
        />

        {/* Light glow sphere - brighter and more visible */}
        <mesh position={[0, 0.04, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial
            color={lightColor}
            transparent
            opacity={0.95}
          />
        </mesh>

        {/* Additional outer glow for visibility */}
        <mesh position={[0, 0.04, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial
            color={lightColor}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Extra wide glow halo */}
        <mesh position={[0, 0.04, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial
            color={lightColor}
            transparent
            opacity={0.25}
          />
        </mesh>
      </group>
    )
  } else if (componentName.includes('pump') || componentId.includes('pump')) {
    // Pump - cylindrical with inlet/outlet
    geometryElements.push(
      <group key="pump">
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.12, 12]} />
          <meshBasicMaterial color={0x4a4a4a} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.03, 8]} />
          <meshBasicMaterial color={0x2a2a2a} />
        </mesh>
      </group>
    )
  } else if (componentName.includes('radiator') || componentId.includes('radiator')) {
    // Radiator - STANDING UPRIGHT with vertical fins
    geometryElements.push(
      <group key="radiator" rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.4, 0.3, 0.05]} />
          <meshBasicMaterial color={0x606060} />
        </mesh>
        {/* Vertical Fins */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-0.15 + i * 0.04, 0, 0.03]}>
            <boxGeometry args={[0.005, 0.28, 0.01]} />
            <meshBasicMaterial color={0x404040} />
          </mesh>
        ))}
      </group>
    )
  } else if (componentName.includes('starter') || componentId.includes('starter')) {
    // Starter motor - cylindrical
    geometryElements.push(
      <group key="starter">
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.15, 16]} />
          <meshBasicMaterial color={0x505050} />
        </mesh>
        <mesh position={[0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 12]} />
          <meshBasicMaterial color={0x808080} />
        </mesh>
      </group>
    )
  } else if (componentName.includes('compressor') || componentId.includes('compressor')) {
    // A/C Compressor - cylindrical with pulley
    geometryElements.push(
      <group key="compressor">
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 0.14, 16]} />
          <meshBasicMaterial color={0x606060} />
        </mesh>
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
          <meshBasicMaterial color={0x404040} />
        </mesh>
      </group>
    )
  } else if (componentName.includes('injector') || componentId.includes('injector')) {
    // Fuel Injector - cylindrical with nozzle
    geometryElements.push(
      <group key="injector">
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
          <meshBasicMaterial color={0x4a4a4a} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.015, 0.008, 0.03, 12]} />
          <meshBasicMaterial color={0x2a2a2a} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.02, 12]} />
          <meshBasicMaterial color={0x1a1a1a} />
        </mesh>
      </group>
    )
  } else if (componentName.includes('coil') || componentId.includes('coil')) {
    // Ignition Coil - cylindrical with connector on top
    geometryElements.push(
      <group key="coil">
        <mesh>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 16]} />
          <meshBasicMaterial color={0x2a2a2a} />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.04]} />
          <meshBasicMaterial color={0x1a1a1a} />
        </mesh>
        <mesh position={[0, -0.07, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
          <meshBasicMaterial color={0xc0c0c0} />
        </mesh>
      </group>
    )
  } else if (componentName.includes('solenoid') || componentId.includes('solenoid')) {
    // Solenoid - cylindrical with coil appearance
    geometryElements.push(
      <group key="solenoid">
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 16]} />
          <meshBasicMaterial color={0x5a5a5a} />
        </mesh>
        {/* Coil winding lines */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, -0.025 + i * 0.012, 0]}>
            <torusGeometry args={[0.032, 0.002, 8, 16]} />
            <meshBasicMaterial color={0xb87333} />
          </mesh>
        ))}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
          <meshBasicMaterial color={0x808080} />
        </mesh>
      </group>
    )
  } else if (componentName.includes('motor') || componentId.includes('motor')) {
    // Electric Motor - cylindrical with mounting bracket
    geometryElements.push(
      <group key="motor">
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
          <meshBasicMaterial color={0x3a3a3a} />
        </mesh>
        <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.02, 8]} />
          <meshBasicMaterial color={0xc0c0c0} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.06, 0.01, 0.04]} />
          <meshBasicMaterial color={0x2a2a2a} />
        </mesh>
      </group>
    )
  } else if (componentName.includes('valve') || componentId.includes('valve')) {
    // Valve - cylindrical body with actuator
    geometryElements.push(
      <group key="valve">
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.06, 12]} />
          <meshBasicMaterial color={0x5a5a5a} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.03, 0.04, 0.03]} />
          <meshBasicMaterial color={0x4a4a4a} />
        </mesh>
        <mesh position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} />
          <meshBasicMaterial color={0x808080} />
        </mesh>
        <mesh position={[0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} />
          <meshBasicMaterial color={0x808080} />
        </mesh>
      </group>
    )
  } else if (componentName.includes('ecu') || componentName.includes('control unit') || componentId.includes('ecu')) {
    // ECU/Control Unit - rectangular box with connector ports
    geometryElements.push(
      <group key="ecu">
        <mesh>
          <boxGeometry args={[0.15, 0.12, 0.05]} />
          <meshBasicMaterial color={0x2a2a2a} />
        </mesh>
        {/* Connector ports */}
        <mesh position={[0, -0.07, 0]}>
          <boxGeometry args={[0.08, 0.02, 0.04]} />
          <meshBasicMaterial color={0x1a1a1a} />
        </mesh>
        <mesh position={[0.05, -0.07, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.04]} />
          <meshBasicMaterial color={0x1a1a1a} />
        </mesh>
        {/* Heat sink fins */}
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} position={[0, 0.065, -0.02 + i * 0.012]}>
            <boxGeometry args={[0.13, 0.005, 0.008]} />
            <meshBasicMaterial color={0x808080} />
          </mesh>
        ))}
      </group>
    )
  } else {
    // DEFAULT GEOMETRIES based on type
    switch (component.type) {
      case 'fuse':
        geometryElements.push(
          <cylinderGeometry key="geom" args={[width / 2, width / 2, depth, 8]} />
        )
        break
      case 'relay':
        geometryElements.push(
          <group key="relay">
            <mesh>
              <boxGeometry args={[width, height, depth]} />
            </mesh>
            {/* Relay pins */}
            {Array.from({ length: 4 }).map((_, i) => (
              <mesh key={i} position={[
                -width/3 + (i % 2) * width*2/3,
                -height/2 - 0.01,
                -depth/3 + Math.floor(i / 2) * depth*2/3
              ]}>
                <cylinderGeometry args={[0.005, 0.005, 0.02, 6]} />
                <meshBasicMaterial color={0xc0c0c0} />
              </mesh>
            ))}
          </group>
        )
        break
      case 'bus':
        geometryElements.push(
          <boxGeometry key="geom" args={[width * 1.5, height, depth * 0.5]} />
        )
        break
      case 'ground_point':
        geometryElements.push(
          <sphereGeometry key="geom" args={[0.06, 16, 12]} />
        )
        break
      case 'ground_plane':
        geometryElements.push(
          <sphereGeometry key="geom" args={[0.10, 16, 12]} />
        )
        break
      case 'connector':
        geometryElements.push(
          <boxGeometry key="geom" args={[width, height, depth]} />
        )
        break
      case 'splice':
        geometryElements.push(
          <boxGeometry key="geom" args={[width, height, depth * 0.5]} />
        )
        break
      case 'pin':
        geometryElements.push(
          <cylinderGeometry key="geom" args={[0.005, 0.005, 0.015, 6]} />
        )
        break
      case 'sensor':
        geometryElements.push(
          <sphereGeometry key="geom" args={[Math.min(width, height, depth) / 2, 8, 8]} />
        )
        break
      case 'module':
        geometryElements.push(
          <group key="module">
            <mesh>
              <boxGeometry args={[width, height, depth]} />
            </mesh>
            {/* Heat sink fins */}
            {Array.from({ length: 3 }).map((_, i) => (
              <mesh key={i} position={[0, height/2 + 0.005, -depth/3 + i * depth/3]}>
                <boxGeometry args={[width * 0.8, 0.005, depth * 0.15]} />
                <meshBasicMaterial color={0x808080} />
              </mesh>
            ))}
          </group>
        )
        break
      default:
        geometryElements.push(
          <boxGeometry key="geom" args={[width, height, depth]} />
        )
    }
  }

  return (
    <group
      position={component.position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        {geometryElements}
        {/* Only apply material if it's a simple geometry */}
        {geometryElements.length === 1 && geometryElements[0].type !== 'group' && (
          <meshStandardMaterial
            color={baseColor}
            emissive={0x000000}
            emissiveIntensity={0}
            metalness={0}
            roughness={1}
          />
        )}
      </mesh>

      {/* Selection glow effect - NOT for ground points/planes */}
      {isSelected && !isGround && (
        <mesh scale={1.2}>
          {geometryElements}
          <meshBasicMaterial color={0xffffff} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Highlight glow for path components - NOT for ground points/planes */}
      {isHighlighted && !isSelected && !isGround && (
        <mesh scale={1.15}>
          {geometryElements}
          <meshBasicMaterial color={0x8BE196} transparent opacity={0.2} />
        </mesh>
      )}

      {/* FAULTY component pulsing red sphere */}
      {isFaulty && (
        <mesh scale={1.3 + pulseRef.current * 0.2}>
          <sphereGeometry args={[Math.max(width, height, depth), 16, 16]} />
          <meshBasicMaterial color={0xff0000} transparent opacity={0.2 * pulseRef.current} />
        </mesh>
      )}
    </group>
  )
}

// Component that renders all components as 3D meshes
export function ComponentMeshes() {
  const { components, selectedComponentId, highlightedComponentIds, modelRotation } = useModelStore()
  const groupRef = useRef<THREE.Group>(null)
  const rotationGroupRef = useRef<THREE.Group>(null)

  // NO ANIMATIONS - model stays still

  return (
    <group ref={rotationGroupRef} name="model-rotation-pivot">
      <group ref={groupRef} name="component-meshes" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
        {components
          .filter(component => {
            // Filter out harness nodes - they're rendered as tubes in HarnessesAndWires
            const isHarness = component.id.toLowerCase().startsWith('harness_') ||
                             component.id.toLowerCase().startsWith('h-') ||
                             component.name.toLowerCase().includes('harness')
            return !isHarness
          })
          .map(component => (
            <ComponentMesh key={component.id} component={component} />
          ))
        }
      </group>
    </group>
  )
}
