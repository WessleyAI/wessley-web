"use client"

import React, { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '@/stores/chat-store'
import { ChatInterface } from '@/components/chat/chat-interface'
import { BenchChatInterface } from './bench-chat-interface'
import { getMessagesByChatId } from '@/db/messages'
import { createWorkspace } from '@/db/workspaces'
import { ChatbotUIContext } from '@/context/context'
import { createClient } from '@/lib/supabase/client'

interface BenchProps {
  chatId?: string
}

export function Bench({ chatId }: BenchProps) {
  console.log('[Bench Component] 🚀 Mounting/Rendering with chatId:', chatId)

  const router = useRouter()
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    addConversation,
    setMessages,
    setUserInput,
    addMessage
  } = useChatStore()

  const { profile, workspaces, setWorkspaces, setSelectedWorkspace } = useContext(ChatbotUIContext)

  console.log('[Bench Component] Context state:', {
    hasProfile: !!profile,
    profileUserId: profile?.user_id,
    workspacesCount: workspaces.length,
    conversationsCount: conversations.length,
    activeConversationId: activeConversation?.id
  })

  // Bench mode: no database, local messages only until onboarding completes
  // Messages stay in Zustand store but no activeConversation until user finishes onboarding
  const [isBenchMode, setIsBenchMode] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authCheckAttempts, setAuthCheckAttempts] = useState(0)

  // AUTH GUARD: Bench is for authenticated users only
  useEffect(() => {
    console.log('[Bench] 🔐 AUTH GUARD: Checking authentication...')
    console.log('[Bench] - Has profile?', !!profile)
    console.log('[Bench] - Profile user_id:', profile?.user_id)
    console.log('[Bench] - Auth check attempts:', authCheckAttempts)

    // If profile loaded, allow access immediately
    if (profile && profile.user_id) {
      console.log('[Bench] ✅ User authenticated - allowing bench access')
      setIsCheckingAuth(false)
      return
    }

    // Wait longer for profile to load (20 seconds max to account for slow connections)
    // Check every 2 seconds, up to 10 times
    if (authCheckAttempts < 10) {
      const timer = setTimeout(() => {
        console.log('[Bench] ⏳ Still waiting for profile to load... (attempt', authCheckAttempts + 1, '/ 10)')
        setAuthCheckAttempts(prev => prev + 1)
      }, 2000)

      return () => clearTimeout(timer)
    }

    // After 20 seconds, if still no profile, redirect to home to login
    console.log('[Bench] ⚠️ Profile not loaded after 20 seconds')
    console.log('[Bench] ⛔ Bench requires authentication')
    console.log('[Bench] 🏠 Redirecting to home page to log in...')

    // DO NOT trigger OAuth here - creates infinite loop!
    // User should click the Login button on the home page
    setIsCheckingAuth(false)
    router.push('/')
  }, [profile, authCheckAttempts, router])

  // Initialize bench with no active conversation (BenchChatInterface handles messages)
  useEffect(() => {
    if (!chatId && isBenchMode) {
      console.log('[Bench] Initializing bench mode - no database conversation')
      setActiveConversation(null)
    }
  }, [chatId, isBenchMode, setActiveConversation])

  // Check for pending workspace after authentication
  useEffect(() => {
    if (profile?.user_id && typeof window !== 'undefined') {
      const pending = localStorage.getItem('pendingWorkspace')
      if (pending) {
        console.log('[Bench] 🎯 Found pending workspace after authentication')
        try {
          const { vehicleInfo, timestamp } = JSON.parse(pending)

          // Check if data is not too old (within 10 minutes)
          if (Date.now() - timestamp < 10 * 60 * 1000) {
            console.log('[Bench] ✅ Resuming workspace creation with vehicle info:', vehicleInfo)
            localStorage.removeItem('pendingWorkspace')

            // Resume workspace creation
            handleOnboardingComplete(vehicleInfo)
          } else {
            console.log('[Bench] ⏰ Pending workspace data expired, clearing')
            localStorage.removeItem('pendingWorkspace')
          }
        } catch (err) {
          console.error('[Bench] ❌ Error parsing pending workspace:', err)
          localStorage.removeItem('pendingWorkspace')
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.user_id])

  // Only handle chatId if it's provided (existing conversation from URL)
  useEffect(() => {
    if (chatId) {
      console.log('[Bench] Loading existing chat:', chatId)
      setIsBenchMode(false) // Exit bench mode, load real conversation

      let conversation = conversations.find(c => c.id === chatId)

      if (!conversation) {
        // Create a new conversation with the provided ID
        conversation = {
          id: chatId,
          title: 'Vehicle Assistant Chat',
          user_id: 'demo-user',
          workspace_id: null,
          ai_model: 'gpt-4',
          system_prompt: 'You are an expert vehicle electrical assistant.',
          context_data: null,
          is_active: true,
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: null
        }

        addConversation(conversation)
      }

      setActiveConversation(conversation)

      // Load messages from database
      const loadMessages = async () => {
        try {
          setMessages([])
          console.log('[Bench] Loading messages for chat:', chatId)
          const messages = await getMessagesByChatId(chatId)
          console.log('[Bench] Loaded messages:', messages.length)
          setMessages(messages)
        } catch (error) {
          console.error('[Bench] Error loading messages:', error)
          setMessages([])
        }
      }

      loadMessages()
    }
  }, [chatId, conversations, addConversation, setActiveConversation, setMessages])

  const handleNewChat = (aiModel: string = 'gpt-4o') => {
    const newConversation = {
      id: crypto.randomUUID(),
      title: 'New Vehicle Chat',
      user_id: 'demo-user', // TODO: Get from auth
      workspace_id: null,
      ai_model: aiModel,
      system_prompt: 'You are an expert vehicle electrical assistant.',
      context_data: null,
      is_active: true,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: null
    }

    addConversation(newConversation)
    setActiveConversation(newConversation)

    // Navigate to the new chat URL
    router.push(`/c/${newConversation.id}`)
  }

  const handleQuickStart = (prompt: string, aiModel: string = 'gpt-4o') => {
    const newConversation = {
      id: crypto.randomUUID(),
      title: 'New Vehicle Chat',
      user_id: 'demo-user', // TODO: Get from auth
      workspace_id: null,
      ai_model: aiModel,
      system_prompt: 'You are an expert vehicle electrical assistant.',
      context_data: null,
      is_active: true,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: null
    }

    addConversation(newConversation)
    setActiveConversation(newConversation)
    setUserInput(prompt) // Pre-fill the input with the selected prompt

    // Navigate to the new chat URL
    router.push(`/c/${newConversation.id}`)
  }

  const handleOnboardingComplete = async (vehicleInfo: any) => {
    console.log('=====================================================')
    console.log('[Bench] 🎯 ONBOARDING COMPLETE - Starting workspace creation flow')
    console.log('[Bench] Vehicle info received:', JSON.stringify(vehicleInfo, null, 2))
    console.log('[Bench] Profile:', JSON.stringify(profile, null, 2))
    console.log('[Bench] Current workspaces count:', workspaces.length)
    console.log('=====================================================')

    // User must be authenticated to reach this point (auth guard handles redirect)
    if (!profile || !profile.user_id) {
      console.error('[Bench] ❌ CRITICAL: handleOnboardingComplete called without authentication!')
      console.error('[Bench] This should never happen - auth guard should prevent this')
      return
    }

    // Exit bench mode
    setIsBenchMode(false)
    console.log('[Bench] ✓ Exited bench mode')

    try {
      // Create the actual workspace in the database
      const workspaceName = vehicleInfo?.nickname || vehicleInfo?.vehicleModel || 'New Vehicle Project'
      const userId = profile.user_id

      console.log('[Bench] 📝 Preparing workspace creation...')
      console.log('[Bench] - Workspace name:', workspaceName)
      console.log('[Bench] - User ID:', userId)
      console.log('[Bench] - Has profile?', !!profile)
      console.log('[Bench] - Has user_id?', !!profile?.user_id)

      const workspaceData = {
        user_id: userId,
        name: workspaceName,
        vehicle_signature: `${vehicleInfo?.vehicleModel || 'vehicle'}-${Date.now()}`,
        status: "active" as const,
        visibility: "private" as const,
      }
      console.log('[Bench] - Workspace data:', JSON.stringify(workspaceData, null, 2))

      console.log('[Bench] 🔄 Calling createWorkspace()...')
      const newWorkspace = await createWorkspace(workspaceData)
      console.log('[Bench] 🔄 createWorkspace() call completed')

      console.log('[Bench] ✅ Workspace created successfully!')
      console.log('[Bench] Workspace details:', JSON.stringify(newWorkspace, null, 2))

      // Update workspaces list in context
      console.log('[Bench] 📋 Updating workspace context...')
      setWorkspaces([newWorkspace, ...workspaces])
      setSelectedWorkspace(newWorkspace)
      console.log('[Bench] ✓ Workspace context updated')

      // Create new conversation with vehicle info and workspace
      const newConversation = {
        id: crypto.randomUUID(),
        title: workspaceName,
        user_id: userId,
        workspace_id: newWorkspace.id,
        ai_model: 'gpt-5.1-chat-latest',
        system_prompt: 'You are an expert vehicle electrical assistant.',
        context_data: {
          vehicleModel: vehicleInfo?.vehicleModel,
          nickname: vehicleInfo?.nickname,
          createdFromOnboarding: true
        },
        is_active: true,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: null
      }

      console.log('[Bench] 💬 Creating conversation...')
      console.log('[Bench] Conversation details:', JSON.stringify(newConversation, null, 2))
      addConversation(newConversation)
      setActiveConversation(newConversation)
      console.log('[Bench] ✓ Conversation created and set as active')

      // Navigate to the workspace/garage PROJECT view with onboarding parameter
      const targetUrl = `/g/${newWorkspace.id}/project?onboarding=complete`
      console.log('[Bench] 🚀 Navigating to:', targetUrl)
      console.log('=====================================================')

      router.push(targetUrl)

      console.log('[Bench] ✓ Navigation command sent')

      // Also log to window for browser console visibility
      if (typeof window !== 'undefined') {
        console.log('%c[Bench] Navigation initiated to:', 'background: #222; color: #bada55', targetUrl)
      }
    } catch (error: any) {
      console.error('=====================================================')
      console.error('[Bench] ❌ ERROR during workspace creation!')
      console.error('[Bench] Error type:', error?.constructor?.name)
      console.error('[Bench] Error message:', error?.message)
      console.error('[Bench] Full error:', error)
      console.error('[Bench] Stack trace:', error?.stack)
      console.error('=====================================================')

      // If database error, redirect to auth if not authenticated, otherwise show error
      if (!profile || !profile.user_id) {
        console.log('[Bench] ⚠️ Not authenticated - redirecting to Google OAuth')
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/demo/bench`
          }
        })
      } else {
        console.error('[Bench] ❌ Workspace creation failed with authenticated user')
        alert('Failed to create workspace. Please try again.')
      }
    }
  }

  const renderMainContent = () => {
    // Show loading while checking authentication
    if (isCheckingAuth) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      )
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={chatId || 'default'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full h-full"
        >
          {isBenchMode ? (
            // Bench mode: database-less chat with local messages only
            <BenchChatInterface onOnboardingComplete={handleOnboardingComplete} />
          ) : (
            // Regular mode: loading existing conversation from database
            <ChatInterface
              onNewChat={handleNewChat}
              onQuickStart={handleQuickStart}
              chatId={chatId}
              hideSceneControls={true}
              isBench={true}
            />
          )}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full"
    >
      {renderMainContent()}
    </motion.div>
  )
}