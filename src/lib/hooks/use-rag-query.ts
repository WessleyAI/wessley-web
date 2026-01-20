'use client'

import { useState, useCallback } from 'react'
import type { RAGQueryRequest, RAGQueryResponse } from '@/app/api/rag/query/route'

interface UseRAGQueryOptions {
  onError?: (error: Error) => void
}

interface UseRAGQueryReturn {
  queryRAG: (params: RAGQueryRequest & { workspaceId?: string }) => Promise<RAGQueryResponse | null>
  isLoading: boolean
  error: Error | null
  lastResult: RAGQueryResponse | null
}

/**
 * Hook for querying RAG context to enhance chat messages
 *
 * Usage:
 * ```tsx
 * const { queryRAG, isLoading } = useRAGQuery()
 *
 * const handleSubmit = async () => {
 *   const ragContext = await queryRAG({
 *     query: userMessage,
 *     vehicleId: vehicle?.id,
 *     includeGraph: true,
 *     workspaceId: workspaceId
 *   })
 *
 *   // Use ragContext in your chat request
 * }
 * ```
 */
export function useRAGQuery(options?: UseRAGQueryOptions): UseRAGQueryReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastResult, setLastResult] = useState<RAGQueryResponse | null>(null)

  const queryRAG = useCallback(async (
    params: RAGQueryRequest & { workspaceId?: string }
  ): Promise<RAGQueryResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `RAG query failed with status ${response.status}`
        throw new Error(errorMessage)
      }

      const data: RAGQueryResponse = await response.json()
      setLastResult(data)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown RAG query error')
      setError(error)
      options?.onError?.(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [options])

  return {
    queryRAG,
    isLoading,
    error,
    lastResult,
  }
}

/**
 * Format RAG results for inclusion in a chat system prompt
 *
 * @param ragContext - The RAG query response
 * @returns Formatted string for system prompt enrichment
 */
export function formatRAGContextForPrompt(ragContext: RAGQueryResponse | null): string {
  if (!ragContext) return ''

  const parts: string[] = []

  if (ragContext.results && ragContext.results.length > 0) {
    parts.push('RELEVANT DOCUMENTATION:')
    ragContext.results.forEach((result, index) => {
      const snippet = result.content?.substring(0, 300) || ''
      parts.push(`${index + 1}. ${result.title || 'Document'}`)
      if (snippet) {
        parts.push(`   ${snippet}${result.content && result.content.length > 300 ? '...' : ''}`)
      }
      if (result.metadata?.source) {
        parts.push(`   Source: ${result.metadata.source}`)
      }
    })
  }

  if (ragContext.graphContext) {
    const { components, connections } = ragContext.graphContext

    if (components && components.length > 0) {
      parts.push('')
      parts.push('RELATED ELECTRICAL COMPONENTS:')
      components.forEach(comp => {
        parts.push(`- ${comp.name} (${comp.type})`)
      })
    }

    if (connections && connections.length > 0) {
      parts.push('')
      parts.push('COMPONENT CONNECTIONS:')
      connections.forEach(conn => {
        parts.push(`- ${conn.from_component} → ${conn.to_component} via ${conn.wire.color} ${conn.wire.gauge} wire`)
      })
    }
  }

  return parts.join('\n')
}
