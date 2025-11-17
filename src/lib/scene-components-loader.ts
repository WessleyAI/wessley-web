/**
 * Scene Components Loader
 * Loads NDJSON component data and formats it for GPT context
 */

import { loadNDJSON, type ParsedNDJSON, type NDJSONNode } from './ndjson-loader'

interface ComponentSummary {
  id: string
  canonicalId: string
  type: string
  zone?: string
  description?: string
}

/**
 * Load and summarize components from NDJSON for GPT context
 * Returns a concise list of components with their IDs and metadata
 */
export async function loadSceneComponents(): Promise<{
  components: ComponentSummary[]
  zones: string[]
  totalComponents: number
}> {
  try {
    const ndjsonData = await loadNDJSON('/models/enhanced_model.ndjson')

    // Extract positioned components (those with anchor_xyz)
    const positionedNodes = Object.values(ndjsonData.nodesById).filter(
      node => node.anchor_xyz && node.anchor_xyz.length === 3
    )

    // Create component summaries
    const components: ComponentSummary[] = positionedNodes.map(node => ({
      id: node.id,
      canonicalId: node.canonical_id || node.id,
      type: node.node_type || 'unknown',
      zone: node.anchor_zone,
      description: node.code_id
    }))

    // Get unique zones
    const zones = Object.keys(ndjsonData.byZone)

    return {
      components,
      zones,
      totalComponents: components.length
    }
  } catch (error) {
    console.error('[SceneComponentsLoader] Failed to load components:', error)
    return {
      components: [],
      zones: [],
      totalComponents: 0
    }
  }
}

/**
 * Format component list for GPT system prompt
 * Groups components by type and zone for better readability
 */
export function formatComponentsForGPT(data: {
  components: ComponentSummary[]
  zones: string[]
}): string {
  const { components, zones } = data

  // Group components by type
  const byType: Record<string, ComponentSummary[]> = {}
  components.forEach(comp => {
    if (!byType[comp.type]) {
      byType[comp.type] = []
    }
    byType[comp.type].push(comp)
  })

  let output = `\n## Available Scene Components (${components.length} total)\n\n`

  // List zones
  output += `### Zones:\n${zones.map(z => `- ${z}`).join('\n')}\n\n`

  // List components by type (limit to avoid token overflow)
  output += `### Components by Type:\n`

  const priorityTypes = ['fuse', 'relay', 'connector', 'sensor', 'module', 'wire', 'ground_point']
  const typesToShow = priorityTypes.filter(type => byType[type])

  typesToShow.forEach(type => {
    const comps = byType[type]
    output += `\n**${type.toUpperCase()}** (${comps.length}):\n`

    // Show first 10 of each type to keep prompt manageable
    comps.slice(0, 10).forEach(comp => {
      output += `- ID: \`${comp.id}\` | Name: ${comp.canonicalId}`
      if (comp.zone) output += ` | Zone: ${comp.zone}`
      if (comp.description) output += ` | ${comp.description}`
      output += '\n'
    })

    if (comps.length > 10) {
      output += `  ... and ${comps.length - 10} more\n`
    }
  })

  output += `\n### Usage Instructions:\n`
  output += `- Use the exact component ID (e.g., \`${components[0]?.id}\`) in scene events\n`
  output += `- To find a component, search by canonical_id, type, or zone\n`
  output += `- For multiple components, use partial matching (e.g., all components with type "fuse")\n`

  return output
}

/**
 * Cache for loaded components (avoid reloading on every request)
 */
let cachedComponents: {
  components: ComponentSummary[]
  zones: string[]
  totalComponents: number
  formatted: string
} | null = null

let loadPromise: Promise<any> | null = null

/**
 * Get component data with caching
 */
export async function getSceneComponentsForGPT(): Promise<string> {
  // If already cached, return immediately
  if (cachedComponents) {
    return cachedComponents.formatted
  }

  // If currently loading, wait for the existing promise
  if (loadPromise) {
    await loadPromise
    return cachedComponents?.formatted || ''
  }

  // Start loading
  loadPromise = (async () => {
    const data = await loadSceneComponents()
    const formatted = formatComponentsForGPT(data)

    cachedComponents = {
      ...data,
      formatted
    }

    loadPromise = null
  })()

  await loadPromise
  return cachedComponents?.formatted || ''
}
