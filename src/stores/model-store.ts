import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import * as THREE from 'three'
import { type ParsedNDJSON } from '@/lib/ndjson-loader'
import { type SceneEvent, type SceneEventQueue } from '@/types/scene-events'

export interface VehicleComponent {
  id: string
  name: string
  type: 'fuse' | 'relay' | 'sensor' | 'connector' | 'wire' | 'module' | 'ground_point' | 'ground_plane' | 'bus' | 'splice' | 'pin' | 'other'
  position?: [number, number, number]
  description?: string
  specifications?: Record<string, any>
  connections?: string[] // IDs of connected components
  metadata?: Record<string, any>
  faulty?: boolean // Whether the component is faulty/not working
}

export interface CameraView {
  position: [number, number, number]
  target: [number, number, number]
  fov?: number
}

export interface ModelRotation {
  x: number
  y: number
  z: number
}

export interface SceneNode {
  id: string
  name: string
  type: string // 'Mesh', 'Group', 'Object3D', etc.
  children: SceneNode[]
  position: [number, number, number]
}

interface ModelState {
  // Model data
  modelPath: string | null
  components: VehicleComponent[]
  sceneGraph: SceneNode | null // Three.js scene hierarchy
  ndjsonData: ParsedNDJSON | null // Enhanced electrical system data

  // View control
  cameraView: CameraView
  modelRotation: ModelRotation
  selectedComponentId: string | null
  hoveredComponentId: string | null
  highlightedComponentIds: string[]
  isUserControllingCamera: boolean // Track if user is manually moving camera

  // Visibility toggles
  showChassis: boolean
  showEffects: boolean
  showModels: boolean // Controls if electrical models are loaded (false during onboarding)

  // AI control
  aiControlEnabled: boolean
  currentFocus: string | null // What the AI is currently explaining/showing

  // Scene events
  eventQueue: SceneEventQueue
  lastExecutedEvent: SceneEvent | null

  // Circuit path tracking (moved from window global)
  currentCircuitPath: string[]

  // Actions
  setModelPath: (path: string) => void
  setComponents: (components: VehicleComponent[]) => void
  addComponent: (component: VehicleComponent) => void
  updateComponent: (id: string, updates: Partial<VehicleComponent>) => void
  removeComponent: (id: string) => void
  setSceneGraph: (graph: SceneNode | null) => void
  setNDJSONData: (data: ParsedNDJSON | null) => void

  setCameraView: (view: CameraView) => void
  setModelRotation: (rotation: ModelRotation) => void
  setSelectedComponent: (id: string | null) => void
  setHoveredComponent: (id: string | null) => void
  setHighlightedComponents: (ids: string[]) => void
  setUserControllingCamera: (controlling: boolean) => void

  setShowChassis: (show: boolean) => void
  setShowEffects: (show: boolean) => void
  setShowModels: (show: boolean) => void

  setAIControlEnabled: (enabled: boolean) => void
  setCurrentFocus: (focus: string | null) => void

  // Scene event actions
  executeSceneEvent: (event: SceneEvent) => void
  queueSceneEvents: (events: SceneEvent[]) => void
  playNextEvent: () => void
  clearEventQueue: () => void

  // Circuit path actions
  setCurrentCircuitPath: (path: string[]) => void

  // Helper actions
  focusOnComponent: (componentId: string) => void
  resetView: () => void
}

const DEFAULT_CAMERA_VIEW: CameraView = {
  position: [2, 1.5, 2],
  target: [0, 0.5, 0],
  fov: 60
}

const DEFAULT_MODEL_ROTATION: ModelRotation = {
  x: 0,
  y: 0,
  z: 0
}

