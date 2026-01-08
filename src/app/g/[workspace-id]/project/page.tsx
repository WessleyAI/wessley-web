'use client'

import { useParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { Dashboard } from "@/components/ui/dashboard"
import { ProjectSpace } from "@/components/project/project-space"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { isDemoWorkspace, getDemoWorkspace } from "@/lib/demo-workspace"

export default function ProjectPage() {
  const params = useParams()
  const workspaceId = params['workspace-id'] as string
  const { workspaces, setSelectedWorkspace } = useContext(ChatbotUIContext)
  const [loadedWorkspace, setLoadedWorkspace] = useState<Tables<"workspaces"> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Find the workspace by ID in context, or use demo workspace
  const contextWorkspace = workspaces.find(w => w.id === workspaceId)
  const workspace = contextWorkspace || loadedWorkspace

  // Load demo workspace if this is the demo ID (no database call, client-side only)
  useEffect(() => {
    if (!contextWorkspace && workspaceId) {
      if (isDemoWorkspace(workspaceId)) {
        const demoWs = getDemoWorkspace()
        setLoadedWorkspace(demoWs)
      }
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
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
