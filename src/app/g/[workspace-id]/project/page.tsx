'use client'

import { useParams } from 'next/navigation'
import { useContext, useEffect } from 'react'
import { Dashboard } from "@/components/ui/dashboard"
import { ProjectSpace } from "@/components/project/project-space"
import { ChatbotUIContext } from "@/context/context"

export default function ProjectPage() {
  const params = useParams()
  const workspaceId = params['workspace-id'] as string
  const { workspaces, setSelectedWorkspace } = useContext(ChatbotUIContext)

  console.log('=====================================================')
  console.log('[ProjectPage] 🎨 Page loading')
  console.log('[ProjectPage] Workspace ID from URL:', workspaceId)
  console.log('[ProjectPage] Available workspaces:', workspaces.length)
  console.log('[ProjectPage] Workspaces:', workspaces.map(w => ({ id: w.id, name: w.name })))
  console.log('=====================================================')

  // Find the workspace by ID
  const workspace = workspaces.find(w => w.id === workspaceId)

  console.log('[ProjectPage] Found workspace?', !!workspace)
  if (workspace) {
    console.log('[ProjectPage] Workspace details:', { id: workspace.id, name: workspace.name })
  }
  
  // Set the selected workspace when the page loads
  useEffect(() => {
    if (workspace) {
      setSelectedWorkspace(workspace)
    }
  }, [workspace, setSelectedWorkspace])

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