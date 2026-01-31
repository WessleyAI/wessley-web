import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SEMANTIC_SERVICE_URL = process.env.SEMANTIC_SERVICE_URL || 'http://localhost:8003'

export interface SearchResultItem {
  id: string
  title: string
  description?: string
  type: 'person' | 'project' | 'workspace' | 'part' | 'component' | 'document'
  url?: string
  score?: number
}

export interface SearchResponse {
  results: SearchResultItem[]
  query: string
  total: number
  processing_time_ms: number
}

export async function POST(request: Request) {
  try {
    const { query, limit = 10, types } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const searchQuery = query.trim().toLowerCase()
    if (searchQuery.length < 2) {
      return NextResponse.json({
        results: [],
        query,
        total: 0,
        processing_time_ms: 0
      })
    }

    const startTime = Date.now()
    const results: SearchResultItem[] = []

    // Get Supabase client for user data queries
    const supabase = await createClient()

    // Determine which types to search (default: all)
    const searchTypes = types || ['person', 'workspace', 'component', 'document']

    // Parallel search across multiple sources
    const searchPromises: Promise<SearchResultItem[]>[] = []

    // 1. Search People (Supabase profiles table)
    if (searchTypes.includes('person')) {
      searchPromises.push(
        searchPeople(supabase, searchQuery, Math.min(limit, 5))
      )
    }

    // 2. Search Workspaces (Supabase workspaces table)
    if (searchTypes.includes('workspace')) {
      searchPromises.push(
        searchWorkspaces(supabase, searchQuery, Math.min(limit, 5))
      )
    }

    // 3. Search Components/Documents via Semantic Service
    if (searchTypes.includes('component') || searchTypes.includes('document')) {
      searchPromises.push(
        searchSemanticService(searchQuery, Math.min(limit, 10))
      )
    }

    // Wait for all searches to complete
    const searchResults = await Promise.allSettled(searchPromises)

    // Collect successful results
    for (const result of searchResults) {
      if (result.status === 'fulfilled') {
        results.push(...result.value)
      }
    }

    // Sort by score (higher first) and limit total results
    results.sort((a, b) => (b.score || 0) - (a.score || 0))
    const limitedResults = results.slice(0, limit)

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      results: limitedResults,
      query,
      total: limitedResults.length,
      processing_time_ms: processingTime
    })
  } catch (error) {
    console.error('[API /search] Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function searchPeople(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  limit: number
): Promise<SearchResultItem[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, bio, avatar_url')
      .or(`display_name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      console.error('[API /search] People search error:', error)
      return []
    }

    return (data || []).map((profile) => ({
      id: `person-${profile.id}`,
      title: profile.display_name || profile.username || 'Unknown User',
      description: profile.bio || undefined,
      type: 'person' as const,
      url: `/users/${profile.username || profile.id}`,
      score: calculateTextMatchScore(query, [profile.display_name, profile.username, profile.bio])
    }))
  } catch (error) {
    console.error('[API /search] People search failed:', error)
    return []
  }
}

async function searchWorkspaces(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  limit: number
): Promise<SearchResultItem[]> {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('id, name, description, visibility')
      .eq('visibility', 'public')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      console.error('[API /search] Workspace search error:', error)
      return []
    }

    return (data || []).map((workspace) => ({
      id: `workspace-${workspace.id}`,
      title: workspace.name,
      description: workspace.description || undefined,
      type: 'workspace' as const,
      url: `/g/${workspace.id}/project`,
      score: calculateTextMatchScore(query, [workspace.name, workspace.description])
    }))
  } catch (error) {
    console.error('[API /search] Workspace search failed:', error)
    return []
  }
}

async function searchSemanticService(
  query: string,
  limit: number
): Promise<SearchResultItem[]> {
  try {
    const response = await fetch(`${SEMANTIC_SERVICE_URL}/search/universal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        limit,
        threshold: 0.5
      }),
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      console.error('[API /search] Semantic service error:', response.status)
      return []
    }

    const data = await response.json()

    return (data.results || []).map((result: {
      id: string
      content: string
      score: number
      metadata?: {
        source?: string
        chapter?: string
        component_type?: string
        page?: number
      }
    }) => {
      const isComponent = result.metadata?.component_type !== undefined
      const title = result.metadata?.chapter ||
                   result.metadata?.component_type ||
                   result.content.slice(0, 50) + '...'

      return {
        id: `semantic-${result.id}`,
        title,
        description: result.content.slice(0, 100) + (result.content.length > 100 ? '...' : ''),
        type: isComponent ? 'component' as const : 'document' as const,
        url: result.metadata?.source ? `/docs/${encodeURIComponent(result.metadata.source)}` : undefined,
        score: result.score
      }
    })
  } catch (error) {
    // Semantic service may not be running - gracefully handle
    if (error instanceof Error && error.name !== 'TimeoutError') {
      console.error('[API /search] Semantic service failed:', error.message)
    }
    return []
  }
}

function calculateTextMatchScore(query: string, fields: (string | null | undefined)[]): number {
  const normalizedQuery = query.toLowerCase()
  let maxScore = 0

  for (const field of fields) {
    if (!field) continue
    const normalizedField = field.toLowerCase()

    // Exact match gets highest score
    if (normalizedField === normalizedQuery) {
      return 1.0
    }

    // Starts with query gets high score
    if (normalizedField.startsWith(normalizedQuery)) {
      maxScore = Math.max(maxScore, 0.9)
    }

    // Contains query gets medium score
    if (normalizedField.includes(normalizedQuery)) {
      maxScore = Math.max(maxScore, 0.7)
    }

    // Word match gets lower score
    const words = normalizedField.split(/\s+/)
    if (words.some(word => word.startsWith(normalizedQuery))) {
      maxScore = Math.max(maxScore, 0.5)
    }
  }

  return maxScore
}
