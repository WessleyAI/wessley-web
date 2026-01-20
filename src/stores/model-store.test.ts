import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useModelStore, VehicleComponent, CameraView, ModelRotation, SceneNode } from './model-store'
import type { SceneEvent } from '@/types/scene-events'
import type { ParsedNDJSON, NDJSONNode, NDJSONEdge } from '@/lib/ndjson-loader'

function createMockComponent(overrides: Partial<VehicleComponent> = {}): VehicleComponent {
  return {
    id: 'comp-1',
    name: 'Test Component',
    type: 'relay',
    position: [0, 0, 0],
    description: 'A test component',
    specifications: {},
    connections: [],
    metadata: {},
    faulty: false,
    ...overrides,
  }
}

function createMockSceneNode(overrides: Partial<SceneNode> = {}): SceneNode {
  return {
    id: 'node-1',
    name: 'Test Node',
    type: 'Mesh',
    children: [],
    position: [0, 0, 0],
    ...overrides,
  }
}

function createMockNDJSONData(overrides: Partial<ParsedNDJSON> = {}): ParsedNDJSON {
  return {
    nodesById: {
      'node-1': { kind: 'node', id: 'node-1', node_type: 'relay', anchor_zone: 'engine_bay' },
      'node-2': { kind: 'node', id: 'node-2', node_type: 'fuse', anchor_zone: 'dashboard' },
      'node-3': { kind: 'node', id: 'node-3', node_type: 'sensor', anchor_zone: 'engine_bay' },
    } as Record<string, NDJSONNode>,
    edges: [
      { kind: 'edge', source: 'node-1', target: 'node-2', from: 'node-1', to: 'node-2' },
      { kind: 'edge', source: 'node-2', target: 'node-3', from: 'node-2', to: 'node-3' },
    ] as NDJSONEdge[],
    byZone: {
      engine_bay: ['node-1', 'node-3'],
      dashboard: ['node-2'],
    },
    byType: {
      relay: ['node-1'],
      fuse: ['node-2'],
      sensor: ['node-3'],
    },
    metadata: null,
    ...overrides,
  }
}

function createMockSceneEvent(overrides: Partial<SceneEvent> = {}): SceneEvent {
  return {
    type: 'focus_component',
    data: { componentId: 'comp-1' },
    timestamp: Date.now(),
    ...overrides,
  }
}

