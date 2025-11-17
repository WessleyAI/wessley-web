"use client"

import * as React from "react"
import { useState, useContext } from "react"
import { motion } from "framer-motion"
import { ThreeScene } from "@/components/3d/ThreeScene"
import { HoverLabel } from "@/components/3d/HoverLabel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  IconClipboard,
  IconCalculator,
  IconPlus,
  IconMicrophone,
  IconPlayerRecord,
  IconFolder,
  IconSettings,
  IconUser,
  IconTrash,
  IconPencil,
  IconCar,
  IconMenu2,
  IconBuildingWarehouse
} from "@tabler/icons-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatbotUIContext } from "@/context/context"
import { useRouter } from "next/navigation"
import { Tables } from "@/supabase/types"
import { createChat, updateChat, deleteChat } from "@/db/chats"
import { getVehiclesByWorkspaceId, createVehicle, updateVehicle } from "@/db/vehicles"
import { SceneControlsSidebar } from "@/components/chat/scene-controls-sidebar"
import { useModelStore } from "@/stores/model-store"
import { type SceneEvent } from "@/types/scene-events"

// Chat skeleton component
const ProjectChatSkeleton = () => (
  <div className="flex items-start justify-between p-4 mx-2">
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" style={{ backgroundColor: 'var(--app-bg-tertiary)' }} />
      <Skeleton className="h-3 w-1/2" style={{ backgroundColor: 'var(--app-bg-tertiary)', opacity: 0.6 }} />
    </div>
    <Skeleton className="h-3 w-16" style={{ backgroundColor: 'var(--app-bg-tertiary)', opacity: 0.6 }} />
  </div>
)

interface ProjectSpaceProps {
  projectName: string
  projectId: string
}

interface ChatItem {
  id: string
  title: string
  lastMessage: string
  timestamp: string
}

