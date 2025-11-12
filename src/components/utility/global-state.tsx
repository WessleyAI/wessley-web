// TODO: Separate into multiple contexts, keeping simple for now

"use client"

import { ChatbotUIContext } from "@/context/context"
import { getProfileByUserId } from "@/db/profile"
import { getUserOnboarding } from "@/db/user-onboarding"
import { getUserPreferences } from "@/db/user-preferences"
import { getUserSocialLinks } from "@/db/user-social-links"
import { getChatsByUserId } from "@/db/chats"
import { getWorkspaceImageFromStorage } from "@/db/storage/workspace-images"
import { getWorkspacesByUserId } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import {
  fetchHostedModels,
  fetchOllamaModels,
  fetchOpenRouterModels
} from "@/lib/models/fetch-models"
import { createClient } from "@/lib/supabase/client"
import { Tables } from "@/supabase/types"
import {
  ChatFile,
  ChatMessage,
  ChatSettings,
  LLM,
  MessageImage,
  OpenRouterLLM,
  WorkspaceImage
} from "@/types"
import { AssistantImage } from "@/types/images/assistant-image"
import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"

interface GlobalStateProps {
  children: React.ReactNode
}

export const GlobalState: FC<GlobalStateProps> = ({ children }) => {
  console.log('🔴 GlobalState - Component mounted!')
  if (typeof window !== 'undefined') {
    console.log('🔴 GlobalState - Running on client side')
  }
  const router = useRouter()

  // PROFILE STORE
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null)

  // ITEMS STORE
  const [assistants, setAssistants] = useState<Tables<"assistants">[]>([])
  const [collections, setCollections] = useState<Tables<"collections">[]>([])
  const [chats, setChats] = useState<Tables<"chat_conversations">[]>([])
  const [files, setFiles] = useState<Tables<"files">[]>([])
  const [folders, setFolders] = useState<Tables<"folders">[]>([])
  const [models, setModels] = useState<Tables<"models">[]>([])
  const [presets, setPresets] = useState<Tables<"presets">[]>([])
  const [prompts, setPrompts] = useState<Tables<"prompts">[]>([])
  const [tools, setTools] = useState<Tables<"tools">[]>([])
  const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([])

  // MODELS STORE
  const [envKeyMap, setEnvKeyMap] = useState<Record<string, VALID_ENV_KEYS>>({})
  const [availableHostedModels, setAvailableHostedModels] = useState<LLM[]>([])
  const [availableLocalModels, setAvailableLocalModels] = useState<LLM[]>([])
  const [availableOpenRouterModels, setAvailableOpenRouterModels] = useState<
    OpenRouterLLM[]
  >([])

  // WORKSPACE STORE
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<Tables<"workspaces"> | null>(null)
  const [workspaceImages, setWorkspaceImages] = useState<WorkspaceImage[]>([])

  // PRESET STORE
  const [selectedPreset, setSelectedPreset] =
    useState<Tables<"presets"> | null>(null)

  // ASSISTANT STORE
  const [selectedAssistant, setSelectedAssistant] =
    useState<Tables<"assistants"> | null>(null)
  const [assistantImages, setAssistantImages] = useState<AssistantImage[]>([])
  const [openaiAssistants, setOpenaiAssistants] = useState<any[]>([])

  // PASSIVE CHAT STORE
  const [userInput, setUserInput] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    model: "gpt-4-turbo-preview",
    prompt: "You are a helpful AI assistant.",
    temperature: 0.5,
    contextLength: 4000,
    includeProfileContext: true,
    includeWorkspaceInstructions: true,
    embeddingsProvider: "openai"
  })
  const [selectedChat, setSelectedChat] = useState<Tables<"chat_conversations"> | null>(null)
  const [chatFileItems, setChatFileItems] = useState<Tables<"file_items">[]>([])

  // ACTIVE CHAT STORE
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [firstTokenReceived, setFirstTokenReceived] = useState<boolean>(false)
  const [abortController, setAbortController] =
    useState<AbortController | null>(null)

  // CHAT INPUT COMMAND STORE
  const [isPromptPickerOpen, setIsPromptPickerOpen] = useState(false)
  const [slashCommand, setSlashCommand] = useState("")
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false)
  const [hashtagCommand, setHashtagCommand] = useState("")
  const [isToolPickerOpen, setIsToolPickerOpen] = useState(false)
  const [toolCommand, setToolCommand] = useState("")
  const [focusPrompt, setFocusPrompt] = useState(false)
  const [focusFile, setFocusFile] = useState(false)
  const [focusTool, setFocusTool] = useState(false)
  const [focusAssistant, setFocusAssistant] = useState(false)
  const [atCommand, setAtCommand] = useState("")
  const [isAssistantPickerOpen, setIsAssistantPickerOpen] = useState(false)

  // ATTACHMENTS STORE
  const [chatFiles, setChatFiles] = useState<ChatFile[]>([])
  const [chatImages, setChatImages] = useState<MessageImage[]>([])
  const [newMessageFiles, setNewMessageFiles] = useState<ChatFile[]>([])
  const [newMessageImages, setNewMessageImages] = useState<MessageImage[]>([])
  const [showFilesDisplay, setShowFilesDisplay] = useState<boolean>(false)

  // RETIEVAL STORE
  const [useRetrieval, setUseRetrieval] = useState<boolean>(true)
  const [sourceCount, setSourceCount] = useState<number>(4)

  // TOOL STORE
  const [selectedTools, setSelectedTools] = useState<Tables<"tools">[]>([])
  const [toolInUse, setToolInUse] = useState<string>("none")

  useEffect(() => {
    console.log('🟢 GlobalState - useEffect running')
    
    // Listen for auth state changes
    console.log('🟡 Setting up auth state listener')
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🟠 GlobalState - Auth state changed:', event, session)
      
      if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && session)) {
        const profile = await fetchStartingData()
        
        if (profile) {
          try {
            const hostedModelRes = await fetchHostedModels(profile)
            if (hostedModelRes) {
              setEnvKeyMap(hostedModelRes.envKeyMap)
              setAvailableHostedModels(hostedModelRes.hostedModels)

              if (
                profile["openrouter_api_key"] ||
                hostedModelRes.envKeyMap["openrouter"]
              ) {
                const openRouterModels = await fetchOpenRouterModels()
                if (openRouterModels) {
                  setAvailableOpenRouterModels(openRouterModels)
                }
              }
            }
          } catch (error) {
            console.log("fetchHostedModels failed, continuing without hosted models:", error)
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
        setWorkspaces([])
        setChats([])
      }
    })

    // Initial fetch
    console.log('🔆 Starting initial data fetch')
    ;(async () => {
      console.log('🔆 About to call fetchStartingData directly')
      const profile = await fetchStartingData()

      if (profile) {
        try {
          const hostedModelRes = await fetchHostedModels(profile)
          if (hostedModelRes) {
            setEnvKeyMap(hostedModelRes.envKeyMap)
            setAvailableHostedModels(hostedModelRes.hostedModels)

            if (
              profile["openrouter_api_key"] ||
              hostedModelRes.envKeyMap["openrouter"]
            ) {
              const openRouterModels = await fetchOpenRouterModels()
              if (openRouterModels) {
                setAvailableOpenRouterModels(openRouterModels)
              }
            }
          }
        } catch (error) {
          console.log("fetchHostedModels failed, continuing without hosted models:", error)
        }
      }

      if (process.env.NEXT_PUBLIC_OLLAMA_URL) {
        const localModels = await fetchOllamaModels()
        if (!localModels) return
        setAvailableLocalModels(localModels)
      }
    })()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchStartingData = async () => {
    console.log('🟪 GlobalState - fetchStartingData called')
    
    try {
      const supabase = createClient()
      const session = (await supabase.auth.getSession()).data.session
      console.log('🟪 GlobalState - Session:', session)

    if (session) {
      const user = session.user
      console.log('GlobalState - User:', user)

      try {
        // Fetch all user data in parallel
        const [profile, onboarding, preferences, socialLinks] = await Promise.all([
          getProfileByUserId(user.id),
          getUserOnboarding(user.id),
          getUserPreferences(user.id),
          getUserSocialLinks(user.id)
        ])

        console.log('GlobalState - Fetched profile:', profile)
        console.log('GlobalState - Fetched onboarding:', onboarding)
        console.log('GlobalState - Profile avatar_url:', profile?.avatar_url)
        console.log('GlobalState - Profile image_url:', profile?.image_url)
        console.log('GlobalState - User avatar_url:', user.user_metadata?.avatar_url)

        // If profile exists but doesn't have avatar, update it with Google avatar
        if (profile && !profile.avatar_url && user.user_metadata?.avatar_url) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              avatar_url: user.user_metadata.avatar_url,
              full_name: user.user_metadata.full_name || profile.full_name
            })
            .eq('user_id', user.id)
          
          if (!updateError) {
            const updatedProfile = { 
              ...profile, 
              avatar_url: user.user_metadata.avatar_url,
              full_name: user.user_metadata.full_name || profile.full_name
            }
            console.log('GlobalState - Setting updated profile:', updatedProfile)
            setProfile(updatedProfile)
          } else {
            console.log('GlobalState - Setting profile (update failed):', profile)
            setProfile(profile)
          }
        } else {
          console.log('GlobalState - Setting profile (no update needed):', profile)
          setProfile(profile)
        }
        
        // Check if user has completed onboarding
        if (!onboarding || !onboarding.has_completed) {
          return router.push("/setup")
        }
        
      } catch (error) {
        console.error("Error loading user data:", error)
        // If there's an error, it might mean the trigger didn't work
        // In this case, we should redirect to setup to create missing data
        return router.push("/setup")
      }

      const workspaces = await getWorkspacesByUserId(user.id)
      console.log('GlobalState - Fetched workspaces:', workspaces)
      setWorkspaces(workspaces)

      // Load user's chats
      const userChats = await getChatsByUserId(user.id)
      console.log('GlobalState - Fetched chats:', userChats)
      setChats(userChats)

      for (const workspace of workspaces) {
        let workspaceImageUrl = ""

        if (workspace.image_path) {
          workspaceImageUrl =
            (await getWorkspaceImageFromStorage(workspace.image_path)) || ""
        }

        if (workspaceImageUrl) {
          const response = await fetch(workspaceImageUrl)
          const blob = await response.blob()
          const base64 = await convertBlobToBase64(blob)

          setWorkspaceImages(prev => [
            ...prev,
            {
              workspaceId: workspace.id,
              path: workspace.image_path,
              base64: base64,
              url: workspaceImageUrl
            }
          ])
        }
      }

      return profile
    } else {
      console.log('🟪 GlobalState - No session found')
    }
    } catch (error) {
      console.error('🔴 GlobalState - Error in fetchStartingData:', error)
      return null
    }
  }

  console.log('🔵 GlobalState - About to render')
  
  return (
    <ChatbotUIContext.Provider
      value={{
        // PROFILE STORE
        profile,
        setProfile,

        // ITEMS STORE
        assistants,
        setAssistants,
        collections,
        setCollections,
        chats,
        setChats,
        files,
        setFiles,
        folders,
        setFolders,
        models,
        setModels,
        presets,
        setPresets,
        prompts,
        setPrompts,
        tools,
        setTools,
        workspaces,
        setWorkspaces,

        // MODELS STORE
        envKeyMap,
        setEnvKeyMap,
        availableHostedModels,
        setAvailableHostedModels,
        availableLocalModels,
        setAvailableLocalModels,
        availableOpenRouterModels,
        setAvailableOpenRouterModels,

        // WORKSPACE STORE
        selectedWorkspace,
        setSelectedWorkspace,
        workspaceImages,
        setWorkspaceImages,

        // PRESET STORE
        selectedPreset,
        setSelectedPreset,

        // ASSISTANT STORE
        selectedAssistant,
        setSelectedAssistant,
        assistantImages,
        setAssistantImages,
        openaiAssistants,
        setOpenaiAssistants,

        // PASSIVE CHAT STORE
        userInput,
        setUserInput,
        chatMessages,
        setChatMessages,
        chatSettings,
        setChatSettings,
        selectedChat,
        setSelectedChat,
        chatFileItems,
        setChatFileItems,

        // ACTIVE CHAT STORE
        isGenerating,
        setIsGenerating,
        firstTokenReceived,
        setFirstTokenReceived,
        abortController,
        setAbortController,

        // CHAT INPUT COMMAND STORE
        isPromptPickerOpen,
        setIsPromptPickerOpen,
        slashCommand,
        setSlashCommand,
        isFilePickerOpen,
        setIsFilePickerOpen,
        hashtagCommand,
        setHashtagCommand,
        isToolPickerOpen,
        setIsToolPickerOpen,
        toolCommand,
        setToolCommand,
        focusPrompt,
        setFocusPrompt,
        focusFile,
        setFocusFile,
        focusTool,
        setFocusTool,
        focusAssistant,
        setFocusAssistant,
        atCommand,
        setAtCommand,
        isAssistantPickerOpen,
        setIsAssistantPickerOpen,

        // ATTACHMENT STORE
        chatFiles,
        setChatFiles,
        chatImages,
        setChatImages,
        newMessageFiles,
        setNewMessageFiles,
        newMessageImages,
        setNewMessageImages,
        showFilesDisplay,
        setShowFilesDisplay,

        // RETRIEVAL STORE
        useRetrieval,
        setUseRetrieval,
        sourceCount,
        setSourceCount,

        // TOOL STORE
        selectedTools,
        setSelectedTools,
        toolInUse,
        setToolInUse
      }}
    >
      {children}
    </ChatbotUIContext.Provider>
  )
}