describe('useModelStore', () => {
  beforeEach(() => {
    useModelStore.setState({
      modelPath: '/models/pajero_pinin_2001.glb',
      components: [],
      sceneGraph: null,
      ndjsonData: null,
      cameraView: { position: [2, 1.5, 2], target: [0, 0.5, 0], fov: 60 },
      modelRotation: { x: 0, y: 0, z: 0 },
      selectedComponentId: null,
      hoveredComponentId: null,
      highlightedComponentIds: [],
      isUserControllingCamera: false,
      showChassis: true,
      showEffects: true,
      showModels: true,
      aiControlEnabled: true,
      currentFocus: null,
      eventQueue: { events: [], currentIndex: 0, isPlaying: false },
      lastExecutedEvent: null,
      currentCircuitPath: [],
    })
  })

  describe('setModelPath', () => {
    it('sets the model path', () => {
      useModelStore.getState().setModelPath('/models/new-model.glb')
      expect(useModelStore.getState().modelPath).toBe('/models/new-model.glb')
    })
  })

  describe('setComponents', () => {
    it('replaces all components', () => {
      const components = [
        createMockComponent({ id: 'comp-1' }),
        createMockComponent({ id: 'comp-2' }),
      ]
      useModelStore.getState().setComponents(components)
      expect(useModelStore.getState().components.length).toBe(2)
    })

    it('clears components when set to empty array', () => {
      useModelStore.setState({ components: [createMockComponent()] })
      useModelStore.getState().setComponents([])
      expect(useModelStore.getState().components).toEqual([])
    })
  })

  describe('addComponent', () => {
    it('appends component to existing components', () => {
      useModelStore.setState({ components: [createMockComponent({ id: 'comp-1' })] })
      useModelStore.getState().addComponent(createMockComponent({ id: 'comp-2' }))
      expect(useModelStore.getState().components.length).toBe(2)
      expect(useModelStore.getState().components[1].id).toBe('comp-2')
    })
  })

  describe('updateComponent', () => {
    it('updates component by ID', () => {
      useModelStore.setState({
        components: [createMockComponent({ id: 'comp-1', name: 'Original' })],
      })
      useModelStore.getState().updateComponent('comp-1', { name: 'Updated' })
      expect(useModelStore.getState().components[0].name).toBe('Updated')
    })

    it('does not modify other components', () => {
      useModelStore.setState({
        components: [
          createMockComponent({ id: 'comp-1' }),
          createMockComponent({ id: 'comp-2', name: 'Other' }),
        ],
      })
      useModelStore.getState().updateComponent('comp-1', { name: 'Updated' })
      expect(useModelStore.getState().components[1].name).toBe('Other')
    })

    it('handles non-existent component ID gracefully', () => {
      useModelStore.setState({ components: [createMockComponent({ id: 'comp-1' })] })
      useModelStore.getState().updateComponent('non-existent', { name: 'New' })
      expect(useModelStore.getState().components.length).toBe(1)
      expect(useModelStore.getState().components[0].name).toBe('Test Component')
    })
  })

  describe('removeComponent', () => {
    it('removes component by ID', () => {
      useModelStore.setState({
        components: [
          createMockComponent({ id: 'comp-1' }),
          createMockComponent({ id: 'comp-2' }),
        ],
      })
      useModelStore.getState().removeComponent('comp-1')
      expect(useModelStore.getState().components.length).toBe(1)
      expect(useModelStore.getState().components[0].id).toBe('comp-2')
    })

    it('clears selectedComponentId if it matches removed component', () => {
      useModelStore.setState({
        components: [createMockComponent({ id: 'comp-1' })],
        selectedComponentId: 'comp-1',
      })
      useModelStore.getState().removeComponent('comp-1')
      expect(useModelStore.getState().selectedComponentId).toBeNull()
    })

    it('preserves selectedComponentId if it does not match removed component', () => {
      useModelStore.setState({
        components: [
          createMockComponent({ id: 'comp-1' }),
          createMockComponent({ id: 'comp-2' }),
        ],
        selectedComponentId: 'comp-2',
      })
      useModelStore.getState().removeComponent('comp-1')
      expect(useModelStore.getState().selectedComponentId).toBe('comp-2')
    })
  })

  describe('setSceneGraph', () => {
    it('sets the scene graph', () => {
      const sceneGraph = createMockSceneNode()
      useModelStore.getState().setSceneGraph(sceneGraph)
      expect(useModelStore.getState().sceneGraph).toEqual(sceneGraph)
    })

    it('can set scene graph to null', () => {
      useModelStore.setState({ sceneGraph: createMockSceneNode() })
      useModelStore.getState().setSceneGraph(null)
      expect(useModelStore.getState().sceneGraph).toBeNull()
    })
  })

  describe('setNDJSONData', () => {
    it('sets NDJSON data', () => {
      const ndjsonData = createMockNDJSONData()
      useModelStore.getState().setNDJSONData(ndjsonData)
      expect(useModelStore.getState().ndjsonData).toEqual(ndjsonData)
    })

    it('can set NDJSON data to null', () => {
      useModelStore.setState({ ndjsonData: createMockNDJSONData() })
      useModelStore.getState().setNDJSONData(null)
      expect(useModelStore.getState().ndjsonData).toBeNull()
    })
  })

  describe('setCameraView', () => {
    it('sets camera view', () => {
      const cameraView: CameraView = { position: [5, 5, 5], target: [0, 0, 0], fov: 45 }
      useModelStore.getState().setCameraView(cameraView)
      expect(useModelStore.getState().cameraView).toEqual(cameraView)
    })
  })

  describe('setModelRotation', () => {
    it('sets model rotation', () => {
      const rotation: ModelRotation = { x: 45, y: 90, z: 0 }
      useModelStore.getState().setModelRotation(rotation)
      expect(useModelStore.getState().modelRotation).toEqual(rotation)
    })
  })

  describe('setSelectedComponent', () => {
    it('sets selected component ID', () => {
      useModelStore.getState().setSelectedComponent('comp-1')
      expect(useModelStore.getState().selectedComponentId).toBe('comp-1')
    })

    it('can set selected component to null', () => {
      useModelStore.setState({ selectedComponentId: 'comp-1' })
      useModelStore.getState().setSelectedComponent(null)
      expect(useModelStore.getState().selectedComponentId).toBeNull()
    })
  })

  describe('setHoveredComponent', () => {
    it('sets hovered component ID', () => {
      useModelStore.getState().setHoveredComponent('comp-1')
      expect(useModelStore.getState().hoveredComponentId).toBe('comp-1')
    })

    it('can set hovered component to null', () => {
      useModelStore.setState({ hoveredComponentId: 'comp-1' })
      useModelStore.getState().setHoveredComponent(null)
      expect(useModelStore.getState().hoveredComponentId).toBeNull()
    })
  })

  describe('setHighlightedComponents', () => {
    it('sets highlighted component IDs', () => {
      useModelStore.getState().setHighlightedComponents(['comp-1', 'comp-2'])
      expect(useModelStore.getState().highlightedComponentIds).toEqual(['comp-1', 'comp-2'])
    })

    it('clears highlighted components when set to empty array', () => {
      useModelStore.setState({ highlightedComponentIds: ['comp-1'] })
      useModelStore.getState().setHighlightedComponents([])
      expect(useModelStore.getState().highlightedComponentIds).toEqual([])
    })
  })

  describe('setUserControllingCamera', () => {
    it('sets user controlling camera flag', () => {
      useModelStore.getState().setUserControllingCamera(true)
      expect(useModelStore.getState().isUserControllingCamera).toBe(true)
    })
  })

  describe('visibility toggles', () => {
    it('setShowChassis toggles chassis visibility', () => {
      useModelStore.getState().setShowChassis(false)
      expect(useModelStore.getState().showChassis).toBe(false)
    })

    it('setShowEffects toggles effects visibility', () => {
      useModelStore.getState().setShowEffects(false)
      expect(useModelStore.getState().showEffects).toBe(false)
    })

    it('setShowModels toggles models visibility', () => {
      useModelStore.getState().setShowModels(false)
      expect(useModelStore.getState().showModels).toBe(false)
    })
  })

  describe('AI control', () => {
    it('setAIControlEnabled sets AI control flag', () => {
      useModelStore.getState().setAIControlEnabled(false)
      expect(useModelStore.getState().aiControlEnabled).toBe(false)
    })

    it('setCurrentFocus sets current focus', () => {
      useModelStore.getState().setCurrentFocus('comp-1')
      expect(useModelStore.getState().currentFocus).toBe('comp-1')
    })

    it('setCurrentFocus can set to null', () => {
      useModelStore.setState({ currentFocus: 'comp-1' })
      useModelStore.getState().setCurrentFocus(null)
      expect(useModelStore.getState().currentFocus).toBeNull()
    })
  })

  describe('setCurrentCircuitPath', () => {
    it('sets current circuit path', () => {
      useModelStore.getState().setCurrentCircuitPath(['comp-1', 'comp-2', 'comp-3'])
      expect(useModelStore.getState().currentCircuitPath).toEqual(['comp-1', 'comp-2', 'comp-3'])
    })

    it('clears circuit path when set to empty array', () => {
      useModelStore.setState({ currentCircuitPath: ['comp-1'] })
      useModelStore.getState().setCurrentCircuitPath([])
      expect(useModelStore.getState().currentCircuitPath).toEqual([])
    })
  })

  describe('focusOnComponent', () => {
    it('focuses on component with position', () => {
      useModelStore.setState({
        components: [createMockComponent({ id: 'comp-1', position: [1, 2, 3] })],
      })
      useModelStore.getState().focusOnComponent('comp-1')
      expect(useModelStore.getState().selectedComponentId).toBe('comp-1')
      expect(useModelStore.getState().currentFocus).toBe('comp-1')
    })

    it('does nothing if component not found', () => {
      useModelStore.setState({
        components: [createMockComponent({ id: 'comp-1' })],
        selectedComponentId: null,
      })
      useModelStore.getState().focusOnComponent('non-existent')
      expect(useModelStore.getState().selectedComponentId).toBeNull()
    })

    it('does nothing if component has no position', () => {
      useModelStore.setState({
        components: [createMockComponent({ id: 'comp-1', position: undefined })],
        selectedComponentId: null,
      })
      useModelStore.getState().focusOnComponent('comp-1')
      expect(useModelStore.getState().selectedComponentId).toBeNull()
    })

    it('calculates camera distance based on component bbox', () => {
      useModelStore.setState({
        components: [
          createMockComponent({
            id: 'comp-1',
            position: [0, 0, 1],
            specifications: { bbox_m: [0.1, 0.1, 0.1] },
          }),
        ],
      })
      useModelStore.getState().focusOnComponent('comp-1')
      const { cameraView } = useModelStore.getState()
      expect(cameraView.position[2]).toBeGreaterThan(0)
    })
  })

  describe('resetView', () => {
    it('resets all view state to defaults', () => {
      useModelStore.setState({
        currentCircuitPath: ['comp-1', 'comp-2'],
        cameraView: { position: [5, 5, 5], target: [1, 1, 1], fov: 45 },
        modelRotation: { x: 45, y: 90, z: 180 },
        selectedComponentId: 'comp-1',
        hoveredComponentId: 'comp-2',
        highlightedComponentIds: ['comp-1', 'comp-2'],
        currentFocus: 'comp-1',
      })

      useModelStore.getState().resetView()

      const state = useModelStore.getState()
      expect(state.currentCircuitPath).toEqual([])
      expect(state.cameraView).toEqual({ position: [2, 1.5, 2], target: [0, 0.5, 0], fov: 60 })
      expect(state.modelRotation).toEqual({ x: 0, y: 0, z: 0 })
      expect(state.selectedComponentId).toBeNull()
      expect(state.hoveredComponentId).toBeNull()
      expect(state.highlightedComponentIds).toEqual([])
      expect(state.currentFocus).toBeNull()
    })
  })

  describe('executeSceneEvent', () => {
    it('handles focus_component event', () => {
      useModelStore.setState({
        components: [createMockComponent({ id: 'comp-1', position: [1, 0, 0] })],
      })
      const event = createMockSceneEvent({
        type: 'focus_component',
        data: { componentId: 'comp-1' },
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(useModelStore.getState().selectedComponentId).toBe('comp-1')
      expect(useModelStore.getState().lastExecutedEvent).toEqual(event)
    })

    it('handles highlight_components event', () => {
      const event = createMockSceneEvent({
        type: 'highlight_components',
        data: { componentIds: ['comp-1', 'comp-2'] },
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(useModelStore.getState().highlightedComponentIds).toEqual(['comp-1', 'comp-2'])
    })

    it('handles show_path event with NDJSON data', () => {
      useModelStore.setState({ ndjsonData: createMockNDJSONData() })
      const event = createMockSceneEvent({
        type: 'show_path',
        data: { fromComponentId: 'node-1', toComponentId: 'node-3' },
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(useModelStore.getState().highlightedComponentIds.length).toBeGreaterThan(0)
    })

    it('handles show_connections event with NDJSON data', () => {
      useModelStore.setState({
        ndjsonData: createMockNDJSONData(),
        components: [createMockComponent({ id: 'node-1', position: [0, 0, 0] })],
      })
      const event = createMockSceneEvent({
        type: 'show_connections',
        data: { componentId: 'node-1', depth: 1 },
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(useModelStore.getState().highlightedComponentIds).toContain('node-1')
    })

    it('handles show_circuit event', () => {
      const event = createMockSceneEvent({
        type: 'show_circuit',
        data: { circuitName: 'test', componentIds: ['comp-1', 'comp-2'] },
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(useModelStore.getState().highlightedComponentIds).toEqual(['comp-1', 'comp-2'])
    })

    it('handles reset_view event', () => {
      useModelStore.setState({
        selectedComponentId: 'comp-1',
        highlightedComponentIds: ['comp-1'],
      })
      const event = createMockSceneEvent({
        type: 'reset_view',
        data: {},
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(useModelStore.getState().selectedComponentId).toBeNull()
      expect(useModelStore.getState().highlightedComponentIds).toEqual([])
    })

    it('handles rotate_view event', () => {
      const event = createMockSceneEvent({
        type: 'rotate_view',
        data: { rotation: { x: 45, y: 90, z: 0 } },
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(useModelStore.getState().modelRotation).toEqual({ x: 45, y: 90, z: 0 })
    })

    it('handles zoom_to_area event with NDJSON data', () => {
      useModelStore.setState({ ndjsonData: createMockNDJSONData() })
      const event = createMockSceneEvent({
        type: 'zoom_to_area',
        data: { zone: 'engine_bay' },
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(useModelStore.getState().highlightedComponentIds).toContain('node-1')
      expect(useModelStore.getState().highlightedComponentIds).toContain('node-3')
    })

    it('handles compare_components event', () => {
      const event = createMockSceneEvent({
        type: 'compare_components',
        data: { componentIds: ['comp-1', 'comp-2'] },
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(useModelStore.getState().highlightedComponentIds).toEqual(['comp-1', 'comp-2'])
    })

    it('handles show_ground_points event', () => {
      useModelStore.setState({
        components: [
          createMockComponent({ id: 'ground-1', type: 'ground_point' }),
          createMockComponent({ id: 'ground-2', type: 'ground_plane' }),
          createMockComponent({ id: 'other', type: 'relay' }),
        ],
      })
      const event = createMockSceneEvent({
        type: 'show_ground_points',
        data: {},
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(useModelStore.getState().highlightedComponentIds).toContain('ground-1')
      expect(useModelStore.getState().highlightedComponentIds).toContain('ground-2')
      expect(useModelStore.getState().highlightedComponentIds).not.toContain('other')
    })

    it('handles mark_component_faulty event', () => {
      useModelStore.setState({
        components: [
          createMockComponent({ id: 'comp-1', faulty: false }),
          createMockComponent({ id: 'comp-2', faulty: false }),
        ],
      })
      const event = createMockSceneEvent({
        type: 'mark_component_faulty',
        data: { componentIds: ['comp-1'] },
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(useModelStore.getState().components[0].faulty).toBe(true)
      expect(useModelStore.getState().components[1].faulty).toBe(false)
      expect(useModelStore.getState().highlightedComponentIds).toContain('comp-1')
    })

    it('handles mark_component_healthy event', () => {
      useModelStore.setState({
        components: [
          createMockComponent({ id: 'comp-1', faulty: true }),
          createMockComponent({ id: 'comp-2', faulty: true }),
        ],
      })
      const event = createMockSceneEvent({
        type: 'mark_component_healthy',
        data: { componentIds: ['comp-1'] },
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(useModelStore.getState().components[0].faulty).toBe(false)
      expect(useModelStore.getState().components[1].faulty).toBe(true)
    })

    it('warns on unknown event type', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const event = createMockSceneEvent({
        type: 'unknown_type' as any,
        data: {},
      })
      useModelStore.getState().executeSceneEvent(event)
      expect(warnSpy).toHaveBeenCalledWith('[ModelStore] Unknown event type:', 'unknown_type')
      warnSpy.mockRestore()
    })
  })

  describe('queueSceneEvents', () => {
    it('queues multiple events', () => {
      const events = [
        createMockSceneEvent({ type: 'focus_component', data: { componentId: 'comp-1' } }),
        createMockSceneEvent({ type: 'highlight_components', data: { componentIds: ['comp-2'] } }),
      ]
      useModelStore.getState().queueSceneEvents(events)
      expect(useModelStore.getState().eventQueue.events).toEqual(events)
      expect(useModelStore.getState().eventQueue.currentIndex).toBe(0)
      expect(useModelStore.getState().eventQueue.isPlaying).toBe(false)
    })
  })

  describe('playNextEvent', () => {
    it('executes next event in queue', () => {
      useModelStore.setState({
        components: [createMockComponent({ id: 'comp-1', position: [0, 0, 0] })],
        eventQueue: {
          events: [
            createMockSceneEvent({ type: 'focus_component', data: { componentId: 'comp-1' } }),
          ],
          currentIndex: 0,
          isPlaying: false,
        },
      })
      useModelStore.getState().playNextEvent()
      expect(useModelStore.getState().selectedComponentId).toBe('comp-1')
      expect(useModelStore.getState().eventQueue.currentIndex).toBe(1)
    })

    it('sets isPlaying to true if more events remain', () => {
      useModelStore.setState({
        eventQueue: {
          events: [
            createMockSceneEvent({ type: 'reset_view', data: {} }),
            createMockSceneEvent({ type: 'reset_view', data: {} }),
          ],
          currentIndex: 0,
          isPlaying: false,
        },
      })
      useModelStore.getState().playNextEvent()
      expect(useModelStore.getState().eventQueue.isPlaying).toBe(true)
    })

    it('sets isPlaying to false when queue exhausted', () => {
      useModelStore.setState({
        eventQueue: {
          events: [createMockSceneEvent({ type: 'reset_view', data: {} })],
          currentIndex: 0,
          isPlaying: true,
        },
      })
      useModelStore.getState().playNextEvent()
      expect(useModelStore.getState().eventQueue.isPlaying).toBe(false)
    })

    it('does nothing when queue is empty', () => {
      useModelStore.setState({
        eventQueue: {
          events: [],
          currentIndex: 0,
          isPlaying: false,
        },
      })
      useModelStore.getState().playNextEvent()
      expect(useModelStore.getState().lastExecutedEvent).toBeNull()
    })
  })

  describe('clearEventQueue', () => {
    it('clears event queue', () => {
      useModelStore.setState({
        eventQueue: {
          events: [createMockSceneEvent()],
          currentIndex: 5,
          isPlaying: true,
        },
      })
      useModelStore.getState().clearEventQueue()
      expect(useModelStore.getState().eventQueue).toEqual({
        events: [],
        currentIndex: 0,
        isPlaying: false,
      })
    })
  })

  describe('initial state', () => {
    it('has correct default values', () => {
      const state = useModelStore.getState()
      expect(state.modelPath).toBe('/models/pajero_pinin_2001.glb')
      expect(state.components).toEqual([])
      expect(state.sceneGraph).toBeNull()
      expect(state.ndjsonData).toBeNull()
      expect(state.showChassis).toBe(true)
      expect(state.showEffects).toBe(true)
      expect(state.showModels).toBe(true)
      expect(state.aiControlEnabled).toBe(true)
      expect(state.currentCircuitPath).toEqual([])
    })
  })
})
