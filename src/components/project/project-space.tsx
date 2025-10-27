"use client"

import * as React from "react"
import { useState, useContext } from "react"
import { motion } from "framer-motion"
import { ThreeScene } from "@/components/3d/ThreeScene"
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
  IconMenu2
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

// Chat skeleton component
const ProjectChatSkeleton = () => (
  <div className="flex items-start justify-between p-4 mx-2">
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4 bg-gray-600/50" />
      <Skeleton className="h-3 w-1/2 bg-gray-600/30" />
    </div>
    <Skeleton className="h-3 w-16 bg-gray-600/30" />
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
  const [chatInput, setChatInput] = useState("")
  
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
  
  // Filter chats by workspace/project ID
  const projectChats = chats.filter(chat => chat.workspace_id === projectId)
  
  // Set loading state based on chats data
  React.useEffect(() => {
    if (chats !== undefined) {
      setIsLoadingChats(false)
    }
  }, [chats])

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
    console.log('handleStartChat called', { chatInput: chatInput.trim(), profile: !!profile, projectId })
    
    if (!chatInput.trim() || !profile) {
      console.log('Early return: missing input or profile')
      return
    }
    
    try {
      console.log('Creating chat with:', {
        title: chatInput.trim(),
        user_id: profile.user_id,
        workspace_id: projectId,
        ai_model: "gpt-4"
      })
      
      const newChat = await createChat({
        title: chatInput.trim(),
        user_id: profile.user_id,
        workspace_id: projectId,
        ai_model: "gpt-4"
      })
      
      console.log('Chat created successfully:', newChat)
      setChats(prevChats => [...prevChats, newChat])
      
      // Set the selected chat in context
      setSelectedChat(newChat)
      
      // Set the user input for the chat
      setGlobalUserInput(chatInput.trim())
      
      setChatInput("")
      router.push(`/c/${newChat.id}`)
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
    <div className="flex h-full">
      <div className="flex-1 flex flex-col h-full bg-[#2a2a2a] text-white relative"
        style={{
          marginRight: showSceneControls ? (isSceneControlsMinimized ? '60px' : '320px') : '0px',
          transition: 'margin-right 0.3s ease-in-out'
        }}
      >
      {/* Top Bar with Model Selection - Floating above scene */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Select defaultValue="chatgpt5">
            <SelectTrigger className="w-[140px] bg-transparent border-none text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chatgpt5">ChatGPT 5</SelectItem>
              <SelectItem value="gpt4">GPT-4</SelectItem>
              <SelectItem value="claude35">Claude 3.5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
            title="Project Manager"
          >
            <IconUser className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
            title="Budget & Expenses"
          >
            <IconCalculator className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
            title="Todo List"
          >
            <IconClipboard className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
            title="Settings"
          >
            <IconSettings className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
            title="Scene Controls"
            onClick={() => {
              setShowSceneControls(true)
              setIsSceneControlsMinimized(false)
            }}
          >
            <IconMenu2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200 text-sm"
          >
            Share
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
          >
            •••
          </motion.button>
        </div>
      </div>

      {/* 3D Scene - Full height with floating toolbar above */}
      <div className="h-80 relative overflow-hidden">
        <ThreeScene />
      </div>

      {/* Main Content Container - Centered */}
      <div className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full px-6 py-6">
        
        {/* Project Header */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <IconFolder className="w-6 h-6 text-gray-400" />
            <h1 className="text-xl font-medium">{projectName}</h1>
            {isLoadingVehicle ? (
              <div className="flex items-center gap-2 text-sm px-2 py-1">
                <IconCar className="w-4 h-4 text-gray-500" />
                <Skeleton className="h-4 w-32 bg-gray-600/50" />
              </div>
            ) : (
              <motion.button
                onClick={handleEditVehicle}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-700/50"
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
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
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
              className="flex items-center gap-3 bg-[#3a3a3a] rounded-full p-4 border border-gray-600/20"
              whileHover={{ backgroundColor: "#404040" }}
              transition={{ duration: 0.2 }}
            >
              <motion.button 
                onClick={handleStartChat}
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-md hover:bg-gray-600/50 transition-colors"
              >
                <IconPlus className="w-5 h-5 text-gray-400 hover:text-gray-300" />
              </motion.button>
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`New chat in ${projectName}`}
                className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 focus:border-none font-medium focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconMicrophone className="w-5 h-5 text-gray-400 hover:text-gray-300 transition-colors" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconPlayerRecord className="w-5 h-5 text-gray-400 hover:text-gray-300 transition-colors" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Chat History with Separators */}
        <div className="w-full max-h-96">
          {projectChats.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-gray-500">
                <p>No chats yet...</p>
                <p className="text-sm mt-2">Start a conversation above to begin</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full project-chat-scroll">
              <div className="divide-y divide-gray-700/50 pr-4">
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
                        className="flex items-start justify-between p-4 hover:bg-[#3a3a3a]/50 cursor-pointer transition-all duration-200 rounded-lg mx-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ 
                          backgroundColor: "rgba(58, 58, 58, 0.7)",
                          x: 4,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.preventDefault()
                          router.push(`/c/${chat.id}`)
                        }}
                        onContextMenu={(e) => e.stopPropagation()}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium mb-1 text-white truncate">{chat.title}</h3>
                          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                            {/* Show latest message or placeholder */}
                            New conversation
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 ml-4 shrink-0">
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
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for "{selectedChatForAction?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
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
            <Button onClick={confirmRename} disabled={!newChatName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedChatForAction?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
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
            <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Set Vehicle Model'}</DialogTitle>
            <DialogDescription>
              {vehicle 
                ? 'Update the vehicle information for this project.'
                : 'Set the vehicle model for this project to get more accurate assistance.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="make" className="text-right">
                Make
              </Label>
              <Input
                id="make"
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                placeholder="e.g., Hyundai"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model
              </Label>
              <Input
                id="model"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g., Galloper"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">
                Year
              </Label>
              <Input
                id="year"
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                placeholder="e.g., 2000"
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmVehicle()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmVehicle} 
              disabled={!vehicleMake.trim() || !vehicleModel.trim() || !vehicleYear.trim()}
            >
              {vehicle ? 'Update' : 'Set Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>

      {/* Scene Controls Sidebar */}
      <SceneControlsSidebar 
        isOpen={showSceneControls}
        onClose={() => setShowSceneControls(false)}
        isMinimized={isSceneControlsMinimized}
        onToggleMinimized={() => setIsSceneControlsMinimized(!isSceneControlsMinimized)}
      />
    </div>
  )
}