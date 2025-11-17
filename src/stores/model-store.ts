import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import * as THREE from 'three'
import { type ParsedNDJSON } from '@/lib/ndjson-loader'

export interface VehicleComponent {
  id: string
  name: string
  type: 'fuse' | 'relay' | 'sensor' | 'connector' | 'wire' | 'module' | 'ground_point' | 'ground_plane' | 'bus' | 'splice' | 'pin' | 'other'
  position?: [number, number, number]
  description?: string
  specifications?: Record<string, any>
  connections?: string[] // IDs of connected components
  metadata?: Record<string, any>
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

  // AI control
  aiControlEnabled: boolean
  currentFocus: string | null // What the AI is currently explaining/showing

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

  setAIControlEnabled: (enabled: boolean) => void
  setCurrentFocus: (focus: string | null) => void

  // Helper actions
  focusOnComponent: (componentId: string) => void
  resetView: () => void
}

const DEFAULT_CAMERA_VIEW: CameraView = {
  position: [2, 1.5, 2],
  target: [0, 0, 0],
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

    aiControlEnabled: true,
    currentFocus: null,

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
      console.log('[ModelStore] setHighlightedComponents called with', ids.length, 'IDs')
      console.log('[ModelStore] IDs:', ids.slice(0, 10)) // Log first 10
      set({ highlightedComponentIds: ids })
    },

    setUserControllingCamera: (controlling) => set({ isUserControllingCamera: controlling }),

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
          position: [0, 0, cameraDistance], // Front view at calculated distance
          target: [0, 0, 0],
          fov: 60
        }

        set({
          selectedComponentId: componentId,
          cameraView,
          modelRotation,
          currentFocus: componentId,
          isUserControllingCamera: false // Reset when focusing on new component
        })
      }
    },

    resetView: () => {
      console.log('[ModelStore] Resetting view and clearing highlighted path')
      set({
        cameraView: DEFAULT_CAMERA_VIEW,
        modelRotation: DEFAULT_MODEL_ROTATION,
        selectedComponentId: null,
        hoveredComponentId: null,
        highlightedComponentIds: [],
        currentFocus: null
      })
    }
  }))
)
