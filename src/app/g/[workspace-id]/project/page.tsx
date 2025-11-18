'use client'

import { useParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { Dashboard } from "@/components/ui/dashboard"
import { ProjectSpace } from "@/components/project/project-space"
import { ChatbotUIContext } from "@/context/context"
import { getWorkspaceById } from "@/db/workspaces"
import { Tables } from "@/supabase/types"

export default function ProjectPage() {
  const params = useParams()
  const workspaceId = params['workspace-id'] as string
  const { workspaces, setSelectedWorkspace } = useContext(ChatbotUIContext)
  const [loadedWorkspace, setLoadedWorkspace] = useState<Tables<"workspaces"> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  console.log('=====================================================')
  console.log('[ProjectPage] 🎨 Page loading')
  console.log('[ProjectPage] Workspace ID from URL:', workspaceId)
  console.log('[ProjectPage] Available workspaces:', workspaces.length)
  console.log('[ProjectPage] Workspaces:', workspaces.map(w => ({ id: w.id, name: w.name })))
  console.log('=====================================================')

  // Find the workspace by ID in context, or load from database (for demo/public access)
  const contextWorkspace = workspaces.find(w => w.id === workspaceId)
  const workspace = contextWorkspace || loadedWorkspace

  console.log('[ProjectPage] Found workspace in context?', !!contextWorkspace)
  console.log('[ProjectPage] Loaded workspace from DB?', !!loadedWorkspace)
  if (workspace) {
    console.log('[ProjectPage] Workspace details:', { id: workspace.id, name: workspace.name })
  }

  // Load workspace from database if not in context (for demo/public access)
  useEffect(() => {
    const loadWorkspace = async () => {
      if (!contextWorkspace && workspaceId) {
        console.log('[ProjectPage] 🔍 Workspace not in context, loading from database...')
        try {
          const ws = await getWorkspaceById(workspaceId)
          if (ws) {
            console.log('[ProjectPage] ✅ Loaded workspace from DB:', ws.name)
            setLoadedWorkspace(ws)
          } else {
            console.log('[ProjectPage] ❌ Workspace not found in DB')
          }
        } catch (error) {
          console.error('[ProjectPage] ❌ Error loading workspace:', error)
        }
      }
      setIsLoading(false)
    }
    loadWorkspace()
  }, [workspaceId, contextWorkspace])

  // Set the selected workspace when the page loads
  useEffect(() => {
    if (workspace) {
      setSelectedWorkspace(workspace)
    }
  }, [workspace, setSelectedWorkspace])

  if (isLoading) {
    return (
      <Dashboard>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </Dashboard>
    )
  }

  if (!workspace) {
    return (
      <Dashboard>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <h2 className="text-xl font-medium mb-2">Project not found</h2>
            <p>The requested project could not be found.</p>
          </div>
        </div>
      </Dashboard>
    )
  }

  return (
    <Dashboard>
      <ProjectSpace 
        projectName={workspace.name} 
        projectId={workspace.id} 
      />
    </Dashboard>
  )
}