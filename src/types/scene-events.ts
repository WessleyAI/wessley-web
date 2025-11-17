/**
 * Scene Event System
 * Defines all possible interactions between chat and the 3D scene
 */

export type SceneEventType =
  | 'focus_component'      // Focus camera on specific component
  | 'highlight_components' // Highlight one or more components
  | 'show_path'           // Show electrical path between components
  | 'show_circuit'        // Show complete circuit for a system
  | 'rotate_view'         // Rotate model to specific angle
  | 'zoom_to_area'        // Zoom to specific area/zone
  | 'reset_view'          // Reset camera to default position
  | 'show_connections'    // Show all connections for a component
  | 'compare_components'  // Show multiple components for comparison
  | 'show_ground_points'  // Highlight all ground points
  | 'show_power_distribution' // Show power distribution from battery
  | 'animate_signal_flow' // Animate signal/power flow through circuit
  | 'mark_component_faulty' // Mark component(s) as faulty/not working
  | 'mark_component_healthy' // Mark component(s) as healthy/working

export interface SceneEvent {
  type: SceneEventType
  data: SceneEventData
  description?: string // Human-readable description of what's happening
  timestamp: number
}

export type SceneEventData =
  | FocusComponentData
  | HighlightComponentsData
  | ShowPathData
  | ShowCircuitData
  | RotateViewData
  | ZoomToAreaData
  | ResetViewData
  | ShowConnectionsData
  | CompareComponentsData
  | ShowGroundPointsData
  | ShowPowerDistributionData
  | AnimateSignalFlowData
  | MarkComponentFaultyData
  | MarkComponentHealthyData

export interface FocusComponentData {
  componentId: string
  componentName?: string
}

export interface HighlightComponentsData {
  componentIds: string[]
  color?: string // Optional color for highlighting
  duration?: number // How long to highlight (ms), undefined = until next action
}

export interface ShowPathData {
  fromComponentId: string
  toComponentId: string
  pathType?: 'power' | 'ground' | 'signal' | 'data'
}

export interface ShowCircuitData {
  circuitName: string // e.g., "window_actuator_circuit", "headlight_circuit"
  componentIds: string[]
}

export interface RotateViewData {
  rotation: {
    x: number
    y: number
    z: number
  }
  animate?: boolean // Smooth animation vs instant
  duration?: number // Animation duration (ms)
}

export interface ZoomToAreaData {
  zone: string // e.g., "dashboard", "engine_bay", "door_left_front"
  boundingBox?: {
    min: [number, number, number]
    max: [number, number, number]
  }
}

export interface ResetViewData {
  animate?: boolean
}

export interface ShowConnectionsData {
  componentId: string
  depth?: number // How many levels of connections to show (1 = direct, 2 = includes connections of connections)
}

export interface CompareComponentsData {
  componentIds: string[]
  highlightDifferences?: boolean
}

export interface ShowGroundPointsData {
  filter?: {
    zone?: string
    quality?: 'good' | 'poor' | 'all'
  }
}

export interface ShowPowerDistributionData {
  fromComponent?: string // Default: battery
  maxDepth?: number // How many levels to show
}

export interface AnimateSignalFlowData {
  path: string[] // Array of component IDs representing the signal flow
  speed?: number // Animation speed (1 = normal, 2 = 2x, etc.)
  color?: string
}

export interface MarkComponentFaultyData {
  componentIds: string[] // Component IDs to mark as faulty
  reason?: string // Optional reason why component is faulty
}

export interface MarkComponentHealthyData {
  componentIds: string[] // Component IDs to mark as healthy/working
}

/**
 * Helper type for chat messages that include scene events
 */
export interface ChatMessageWithEvents {
  id: string
  content: string
  role: 'user' | 'assistant'
  sceneEvents?: SceneEvent[]
  created_at: string
}

/**
 * Event queue for managing multiple scene events
 */
export interface SceneEventQueue {
  events: SceneEvent[]
  currentIndex: number
  isPlaying: boolean
}
