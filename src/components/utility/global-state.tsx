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
    console.log('[GlobalState] 🎬 Setting up auth listener')
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[GlobalState] 🔔 Auth state changed!')
      console.log('[GlobalState] - Event:', event)
      console.log('[GlobalState] - Has session?', !!session)
      console.log('[GlobalState] - User:', session?.user?.id)

      if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && session)) {
        console.log('[GlobalState] 📥 Fetching data after auth event:', event)
        const profile = await fetchStartingData()

        if (profile) {
          console.log('[GlobalState] ✅ Profile loaded from auth event')
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
            // fetchHostedModels failed, continuing without hosted models
          }
        } else {
          console.error('[GlobalState] ❌ No profile returned from fetchStartingData')
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[GlobalState] 👋 User signed out')
        setProfile(null)
        setWorkspaces([])
        setChats([])
      }
    })

    // Initial fetch on mount
    console.log('[GlobalState] 🚀 Initial data fetch on mount')
    ;(async () => {
      const profile = await fetchStartingData()

      if (profile) {
        console.log('[GlobalState] ✅ Profile loaded from initial fetch')
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
          // fetchHostedModels failed, continuing without hosted models
        }
      } else {
        console.log('[GlobalState] ⚠️ No profile from initial fetch (user not logged in)')
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
    console.log('[GlobalState] 🔍🔍🔍 fetchStartingData FUNCTION CALLED 🔍🔍🔍')
    try {
      console.log('[GlobalState] 📡 Creating Supabase client...')
      console.log('[GlobalState] - NEXT_PUBLIC_SUPABASE_URL exists?', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('[GlobalState] - NEXT_PUBLIC_SUPABASE_ANON_KEY exists?', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      console.log('[GlobalState] - URL value (first 30 chars):', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30))

      const supabase = createClient()
      console.log('[GlobalState] ✅ Supabase client created')
      console.log('[GlobalState] - Client object exists?', !!supabase)
      console.log('[GlobalState] - Auth object exists?', !!supabase?.auth)

      console.log('[GlobalState] 🔐 Getting session...')
      let sessionResponse
      let session = null

      try {
        // Add timeout to prevent hanging indefinitely (increased to 15 seconds to allow slow connections)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getSession() timed out after 15 seconds')), 15000)
        )

        const sessionPromise = supabase.auth.getSession()

        console.log('[GlobalState] ⏱️ Racing getSession() with 15s timeout...')
        sessionResponse = await Promise.race([sessionPromise, timeoutPromise]) as any
        console.log('[GlobalState] 📦 Session response received:', sessionResponse)
        session = sessionResponse?.data?.session
        console.log('[GlobalState] 📦 Extracted session:', session)
      } catch (sessionError: any) {
        console.error('[GlobalState] ❌ ERROR getting session:', sessionError)
        console.error('[GlobalState] Error message:', sessionError?.message)
        console.error('[GlobalState] Error details:', JSON.stringify(sessionError))

        // If getSession times out or fails, try getUser as fallback
        console.log('[GlobalState] 🔄 Trying getUser() as fallback...')
        try {
          const userTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('getUser() timed out after 5 seconds')), 5000)
          )
          const userPromise = supabase.auth.getUser()

          console.log('[GlobalState] ⏱️ Racing getUser() with 5s timeout...')
          const { data: userData, error: userError } = await Promise.race([userPromise, userTimeoutPromise]) as any

          console.log('[GlobalState] 📦 getUser() response:', { hasUser: !!userData?.user, error: userError })

          if (userData?.user && !userError) {
            console.log('[GlobalState] ✅ Got user via getUser():', userData.user.id)
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

      console.log('[GlobalState] =====================================================')
      console.log('[GlobalState] 🔍 fetchStartingData called')
      console.log('[GlobalState] - Has session?', !!session)
      console.log('[GlobalState] - User ID:', session?.user?.id)
      console.log('[GlobalState] - User email:', session?.user?.email)

    if (session) {
      const user = session.user

      try {
        console.log('[GlobalState] 📥 Fetching user data...')
        // Fetch all user data in parallel
        const [profile, onboarding, preferences, socialLinks] = await Promise.all([
          getProfileByUserId(user.id),
          getUserOnboarding(user.id),
          getUserPreferences(user.id),
          getUserSocialLinks(user.id)
        ])

        console.log('[GlobalState] - Profile:', profile ? { user_id: profile.user_id, email: profile.email } : null)
        console.log('[GlobalState] - Onboarding:', onboarding)
        console.log('[GlobalState] - Has completed onboarding?', onboarding?.has_completed)

        // If profile exists but doesn't have avatar, update it with Google avatar
        if (profile && !profile.avatar_url && user.user_metadata?.avatar_url) {
          console.log('[GlobalState] 🖼️ Updating profile avatar from Google')
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
            console.log('[GlobalState] ✅ Profile updated with avatar')
          } else {
            setProfile(profile)
            console.log('[GlobalState] ⚠️ Failed to update avatar:', updateError)
          }
        } else {
          setProfile(profile)
          console.log('[GlobalState] ✅ Profile set')
        }

        // Check if user has completed onboarding
        // SKIP THIS CHECK IF RETURNING TO BENCH (has pendingWorkspace in localStorage)
        const hasPendingWorkspace = typeof window !== 'undefined' && localStorage.getItem('pendingWorkspace')
        console.log('[GlobalState] - Has pending workspace?', !!hasPendingWorkspace)

        if (!onboarding || !onboarding.has_completed) {
          if (hasPendingWorkspace) {
            console.log('[GlobalState] ⚠️ User has pending workspace - skipping setup redirect')
            console.log('[GlobalState] ✅ Allowing user to continue to bench')
            // Don't redirect - let them continue to bench
          } else {
            console.log('[GlobalState] 🔄 No onboarding complete - redirecting to /setup')
            console.log('[GlobalState] =====================================================')
            return router.push("/setup")
          }
        } else {
          console.log('[GlobalState] ✅ Onboarding complete')
        }

      } catch (error) {
        console.error('[GlobalState] ❌ Error fetching user data:', error)
        // If there's an error, it might mean the trigger didn't work
        // Check for pending workspace before redirecting to setup
        const hasPendingWorkspace = typeof window !== 'undefined' && localStorage.getItem('pendingWorkspace')
        if (hasPendingWorkspace) {
          console.log('[GlobalState] ⚠️ Error but has pending workspace - not redirecting to setup')
          // Don't redirect - let them continue to bench where the error will be handled
        } else {
          console.log('[GlobalState] 🔄 Error and no pending workspace - redirecting to /setup')
          // In this case, we should redirect to setup to create missing data
          return router.push("/setup")
        }
      }

      console.log('[GlobalState] 📚 Loading workspaces and chats...')
      const workspaces = await getWorkspacesByUserId(user.id)
      setWorkspaces(workspaces)
      console.log('[GlobalState] - Loaded', workspaces.length, 'workspaces')

      // Load user's chats
      const userChats = await getChatsByUserId(user.id)
      setChats(userChats)
      console.log('[GlobalState] - Loaded', userChats.length, 'chats')

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

      console.log('[GlobalState] ✅ All data loaded successfully')
      console.log('[GlobalState] =====================================================')
      return profile
    } else {
      console.log('[GlobalState] ⚠️ No session found')
      console.log('[GlobalState] =====================================================')
      // No session found
    }
    } catch (error) {
      console.error('[GlobalState] ❌ Error in fetchStartingData:', error)
      console.log('[GlobalState] =====================================================')
      // Error in fetchStartingData
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