"use client"

import { FC, useState, useContext, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { SIDEBAR_WIDTH } from "../ui/dashboard"
import { NewWorkspaceDialog } from "../project/new-workspace-dialog"
import { useSearch } from "../search/search-provider"
import { ChatbotUIContext } from "@/context/context"
import { useChatStore } from "@/stores/chat-store"
import { Skeleton } from "@/components/ui/skeleton"
import { useChatHandler } from "../chat/chat-hooks/use-chat-handler"
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable
} from "@dnd-kit/core"
import { updateChat, deleteChat } from "@/db/chats"

// Chat skeleton component
const ChatSkeleton = ({ className }: { className?: string }) => (
  <div className={className}>
    <Skeleton className="h-8 w-full bg-gray-700/50" />
  </div>
)

// Helper components for drag and drop
const DraggableChat = ({ chat, children }: { chat: any, children: React.ReactNode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: chat.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  )
}

const DroppableSection = ({ id, children }: { id: string, children: React.ReactNode }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  const style = {
    backgroundColor: isOver ? 'rgba(255, 255, 255, 0.1)' : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  )
}
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  IconEdit, 
  IconSearch, 
  IconPlus,
  IconLibrary, 
  IconShoppingCart,
  IconSettings,
  IconCompass,
  IconChevronDown,
  IconChevronRight,
  IconFolder,
  IconLayoutSidebar,
  IconLayoutSidebarLeftExpand,
  IconBrandGoogle,
  IconTrash,
  IconPencil
} from "@tabler/icons-react"
import Image from "next/image"
import { ProfileSettings } from "../utility/profile-settings"
import { createClient } from "@/lib/supabase/client"
import { deleteWorkspace } from "@/db/workspaces"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SidebarProps {
  showSidebar: boolean
  onMainViewChange?: (view: string) => void
  currentView?: string
  onToggleSidebar?: () => void
  isMinimized?: boolean
}