export function ProjectSpace({ projectName, projectId }: ProjectSpaceProps) {
  const router = useRouter()
  const { chats, profile, setChats, setSelectedChat, setUserInput: setGlobalUserInput } = useContext(ChatbotUIContext)
  const { executeSceneEvent, queueSceneEvents } = useModelStore()
  const [chatInput, setChatInput] = useState("")
  const [selectedModel, setSelectedModel] = useState('gpt-4o')

  // Context menu and dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedChatForAction, setSelectedChatForAction] = useState<Tables<"chat_conversations"> | null>(null)
  const [newChatName, setNewChatName] = useState("")

  // Vehicle state
  const [vehicle, setVehicle] = useState<Tables<"vehicles"> | null>(null)
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(true)
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false)
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleYear, setVehicleYear] = useState("")
  
  // Scene controls sidebar state
  const [showSceneControls, setShowSceneControls] = useState(true)
  const [isSceneControlsMinimized, setIsSceneControlsMinimized] = useState(true)
  
  // Loading states
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  // Store last message for each chat
  const [chatLastMessages, setChatLastMessages] = useState<Record<string, string>>({})

  // Filter chats by workspace/project ID
  const projectChats = chats.filter(chat => chat.workspace_id === projectId)
  
  // Set loading state based on chats data
  React.useEffect(() => {
    if (chats !== undefined) {
      setIsLoadingChats(false)
    }
  }, [chats])

  // Fetch last message for each chat
  React.useEffect(() => {
    const fetchLastMessages = async () => {
      try {
        const { supabase } = await import('@/lib/supabase/browser-client')

        for (const chat of projectChats) {
          try {
            const { data: messages } = await supabase
              .from('chat_messages')
              .select('content')
              .eq('conversation_id', chat.id)
              .order('created_at', { ascending: false })
              .limit(1)

            if (messages && messages.length > 0) {
              setChatLastMessages(prev => ({
                ...prev,
                [chat.id]: messages[0].content
              }))
            }
          } catch (err) {
            console.error(`Error fetching messages for chat ${chat.id}:`, err)
          }
        }
      } catch (err) {
        console.error('Error loading supabase client:', err)
      }
    }

    if (projectChats.length > 0 && !isLoadingChats) {
      fetchLastMessages()
    }
  }, [projectChats.length, isLoadingChats])

  // Load vehicle data on component mount
  React.useEffect(() => {
    const loadVehicle = async () => {
      try {
        setIsLoadingVehicle(true)
        const vehicles = await getVehiclesByWorkspaceId(projectId)
        if (vehicles.length > 0) {
          setVehicle(vehicles[0]) // Get the first vehicle for this workspace
        }
      } catch (error) {
        console.error('Error loading vehicle:', error)
      } finally {
        setIsLoadingVehicle(false)
      }
    }
    
    if (projectId) {
      loadVehicle()
    }
  }, [projectId])

  const handleStartChat = async () => {
    console.log('[ProjectSpace] handleStartChat called', {
      chatInput: chatInput.trim(),
      hasProfile: !!profile,
      profile: profile,
      projectId
    })

    if (!chatInput.trim() || !profile) {
      console.log('[ProjectSpace] Early return - missing input or profile')
      return
    }

    const userMessage = chatInput.trim()
    setChatInput("") // Clear input immediately for better UX
    setIsSendingMessage(true) // Show loading state

    const chatParams = {
      title: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : ''),
      user_id: profile.user_id,
      workspace_id: projectId,
      ai_model: selectedModel
    }

    console.log('[ProjectSpace] Creating chat with params:', chatParams)

    try {
      // Create chat with temporary title
      let newChat
      try {
        console.log('[ProjectSpace] About to call createChat...')

        // Add timeout to catch hanging requests
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('createChat timeout after 5s')), 5000)
        )

        newChat = await Promise.race([
          createChat(chatParams),
          timeoutPromise
        ]) as any

        console.log('[ProjectSpace] Chat created successfully:', newChat)
      } catch (createError) {
        console.error('[ProjectSpace] createChat threw error:', createError)
        alert(`Error creating chat: ${createError}`)
        throw createError
      }

      if (!newChat) {
        console.error('[ProjectSpace] createChat returned null/undefined')
        return
      }

      setChats(prevChats => [...prevChats, newChat])
      setSelectedChat(newChat)

      console.log('[ProjectSpace] Sending message to GPT-5.1...')
      // Send first message to GPT-5.1 and get response
      const messageResponse = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: newChat.id,
          userMessage: userMessage,
          vehicle: vehicle ? {
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year
          } : null
        })
      })

      if (!messageResponse.ok) {
        const errorText = await messageResponse.text()
        console.error('[ProjectSpace] Failed to send message:', errorText)
        router.push(`/c/${newChat.id}`)
        return
      }

      const messageData = await messageResponse.json()
      console.log('[ProjectSpace] Got GPT response:', messageData)
      const { assistantMessage, sceneEvents } = messageData

      // Execute scene events if any were returned
      if (sceneEvents && sceneEvents.length > 0) {
        console.log('[ProjectSpace] Executing scene events:', sceneEvents)
        // Queue all events and execute them
        queueSceneEvents(sceneEvents)
        // Execute the first event immediately
        if (sceneEvents[0]) {
          executeSceneEvent(sceneEvents[0])
        }
      }

      console.log('[ProjectSpace] Generating title...')
      // Generate contextual title based on conversation
      const titleResponse = await fetch('/api/chat/generate-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: userMessage,
          assistantMessage: assistantMessage?.content || ''
        })
      })

      if (titleResponse.ok) {
        const { title } = await titleResponse.json()
        console.log('[ProjectSpace] Generated title:', title)

        // Update chat title
        await updateChat(newChat.id, { title })
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === newChat.id ? { ...chat, title } : chat
          )
        )
      }

      console.log('[ProjectSpace] Navigating to chat:', newChat.id)
      // Navigate to chat
      router.push(`/c/${newChat.id}`)
    } catch (error) {
      console.error('[ProjectSpace] Error creating chat:', error)
    } finally {
      setIsSendingMessage(false) // Clear loading state
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('[ProjectSpace] Key pressed:', e.key)
    if (e.key === 'Enter') {
      console.log('[ProjectSpace] Enter key detected, calling handleStartChat')
      handleStartChat()
    }
  }

  const handleRenameChat = (chat: Tables<"chat_conversations">) => {
    setSelectedChatForAction(chat)
    setNewChatName(chat.title || "")
    setRenameDialogOpen(true)
  }

  const handleDeleteChat = (chat: Tables<"chat_conversations">) => {
    setSelectedChatForAction(chat)
    setDeleteDialogOpen(true)
  }

  const confirmRename = async () => {
    if (!selectedChatForAction || !newChatName.trim()) return
    
    try {
      await updateChat(selectedChatForAction.id, { title: newChatName.trim() })
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChatForAction.id 
            ? { ...chat, title: newChatName.trim() }
            : chat
        )
      )
    } catch (error) {
      console.error('Error renaming chat:', error)
    }
    
    setRenameDialogOpen(false)
    setSelectedChatForAction(null)
    setNewChatName("")
  }

  const confirmDelete = async () => {
    if (!selectedChatForAction) return
    
    try {
      await deleteChat(selectedChatForAction.id)
      setChats(prevChats => 
        prevChats.filter(chat => chat.id !== selectedChatForAction.id)
      )
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
    
    setDeleteDialogOpen(false)
    setSelectedChatForAction(null)
  }

  const handleEditVehicle = () => {
    if (vehicle) {
      setVehicleMake(vehicle.make)
      setVehicleModel(vehicle.model)
      setVehicleYear(vehicle.year.toString())
    } else {
      setVehicleMake("")
      setVehicleModel("")
      setVehicleYear("")
    }
    setVehicleDialogOpen(true)
  }

  const confirmVehicle = async () => {
    if (!vehicleMake.trim() || !vehicleModel.trim() || !vehicleYear.trim() || !profile) return
    
    try {
      const yearNum = parseInt(vehicleYear)
      if (isNaN(yearNum)) {
        console.error('Invalid year format')
        return
      }

      if (vehicle) {
        // Update existing vehicle
        const updatedVehicle = await updateVehicle(vehicle.id, {
          make: vehicleMake.trim(),
          model: vehicleModel.trim(),
          year: yearNum
        })
        setVehicle(updatedVehicle)
      } else {
        // Create new vehicle
        const newVehicle = await createVehicle({
          workspace_id: projectId,
          make: vehicleMake.trim(),
          model: vehicleModel.trim(),
          year: yearNum
        })
        setVehicle(newVehicle)
      }
    } catch (error) {
      console.error('Error saving vehicle:', error)
    }
    
    setVehicleDialogOpen(false)
    setVehicleMake("")
    setVehicleModel("")
    setVehicleYear("")
  }

  return (
    <motion.div
      className="flex h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="flex-1 flex flex-col h-full app-bg-primary app-text-primary relative min-w-0"
      >
      {/* Top Bar - Floating above scene */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-end p-4">
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg app-text-secondary hover:app-text-primary transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Project Manager"
          >
            <IconUser className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg app-text-secondary hover:app-text-primary transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Budget & Expenses"
          >
            <IconCalculator className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg app-text-secondary hover:app-text-primary transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Todo List"
          >
            <IconClipboard className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg app-text-secondary hover:app-text-primary transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Settings"
          >
            <IconSettings className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg app-text-secondary hover:app-text-primary transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Scene Controls"
            onClick={() => {
              setShowSceneControls(true)
              setIsSceneControlsMinimized(false)
            }}
          >
            <IconMenu2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-lg app-body-sm app-text-secondary hover:app-text-primary transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Share
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-lg app-text-secondary hover:app-text-primary transition-colors duration-200"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            •••
          </motion.button>
        </div>
      </div>

      {/* 3D Scene - Full height */}
      <div className="px-6 pt-6 pb-4">
        <div
          className="h-[448px] relative overflow-hidden rounded-lg"
          style={{
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 2px 8px rgba(0, 0, 0, 0.4)'
          }}
        >
          <ThreeScene />
        </div>
      </div>

      {/* Main Content Container - Centered */}
      <div className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full px-6 py-6">
        
        {/* Project Header */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <IconBuildingWarehouse className="w-6 h-6 app-text-muted" />
            <h1 className="app-h2">{projectName}</h1>
            {isLoadingVehicle ? (
              <div className="flex items-center gap-2 px-2 py-1">
                <IconCar className="w-4 h-4 app-text-muted" />
                <Skeleton className="h-4 w-32" style={{ backgroundColor: 'var(--app-bg-tertiary)' }} />
              </div>
            ) : (
              <motion.button
                onClick={handleEditVehicle}
                className="flex items-center gap-2 app-body-sm app-text-muted hover:app-text-secondary transition-colors duration-200 px-2 py-1 rounded"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconCar className="w-4 h-4" />
                <span>
                  {vehicle
                    ? `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                    : 'Set vehicle model'
                  }
                </span>
              </motion.button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent app-text-secondary app-body-sm"
            style={{ borderColor: 'var(--app-border)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Add files
          </Button>
        </div>

        {/* Chat Input - More rounded */}
        <motion.div 
          className="w-full mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <motion.div
              className="flex items-center gap-3 rounded-lg p-4"
              style={{
                backgroundColor: 'var(--app-bg-hover)',
                border: '1px solid var(--app-border)'
              }}
              whileHover={{}}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={handleStartChat}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-lg app-text-muted hover:app-text-secondary transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <IconPlus className="w-5 h-5" />
              </motion.button>
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`New chat in ${projectName}`}
                className="flex-1 bg-transparent border-none app-text-primary app-body-sm focus:ring-0 focus:border-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ color: 'var(--app-text-primary)' }}
              />
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="app-text-muted hover:app-text-secondary transition-colors">
                <IconMicrophone className="w-5 h-5" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="app-text-muted hover:app-text-secondary transition-colors">
                <IconPlayerRecord className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Chat History with Separators */}
        <div className="w-full max-h-96">
          {projectChats.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center app-text-muted">
                <p className="app-body">No chats yet...</p>
                <p className="app-body-sm mt-2">Start a conversation above to begin</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full project-chat-scroll">
              <div className="divide-y pr-4" style={{ borderColor: 'var(--app-border)' }}>
                {isSendingMessage && <ProjectChatSkeleton />}
                {isLoadingChats ? (
                  // Show skeleton loading states
                  Array.from({ length: 4 }).map((_, index) => (
                    <ProjectChatSkeleton key={index} />
                  ))
                ) : (
                  projectChats.map((chat, index) => (
                  <ContextMenu key={chat.id}>
                    <ContextMenuTrigger asChild>
                      <motion.div
                        className="flex items-start justify-between p-4 cursor-pointer transition-all duration-200 rounded-lg mx-2"
                        style={{ backgroundColor: 'transparent' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{
                          x: 4,
                          transition: { duration: 0.2 }
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.preventDefault()
                          router.push(`/c/${chat.id}`)
                        }}
                        onContextMenu={(e) => e.stopPropagation()}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="app-caption app-fw-medium mb-1 app-text-primary truncate">{chat.title}</div>
                          <div className="app-body-sm app-text-muted line-clamp-2 leading-relaxed">
                            {/* Show last message (last 100 chars) or placeholder */}
                            {chatLastMessages[chat.id]
                              ? chatLastMessages[chat.id].substring(0, 100) + (chatLastMessages[chat.id].length > 100 ? '...' : '')
                              : 'New conversation'}
                          </div>
                        </div>
                        <span className="app-caption app-text-muted ml-4 shrink-0">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </motion.div>
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
                )))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="app-h5">Rename Chat</DialogTitle>
            <DialogDescription className="app-body app-text-muted">
              Enter a new name for "{selectedChatForAction?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right app-body-sm">
                Name
              </Label>
              <Input
                id="name"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                className="col-span-3 app-body"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmRename()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)} className="app-body-sm">
              Cancel
            </Button>
            <Button onClick={confirmRename} disabled={!newChatName.trim()} className="app-body-sm">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="app-h5">Delete Chat</DialogTitle>
            <DialogDescription className="app-body app-text-muted">
              Are you sure you want to delete "{selectedChatForAction?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="app-body-sm">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="app-body-sm"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Dialog */}
      <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="app-h5">{vehicle ? 'Edit Vehicle' : 'Set Vehicle Model'}</DialogTitle>
            <DialogDescription className="app-body app-text-muted">
              {vehicle
                ? 'Update the vehicle information for this project.'
                : 'Set the vehicle model for this project to get more accurate assistance.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="make" className="text-right app-body-sm">
                Make
              </Label>
              <Input
                id="make"
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                placeholder="e.g., Hyundai"
                className="col-span-3 app-body"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right app-body-sm">
                Model
              </Label>
              <Input
                id="model"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g., Galloper"
                className="col-span-3 app-body"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right app-body-sm">
                Year
              </Label>
              <Input
                id="year"
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                placeholder="e.g., 2000"
                className="col-span-3 app-body"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmVehicle()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleDialogOpen(false)} className="app-body-sm">
              Cancel
            </Button>
            <Button
              onClick={confirmVehicle}
              disabled={!vehicleMake.trim() || !vehicleModel.trim() || !vehicleYear.trim()}
              className="app-body-sm"
            >
              {vehicle ? 'Update' : 'Set Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </motion.div>

      {/* Scene Controls Sidebar */}
      <SceneControlsSidebar
        isOpen={showSceneControls}
        onClose={() => setShowSceneControls(false)}
        isMinimized={isSceneControlsMinimized}
        onToggleMinimized={() => setIsSceneControlsMinimized(!isSceneControlsMinimized)}
      />

      {/* Hover label for 3D components */}
      <HoverLabel />
    </motion.div>
  )
}