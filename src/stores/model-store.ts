import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import * as THREE from 'three'

export interface VehicleComponent {
  id: string
  name: string
  type: 'fuse' | 'relay' | 'sensor' | 'connector' | 'wire' | 'module' | 'other'
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

interface ModelState {
  // Model data
  modelPath: string | null
  components: VehicleComponent[]

  // View control
  cameraView: CameraView
  selectedComponentId: string | null
  hoveredComponentId: string | null
  highlightedComponentIds: string[]

  // AI control
  aiControlEnabled: boolean
  currentFocus: string | null // What the AI is currently explaining/showing

  // Actions
  setModelPath: (path: string) => void
  setComponents: (components: VehicleComponent[]) => void
  addComponent: (component: VehicleComponent) => void
  updateComponent: (id: string, updates: Partial<VehicleComponent>) => void
  removeComponent: (id: string) => void

  setCameraView: (view: CameraView) => void
  setSelectedComponent: (id: string | null) => void
  setHoveredComponent: (id: string | null) => void
  setHighlightedComponents: (ids: string[]) => void

  setAIControlEnabled: (enabled: boolean) => void
  setCurrentFocus: (focus: string | null) => void

  // Helper actions
  focusOnComponent: (componentId: string) => void
  resetView: () => void
}

const DEFAULT_CAMERA_VIEW: CameraView = {
  position: [8, 5, 8],
  target: [0, 0, 0],
  fov: 50
}

export const useModelStore = create<ModelState>()(
  subscribeWithSelector((set, get) => ({
    modelPath: '/models/pajero_pinin_2001.glb',
    components: [],

    cameraView: DEFAULT_CAMERA_VIEW,
    selectedComponentId: null,
    hoveredComponentId: null,
    highlightedComponentIds: [],

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

    setCameraView: (view) => set({ cameraView: view }),

    setSelectedComponent: (id) => set({ selectedComponentId: id }),

    setHoveredComponent: (id) => set({ hoveredComponentId: id }),

    setHighlightedComponents: (ids) => set({ highlightedComponentIds: ids }),

    setAIControlEnabled: (enabled) => set({ aiControlEnabled: enabled }),

    setCurrentFocus: (focus) => set({ currentFocus: focus }),

    focusOnComponent: (componentId) => {
      const component = get().components.find(c => c.id === componentId)
      if (component && component.position) {
        const [x, y, z] = component.position
        set({
          selectedComponentId: componentId,
          cameraView: {
            position: [x + 3, y + 2, z + 3],
            target: [x, y, z],
            fov: 50
          },
          currentFocus: componentId
        })
      }
    },

    resetView: () => set({
      cameraView: DEFAULT_CAMERA_VIEW,
      selectedComponentId: null,
      hoveredComponentId: null,
      highlightedComponentIds: [],
      currentFocus: null
    })
  }))
)