export const useModelStore = create<ModelState>()(
  subscribeWithSelector((set, get) => ({
    modelPath: '/models/pajero_pinin_2001.glb',
    components: [],
    sceneGraph: null,
    ndjsonData: null,

    cameraView: DEFAULT_CAMERA_VIEW,
    modelRotation: DEFAULT_MODEL_ROTATION,
    selectedComponentId: null,
    hoveredComponentId: null,
    highlightedComponentIds: [],
    isUserControllingCamera: false,

    showChassis: true,
    showEffects: true,
    showModels: true, // Show models by default (hide only in specific onboarding flows)

    aiControlEnabled: true,
    currentFocus: null,

    eventQueue: {
      events: [],
      currentIndex: 0,
      isPlaying: false
    },
    lastExecutedEvent: null,
    currentCircuitPath: [],

    setModelPath: (path) => set({ modelPath: path }),

    setComponents: (components) => set({ components }),

    addComponent: (component) => set((state) => ({
      components: [...state.components, component]
    })),

    updateComponent: (id, updates) => set((state) => ({
      components: state.components.map(comp =>
        comp.id === id ? { ...comp, ...updates } : comp
      )
    })),

    removeComponent: (id) => set((state) => ({
      components: state.components.filter(comp => comp.id !== id),
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId
    })),

    setSceneGraph: (graph) => set({ sceneGraph: graph }),

    setNDJSONData: (data) => set({ ndjsonData: data }),

    setCameraView: (view) => set({ cameraView: view }),

    setModelRotation: (rotation) => set({ modelRotation: rotation }),

    setSelectedComponent: (id) => set({ selectedComponentId: id }),

    setHoveredComponent: (id) => set({ hoveredComponentId: id }),

    setHighlightedComponents: (ids) => {
      set({ highlightedComponentIds: ids })
    },

    setUserControllingCamera: (controlling) => set({ isUserControllingCamera: controlling }),

    setShowChassis: (show) => set({ showChassis: show }),

    setShowEffects: (show) => set({ showEffects: show }),

    setShowModels: (show) => set({ showModels: show }),

    setAIControlEnabled: (enabled) => set({ aiControlEnabled: enabled }),

    setCurrentFocus: (focus) => set({ currentFocus: focus }),

    focusOnComponent: (componentId) => {
      const component = get().components.find(c => c.id === componentId)
      if (component && component.position) {
        const [x, y, z] = component.position

        // Calculate rotation to bring component to face camera
        // Yaw: rotation around Y axis to align XZ position
        const yaw = -Math.atan2(x, z)

        // Pitch: rotation around X axis to align Y position
        const xzDistance = Math.sqrt(x * x + z * z)
        const pitch = Math.atan2(y, xzDistance)

        // Set model rotation to swivel component towards camera
        const modelRotation: ModelRotation = {
          x: -pitch, // Negative to tilt component towards viewer
          y: yaw,
          z: 0
        }

        // Calculate optimal zoom distance based on component size and position
        const bbox = component.specifications?.bbox_m as [number, number, number] | undefined
        const [width = 0.05, height = 0.05, depth = 0.025] = bbox || []

        // Calculate component's largest dimension
        const componentSize = Math.max(width, height, depth)

        // Distance from center to component
        const distanceFromCenter = Math.sqrt(x * x + y * y + z * z)

        // Calculate camera distance based on:
        // 1. Component size (larger components need more distance)
        // 2. Distance from center (components far from center need more distance to see context)
        // 3. FOV consideration (60 degrees = ~1.04 radians, tan(fov/2) gives viewing angle)
        const fov = 60 * (Math.PI / 180) // Convert to radians
        const componentVisibleRatio = 0.4 // Component should fill 40% of view
        const baseCameraDistance = (componentSize / componentVisibleRatio) / Math.tan(fov / 2)

        // Add distance for scene context (see surrounding area)
        const contextPadding = Math.max(1.5, distanceFromCenter * 0.5)
        const cameraDistance = Math.max(2.0, baseCameraDistance + contextPadding)

        // Use a standard camera position for consistent viewing with calculated zoom
        const cameraView: CameraView = {
          position: [0, 0.5, cameraDistance], // Front view at calculated distance
          target: [0, 0.5, 0],
          fov: 60
        }

        set({
          selectedComponentId: componentId,
          cameraView,
          modelRotation,
          currentFocus: componentId
        })
      }
    },

    resetView: () => {
      set({
        currentCircuitPath: [],
        cameraView: DEFAULT_CAMERA_VIEW,
        modelRotation: DEFAULT_MODEL_ROTATION,
        selectedComponentId: null,
        hoveredComponentId: null,
        highlightedComponentIds: [],
        currentFocus: null
      })
    },

    setCurrentCircuitPath: (path) => set({ currentCircuitPath: path }),

    // Scene event execution
    executeSceneEvent: (event) => {
      const state = get()

      switch (event.type) {
        case 'focus_component': {
          const data = event.data as import('@/types/scene-events').FocusComponentData
          state.focusOnComponent(data.componentId)
          break
        }

        case 'highlight_components': {
          const data = event.data as import('@/types/scene-events').HighlightComponentsData
          state.setHighlightedComponents(data.componentIds)
          break
        }

        case 'show_path': {
          const data = event.data as import('@/types/scene-events').ShowPathData
          // Find path between components using NDJSON edges
          if (state.ndjsonData) {
            const path = findPathBetweenComponents(
              state.ndjsonData,
              data.fromComponentId,
              data.toComponentId
            )
            if (path) {
              state.setHighlightedComponents(path)
            }
          }
          break
        }

        case 'show_connections': {
          const data = event.data as import('@/types/scene-events').ShowConnectionsData
          // Show all directly connected components
          if (state.ndjsonData) {
            const connections = getComponentConnections(
              state.ndjsonData,
              data.componentId,
              data.depth || 1
            )
            state.setHighlightedComponents([data.componentId, ...connections])
            state.focusOnComponent(data.componentId)
          }
          break
        }

        case 'show_circuit': {
          const data = event.data as import('@/types/scene-events').ShowCircuitData
          state.setHighlightedComponents(data.componentIds)
          break
        }

        case 'reset_view': {
          state.resetView()
          break
        }

        case 'rotate_view': {
          const data = event.data as import('@/types/scene-events').RotateViewData
          state.setModelRotation(data.rotation)
          break
        }

        case 'zoom_to_area': {
          const data = event.data as import('@/types/scene-events').ZoomToAreaData
          // Find components in this zone
          if (state.ndjsonData && state.ndjsonData.byZone[data.zone]) {
            const zoneComponentIds = state.ndjsonData.byZone[data.zone].map(n => n.id)
            state.setHighlightedComponents(zoneComponentIds)
          }
          break
        }

        case 'compare_components': {
          const data = event.data as import('@/types/scene-events').CompareComponentsData
          state.setHighlightedComponents(data.componentIds)
          break
        }

        case 'show_ground_points': {
          // Find all ground points
          const groundComponents = state.components.filter(c =>
            c.type === 'ground_point' || c.type === 'ground_plane'
          )
          state.setHighlightedComponents(groundComponents.map(c => c.id))
          break
        }

        case 'mark_component_faulty': {
          const data = event.data as import('@/types/scene-events').MarkComponentFaultyData
          // Mark each component as faulty
          data.componentIds.forEach(componentId => {
            state.updateComponent(componentId, { faulty: true })
          })
          // Optionally highlight the faulty components
          state.setHighlightedComponents(data.componentIds)
          break
        }

        case 'mark_component_healthy': {
          const data = event.data as import('@/types/scene-events').MarkComponentHealthyData
          // Mark each component as healthy (not faulty)
          data.componentIds.forEach(componentId => {
            state.updateComponent(componentId, { faulty: false })
          })
          break
        }

        default:
          console.warn('[ModelStore] Unknown event type:', event.type)
      }

      set({ lastExecutedEvent: event })
    },

    queueSceneEvents: (events) => {
      set({
        eventQueue: {
          events,
          currentIndex: 0,
          isPlaying: false
        }
      })
    },

    playNextEvent: () => {
      const { eventQueue } = get()
      if (eventQueue.currentIndex < eventQueue.events.length) {
        const event = eventQueue.events[eventQueue.currentIndex]
        get().executeSceneEvent(event)
        set({
          eventQueue: {
            ...eventQueue,
            currentIndex: eventQueue.currentIndex + 1,
            isPlaying: eventQueue.currentIndex + 1 < eventQueue.events.length
          }
        })
      }
    },

    clearEventQueue: () => {
      set({
        eventQueue: {
          events: [],
          currentIndex: 0,
          isPlaying: false
        }
      })
    }
  }))
)