export const Sidebar: FC<SidebarProps> = ({ showSidebar, onMainViewChange, currentView, onToggleSidebar, isMinimized = false }) => {
  const router = useRouter()
  const { open } = useSearch()
  const { handleNewChat } = useChatHandler()
  const { profile, workspaces, chats: contextChats, selectedWorkspace, setWorkspaces, setSelectedWorkspace } = useContext(ChatbotUIContext)
  const { conversations, setConversations, removeConversation, updateConversationTitle, updateConversationWorkspace } = useChatStore()
  
  // Sync conversations from context to Zustand store
  useEffect(() => {
    if (contextChats && contextChats.length > 0) {
      setConversations(contextChats)
      setIsLoadingChats(false)
    } else if (contextChats !== undefined) {
      // Empty array means loaded but no chats
      setIsLoadingChats(false)
    }
  }, [contextChats, setConversations])
  
  // Use conversations from Zustand store instead of ChatbotUIContext
  const chats = conversations
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [authUser, setAuthUser] = useState<any>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const getAuthUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setAuthUser(user)
    }
    getAuthUser()
  }, [profile])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['projects', 'chats']))
  
  // Rename/Delete state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workspaceForAction, setWorkspaceForAction] = useState<any>(null)
  const [newName, setNewName] = useState("")
  
  // Chat rename/delete state
  const [chatRenameDialogOpen, setChatRenameDialogOpen] = useState(false)
  const [chatDeleteDialogOpen, setChatDeleteDialogOpen] = useState(false)
  const [selectedChatForAction, setSelectedChatForAction] = useState<any>(null)
  const [newChatName, setNewChatName] = useState("")

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleProjectClick = (projectId: string) => {
    // Find the workspace by ID
    const workspace = workspaces.find(w => w.id === projectId)
    
    if (expandedProjects.has(projectId)) {
      const newExpanded = new Set(expandedProjects)
      newExpanded.delete(projectId)
      setExpandedProjects(newExpanded)
    } else {
      setExpandedProjects(new Set([...expandedProjects, projectId]))
    }
    
    setSelectedProject(projectId)
    
    // Navigate to the project page using the new URL pattern
    if (workspace) {
      setSelectedWorkspace(workspace)
      router.push(`/g/${projectId}/project`)
    }
  }

  const handleViewChange = (view: string) => {
    onMainViewChange?.(view)
  }

  const handleToggleSidebar = () => {
    onToggleSidebar?.()
  }

  const handleSectionToggle = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/chat`
      }
    })
  }

  const handleRename = (workspace: any) => {
    // Only allow rename if user owns the workspace
    if (workspace.user_id !== profile?.user_id) {
      console.warn('User does not have permission to rename this workspace')
      return
    }
    setSelectedWorkspace(workspace)
    setNewName(workspace.name)
    setRenameDialogOpen(true)
  }

  const handleDelete = (workspace: any) => {
    // Only allow deletion if user owns the workspace
    if (workspace.user_id !== profile?.user_id) {
      console.warn('User does not have permission to delete this workspace')
      return
    }
    console.log('handleDelete called with workspace:', workspace)
    setWorkspaceForAction(workspace)
    setDeleteDialogOpen(true)
  }

  const confirmRename = async () => {
    if (!workspaceForAction || !newName.trim()) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('workspaces')
        .update({ name: newName.trim() })
        .eq('id', workspaceForAction.id)
      
      if (!error) {
        setWorkspaces(workspaces.map(w => 
          w.id === workspaceForAction.id ? { ...w, name: newName.trim() } : w
        ))
      }
    } catch (error) {
      console.error('Error renaming workspace:', error)
    }
    
    setRenameDialogOpen(false)
    setSelectedWorkspace(null)
    setNewName("")
  }

  const confirmDelete = async () => {
    console.log('confirmDelete called, workspaceForAction:', workspaceForAction)
    if (!workspaceForAction) {
      console.log('No workspaceForAction, returning early')
      return
    }
    
    try {
      console.log('Deleting workspace:', workspaceForAction.id)
      await deleteWorkspace(workspaceForAction.id)
      console.log('Workspace deleted successfully')

      setWorkspaces(prevWorkspaces => {
        const filteredWorkspaces = prevWorkspaces.filter(
          w => w.id !== workspaceForAction.id
        )

        // If we deleted the currently selected workspace, switch to another one
        if (selectedWorkspace?.id === workspaceForAction.id) {
          const defaultWorkspace = filteredWorkspaces[0]
          if (defaultWorkspace) {
            setSelectedWorkspace(defaultWorkspace)
            router.push(`/g/${defaultWorkspace.id}/project`)
          }
        }

        return filteredWorkspaces
      })
    } catch (error) {
      console.error('Error deleting workspace:', error)
    }
    
    console.log('Closing dialog and clearing workspaceForAction')
    setDeleteDialogOpen(false)
    setWorkspaceForAction(null)
  }

  const handleRenameChat = (chat: any) => {
    setSelectedChatForAction(chat)
    setNewChatName(chat.title || "")
    setChatRenameDialogOpen(true)
  }

  const handleDeleteChat = (chat: any) => {
    setSelectedChatForAction(chat)
    setChatDeleteDialogOpen(true)
  }

  const confirmChatRename = async () => {
    if (!selectedChatForAction || !newChatName.trim()) return
    
    try {
      await updateChat(selectedChatForAction.id, { title: newChatName.trim() })
      updateConversationTitle(selectedChatForAction.id, newChatName.trim())
    } catch (error) {
      console.error('Error renaming chat:', error)
    }
    
    setChatRenameDialogOpen(false)
    setSelectedChatForAction(null)
    setNewChatName("")
  }

  const confirmChatDelete = async () => {
    if (!selectedChatForAction) return
    
    try {
      // Unlink chat from user instead of deleting from database
      removeConversation(selectedChatForAction.id)
    } catch (error) {
      console.error('Error removing chat:', error)
    }
    
    setChatDeleteDialogOpen(false)
    setSelectedChatForAction(null)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const draggedChat = chats.find(chat => chat.id === active.id)
    if (draggedChat) {
      setDraggedItem(draggedChat)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedItem(null)

    if (!over) return

    const draggedChatId = active.id as string
    const targetWorkspaceId = over.id as string

    // Find the dragged chat
    const draggedChat = chats.find(chat => chat.id === draggedChatId)
    if (!draggedChat) return

    try {
      // Update chat workspace association in database
      let newWorkspaceId = null
      if (targetWorkspaceId !== 'general-chats') {
        newWorkspaceId = targetWorkspaceId
      }

      await updateChat(draggedChatId, {
        workspace_id: newWorkspaceId
      })

      // Update the Zustand store to reflect the workspace change
      updateConversationWorkspace(draggedChatId, newWorkspaceId)

      console.log(`Moved chat ${draggedChatId} to workspace ${newWorkspaceId || 'general'}`)
    } catch (error) {
      console.error('Error moving chat:', error)
    }
  }

  if (!showSidebar) return null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`flex flex-col h-screen ${isMinimized ? 'cursor-pointer' : ''}`}
        style={{ 
          width: isMinimized ? '60px' : `${SIDEBAR_WIDTH}px`,
          backgroundColor: '#090909'
        }}
        onMouseEnter={() => isMinimized && setIsHovering(true)}
        onMouseLeave={() => isMinimized && setIsHovering(false)}
        onClick={() => isMinimized && onToggleSidebar?.()}
      >
      {/* Header */}
      <div className={`flex items-center ${isMinimized ? 'justify-center' : 'justify-between'} p-4`}>
        <div className="flex items-center gap-2 relative">
          {isMinimized ? (
            <div 
              className="relative group"
              onMouseEnter={(e) => e.stopPropagation()}
              onMouseLeave={(e) => e.stopPropagation()}
            >
              {isHovering ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <IconLayoutSidebarLeftExpand 
                    size={24}
                    className="text-white/80 hover:text-white transition-colors duration-200"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <Image 
                    src="/wessley_thumb_chat.svg" 
                    alt="Wessley" 
                    width={24}
                    height={24}
                  />
                </motion.div>
              )}
              {isHovering && (
                <div className="absolute left-10 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ml-2">
                  Open Sidebar
                </div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <Image 
                src="/wessley_thumb_chat.svg" 
                alt="Wessley" 
                width={24}
                height={24}
              />
            </motion.div>
          )}
        </div>
        {!isMinimized && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleSidebar}
            className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            <IconLayoutSidebar size={16} />
          </Button>
        )}
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1 px-3 sidebar-scroll">
        {isMinimized ? (
          <div className="space-y-3 pb-4">
            {/* Minimized Icons */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNewChat()
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltipPosition({ x: rect.right + 12, y: rect.top + rect.height / 2 })
                    setHoveredIcon('newchat')
                  }}
                  onMouseLeave={() => setHoveredIcon(null)}
                  className="h-10 w-10 p-0 text-white/80 hover:bg-gray-600/50 hover:text-white relative z-10 rounded-lg transition-all duration-200"
                >
                  <IconPlus size={20} />
                </Button>
              </div>
              
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    open()
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltipPosition({ x: rect.right + 12, y: rect.top + rect.height / 2 })
                    setHoveredIcon('search')
                  }}
                  onMouseLeave={() => setHoveredIcon(null)}
                  className="h-10 w-10 p-0 text-white/80 hover:bg-gray-600/50 hover:text-white relative z-10 rounded-lg transition-all duration-200"
                >
                  <IconSearch size={20} />
                </Button>
              </div>
              
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewChange('explore')
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltipPosition({ x: rect.right + 12, y: rect.top + rect.height / 2 })
                    setHoveredIcon('explore')
                  }}
                  onMouseLeave={() => setHoveredIcon(null)}
                  className={`h-10 w-10 p-0 text-white/80 hover:bg-gray-600/50 hover:text-white relative z-10 rounded-lg transition-all duration-200 ${
                    currentView === 'explore' ? 'bg-white/10 text-white' : ''
                  }`}
                >
                  <IconCompass size={20} />
                </Button>
              </div>
            </div>
            
            {/* Dynamic tooltip positioned next to hovered icon */}
            {hoveredIcon && (
              <div 
                className="fixed bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-[9999] pointer-events-none transform -translate-y-1/2"
                style={{ 
                  left: tooltipPosition.x, 
                  top: tooltipPosition.y 
                }}
              >
                {hoveredIcon === 'newchat' && 'New chat'}
                {hoveredIcon === 'search' && 'Search'}
                {hoveredIcon === 'explore' && 'Explore'}
              </div>
            )}
          </div>
        ) : (
        <div className="space-y-4 pb-4">
          
          {/* Primary Actions */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3 text-white/80 hover:bg-white/10 hover:text-white"
              onClick={handleNewChat}
            >
              <IconEdit size={16} className="mr-3" />
              New chat
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3 text-white/80 hover:bg-white/10 hover:text-white"
              onClick={open}
            >
              <IconSearch size={16} className="mr-3" />
              Search
            </Button>
          </div>

          {/* Main Features */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <IconLibrary size={16} className="mr-3" />
              Library
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start h-9 px-3 text-white/80 hover:bg-white/10 hover:text-white ${
                currentView === 'marketplace' ? 'bg-white/10 text-white' : ''
              }`}
              onClick={() => handleViewChange('marketplace')}
            >
              <IconShoppingCart size={16} className="mr-3" />
              Marketplace
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start h-9 px-3 text-white/80 hover:bg-white/10 hover:text-white ${
                currentView === 'auto-tuning' ? 'bg-white/10 text-white' : ''
              }`}
              onClick={() => handleViewChange('auto-tuning')}
            >
              <IconSettings size={16} className="mr-3" />
              Auto-tune
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start h-9 px-3 text-white/80 hover:bg-white/10 hover:text-white ${
                currentView === 'explore' ? 'bg-white/10 text-white' : ''
              }`}
              onClick={() => handleViewChange('explore')}
            >
              <IconCompass size={16} className="mr-3" />
              Explore
            </Button>
          </div>

          {/* Projects Section */}
          <div className="space-y-1">
            <button
              onClick={() => handleSectionToggle('projects')}
              className="w-full flex items-center justify-between px-3 py-1 text-xs font-medium text-white/40 tracking-wider hover:text-white/60 group"
            >
              <span>Projects</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {expandedSections.has('projects') ? (
                  <IconChevronDown size={12} />
                ) : (
                  <IconChevronRight size={12} />
                )}
              </div>
            </button>
            
            {expandedSections.has('projects') && (
              <>
                <NewWorkspaceDialog>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-9 px-3 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <IconPlus size={16} className="mr-3" />
                    New project
                  </Button>
                </NewWorkspaceDialog>

                {workspaces.length > 0 && workspaces.filter(workspace => workspace.user_id === profile?.user_id).map((workspace) => {
                  const workspaceChats = chats.filter(chat => 
                    chat.workspace_id === workspace.id && 
                    chat.user_id === profile?.user_id
                  )
                  return (
                    <div key={workspace.id}>
                      <DroppableSection id={workspace.id}>
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <Button
                            variant="ghost"
                            className={`w-full justify-start h-9 px-3 text-white/80 hover:bg-white/10 hover:text-white ${
                              selectedProject === workspace.id ? 'bg-white/10 text-white' : ''
                            }`}
                            onClick={() => handleProjectClick(workspace.id)}
                          >
                            {expandedProjects.has(workspace.id) ? (
                              <IconChevronDown size={12} className="mr-1" />
                            ) : (
                              <IconChevronRight size={12} className="mr-1" />
                            )}
                            <IconFolder size={16} className="mr-2" />
                            <span className="flex-1 text-left">{workspace.name}</span>
                            <span className="text-xs text-white/40">{workspaceChats.length}</span>
                          </Button>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleRename(workspace)}>
                            <IconPencil size={14} className="mr-2" />
                            Rename
                          </ContextMenuItem>
                          <ContextMenuItem 
                            onClick={() => handleDelete(workspace)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <IconTrash size={14} className="mr-2" />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                      
                      {expandedProjects.has(workspace.id) && (
                        <div className="ml-8 space-y-0.5">
                          {isLoadingChats ? (
                            // Show skeleton loading states
                            Array.from({ length: 3 }).map((_, index) => (
                              <ChatSkeleton key={index} />
                            ))
                          ) : (
                            workspaceChats.slice(0, 5).map((chat) => (
                              <DraggableChat key={chat.id} chat={chat}>
                                <ContextMenu>
                                  <ContextMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start h-8 px-2 text-xs text-white/60 hover:bg-white/10 hover:text-white/80"
                                      onClick={() => router.push(`/c/${chat.id}`)}
                                    >
                                      <span className="truncate">{chat.title || 'New Chat'}</span>
                                    </Button>
                                  </ContextMenuTrigger>
                                  <ContextMenuContent>
                                    <ContextMenuItem onClick={(e) => {
                                      e.stopPropagation()
                                      handleRenameChat(chat)
                                    }}>
                                      <IconPencil size={14} className="mr-2" />
                                      Rename
                                    </ContextMenuItem>
                                    <ContextMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteChat(chat)
                                      }}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <IconTrash size={14} className="mr-2" />
                                      Delete
                                    </ContextMenuItem>
                                  </ContextMenuContent>
                                </ContextMenu>
                              </DraggableChat>
                            ))
                          )}
                        </div>
                      )}
                      </DroppableSection>
                    </div>
                  )
                })}
              </>
            )}
          </div>

          {/* Chats Section */}
          <div className="space-y-1">
            <button
              onClick={() => handleSectionToggle('chats')}
              className="w-full flex items-center justify-between px-3 py-1 text-xs font-medium text-white/40 tracking-wider hover:text-white/60 group"
            >
              <span>Chats</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {expandedSections.has('chats') ? (
                  <IconChevronDown size={12} />
                ) : (
                  <IconChevronRight size={12} />
                )}
              </div>
            </button>
            
            {expandedSections.has('chats') && (() => {
              // Show only orphaned chats (workspace_id is null) that belong to current user
              const generalChats = chats.filter(chat => 
                chat.workspace_id === null && 
                chat.user_id === profile?.user_id
              )
              return (isLoadingChats || generalChats.length > 0) && (
                <DroppableSection id="general-chats">
                  {isLoadingChats ? (
                    // Show skeleton loading states for general chats
                    Array.from({ length: 3 }).map((_, index) => (
                      <ChatSkeleton key={index} className="px-3 py-1" />
                    ))
                  ) : (
                    generalChats.slice(0, 5).map((chat) => (
                      <DraggableChat key={chat.id} chat={chat}>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-8 px-3 text-white/60 hover:bg-white/10 hover:text-white/80"
                            onClick={() => router.push(`/c/${chat.id}`)}
                          >
                            <span className="truncate text-sm">{chat.title || 'New Chat'}</span>
                          </Button>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleRenameChat(chat)
                          }}>
                            <IconPencil size={14} className="mr-2" />
                            Rename
                          </ContextMenuItem>
                          <ContextMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteChat(chat)
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <IconTrash size={14} className="mr-2" />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                      </DraggableChat>
                    ))
                  )}
                </DroppableSection>
              )
            })()}
          </div>
        </div>
        )}
      </ScrollArea>

      {/* Account Section */}
      <div className="p-3">
        {profile ? (
          <div className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-3'}`}>
            <div className={`relative ${isMinimized ? 'group' : ''}`}>
              <div 
                className={`h-8 w-8 rounded-full overflow-hidden relative z-10 ${isMinimized ? 'hover:ring-2 hover:ring-gray-600/50 transition-all duration-200' : ''}`}
                onMouseEnter={(e) => isMinimized && e.stopPropagation()}
                onMouseLeave={(e) => isMinimized && e.stopPropagation()}
              >
              {(authUser?.user_metadata?.avatar_url || profile.avatar_url || profile.image_url) ? (
                <Image
                  src={authUser?.user_metadata?.avatar_url || profile.avatar_url || profile.image_url || ''}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {(authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || profile.display_name || profile.full_name || profile.username)?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              </div>
              {isMinimized && (
                <div className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ml-2">
                  Profile
                </div>
              )}
            </div>
            {!isMinimized && (
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-medium text-foreground truncate">
                  {authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || profile.display_name || profile.full_name || profile.username || 'User'}
                </h3>
                <p className="text-xs font-normal text-gray-500">
                  {profile.subscription_tier === 'insiders' || !profile.subscription_tier ? 'Insider' : 
                   profile.subscription_tier === 'pro' ? 'Pro' : 
                   profile.subscription_tier === 'enterprise' ? 'Enterprise' : 'Free'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {!isMinimized && <div className="bg-red-500 p-2 text-white font-bold">DEBUG: No profile found</div>}
            <div className={`space-y-2 ${isMinimized ? 'flex flex-col items-center' : ''}`}>
            <div className={`relative ${isMinimized ? 'group' : ''}`}>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleGoogleLogin()
                }}
                onMouseEnter={(e) => isMinimized && e.stopPropagation()}
                onMouseLeave={(e) => isMinimized && e.stopPropagation()}
                className={`${isMinimized ? 'h-8 w-8 p-0 relative z-10 rounded-lg' : 'w-full justify-start h-9 px-3'} bg-white text-black hover:bg-gray-200 transition-all duration-200`}
              >
                <IconBrandGoogle size={16} className={isMinimized ? '' : 'mr-2'} />
                {!isMinimized && 'Sign in with Google'}
              </Button>
              {isMinimized && (
                <div className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ml-2">
                  Sign in with Google
                </div>
              )}
            </div>
            {!isMinimized && <p className="text-xs text-white/60 text-center">Sign in to access your projects and chat history</p>}
            </div>
          </>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for "{workspaceForAction?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmRename()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRename} disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{workspaceForAction?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                console.log('Delete button clicked')
                confirmDelete()
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Rename Dialog */}
      <Dialog open={chatRenameDialogOpen} onOpenChange={setChatRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for "{selectedChatForAction?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chatname" className="text-right">
                Name
              </Label>
              <Input
                id="chatname"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmChatRename()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChatRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmChatRename} disabled={!newChatName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Delete Dialog */}
      <Dialog open={chatDeleteDialogOpen} onOpenChange={setChatDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedChatForAction?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChatDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmChatDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      <DragOverlay>
        {draggedItem ? (
          <div className="bg-white/20 p-2 rounded text-white text-sm">
            {draggedItem.title || 'Chat'}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}