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
import { useRouter, usePathname } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { DEMO_WORKSPACE_ID } from "@/lib/demo-workspace"

interface GlobalStateProps {
  children: React.ReactNode
}

export const GlobalState: FC<GlobalStateProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()

  // Check if we're on the demo workspace path - skip all auth redirects
  const isDemoPath = pathname?.includes(DEMO_WORKSPACE_ID)

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
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

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
            console.error('[GlobalState] ❌ fetchHostedModels failed:', error)
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
        setWorkspaces([])
        setChats([])
      }
    })

    // Initial fetch on mount
    ;(async () => {
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
          console.error('[GlobalState] ❌ fetchHostedModels failed:', error)
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
    try {

      const supabase = createClient()

      let sessionResponse
      let session = null

      try {
        // Add timeout to prevent hanging indefinitely (increased to 15 seconds to allow slow connections)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getSession() timed out after 15 seconds')), 15000)
        )

        const sessionPromise = supabase.auth.getSession()

        sessionResponse = await Promise.race([sessionPromise, timeoutPromise]) as any
        session = sessionResponse?.data?.session
      } catch (sessionError: any) {
        console.error('[GlobalState] ❌ ERROR getting session:', sessionError)
        console.error('[GlobalState] Error message:', sessionError?.message)
        console.error('[GlobalState] Error details:', JSON.stringify(sessionError))

        // If getSession times out or fails, try getUser as fallback
        try {
          const userTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('getUser() timed out after 5 seconds')), 5000)
          )
          const userPromise = supabase.auth.getUser()

          const { data: userData, error: userError } = await Promise.race([userPromise, userTimeoutPromise]) as any


          if (userData?.user && !userError) {
            // Create a minimal session object
            session = { user: userData.user } as any
          } else {
            console.error('[GlobalState] ❌ getUser() also failed:', userError)
          }
        } catch (userFallbackError: any) {
          console.error('[GlobalState] ❌ getUser() threw exception:', userFallbackError?.message)
          console.error('[GlobalState] ⚠️ Both auth methods timed out - user may not be authenticated')
          console.error('[GlobalState] 💡 NOT clearing session - let user re-authenticate via Login button if needed')
          // DO NOT call signOut() - this creates an infinite loop!
          // The session might be valid but just slow to load
        }
      }


    if (session) {
      const user = session.user

      try {
        // Fetch all user data in parallel
        const [profile, onboarding, preferences, socialLinks] = await Promise.all([
          getProfileByUserId(user.id),
          getUserOnboarding(user.id),
          getUserPreferences(user.id),
          getUserSocialLinks(user.id)
        ])


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
            setProfile(updatedProfile)
          } else {
            setProfile(profile)
          }
        } else {
          setProfile(profile)
        }

        // Check if user has completed onboarding
        // SKIP THIS CHECK IF RETURNING TO BENCH (has pendingWorkspace in localStorage)
        const hasPendingWorkspace = typeof window !== 'undefined' && localStorage.getItem('pendingWorkspace')

        if (!onboarding || !onboarding.has_completed) {
          if (hasPendingWorkspace || isDemoPath) {
            // Don't redirect - let them continue to bench or demo
          } else {
            return router.push("/setup")
          }
        }

      } catch (error) {
        console.error('[GlobalState] ❌ Error fetching user data:', error)
        // If there's an error, it might mean the trigger didn't work
        // Check for pending workspace or demo path before redirecting to setup
        const hasPendingWorkspace = typeof window !== 'undefined' && localStorage.getItem('pendingWorkspace')
        if (hasPendingWorkspace || isDemoPath) {
          // Don't redirect - let them continue to bench/demo where the error will be handled
        } else {
          // In this case, we should redirect to setup to create missing data
          return router.push("/setup")
        }
      }

      const workspaces = await getWorkspacesByUserId(user.id)
      setWorkspaces(workspaces)

      // Load user's chats
      const userChats = await getChatsByUserId(user.id)
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
    }
    } catch (error) {
      console.error('[GlobalState] ❌ Error in fetchStartingData:', error)
      return null
    }
  }

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