// Helper function to find path between components
function findPathBetweenComponents(
  ndjsonData: ParsedNDJSON,
  fromId: string,
  toId: string
): string[] | null {
  // BFS to find shortest path
  const queue: Array<{ id: string, path: string[] }> = [{ id: fromId, path: [fromId] }]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const { id, path } = queue.shift()!

    if (id === toId) {
      return path
    }

    if (visited.has(id)) continue
    visited.add(id)

    // Find all edges from this node
    const edges = ndjsonData.edges.filter(e => e.from === id || e.to === id)
    for (const edge of edges) {
      const nextId = edge.from === id ? edge.to : edge.from
      if (!visited.has(nextId)) {
        queue.push({ id: nextId, path: [...path, nextId] })
      }
    }
  }

  return null
}

// Helper function to get component connections
function getComponentConnections(
  ndjsonData: ParsedNDJSON,
  componentId: string,
  depth: number
): string[] {
  const connections = new Set<string>()
  const queue: Array<{ id: string, level: number }> = [{ id: componentId, level: 0 }]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const { id, level } = queue.shift()!

    if (level >= depth) continue
    if (visited.has(id)) continue
    visited.add(id)

    // Find all directly connected components
    const edges = ndjsonData.edges.filter(e => e.from === id || e.to === id)
    for (const edge of edges) {
      const connectedId = edge.from === id ? edge.to : edge.from
      connections.add(connectedId)
      if (level + 1 < depth) {
        queue.push({ id: connectedId, level: level + 1 })
      }
    }
  }

  return Array.from(connections)
}
