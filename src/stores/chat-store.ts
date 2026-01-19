import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Tables, TablesInsert } from '@/supabase/types'

export interface ChatMessage {
  id: string
  conversation_id: string
  content: string
  role: 'user' | 'assistant'
  user_id: string | null
  ai_model: string | null
  attached_media_ids: string[] | null
  metadata: any
  created_at: string | null
  ai_tokens_used: number | null
  ai_confidence_score: number | null
}

export interface ChatConversation {
  id: string
  title: string | null
  user_id: string
  workspace_id: string | null
  ai_model: string | null
  system_prompt: string | null
  context_data: any | null
  is_active: boolean | null
  is_archived: boolean | null
  created_at: string | null
  updated_at: string | null
  last_message_at: string | null
  messages?: ChatMessage[]
}

interface ChatState {
  conversations: ChatConversation[]
  activeConversation: ChatConversation | null
  messages: ChatMessage[]
  isGenerating: boolean
  userInput: string
  abortController: AbortController | null

  // Actions
  setConversations: (conversations: ChatConversation[]) => void
  setActiveConversation: (conversation: ChatConversation | null) => void
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (messageId: string, content: string) => void
  setUserInput: (input: string) => void
  setIsGenerating: (generating: boolean) => void
  setAbortController: (controller: AbortController | null) => void
  stopGeneration: () => void
  clearMessages: () => void
  updateConversationTitle: (conversationId: string, title: string) => void
  updateConversationWorkspace: (conversationId: string, workspaceId: string | null) => void
  addConversation: (conversation: ChatConversation) => void
  removeConversation: (conversationId: string) => void
}

export const useChatStore = create<ChatState>()(
  subscribeWithSelector((set, get) => ({
    conversations: [],
    activeConversation: null,
    messages: [],
    isGenerating: false,
    userInput: '',
    abortController: null,

    setConversations: (conversations) => {
      set({ conversations })
    },

    setActiveConversation: (conversation) => {
      // Don't clear messages here - let the caller manage message loading
      set({ activeConversation: conversation })
    },

    setMessages: (messages) => {
      set({ messages })
    },

    addMessage: (message) => {
      set((state) => ({
        messages: [...state.messages, message]
      }))
    },

    updateMessage: (messageId, content) => {
      set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === messageId ? { ...msg, content } : msg
        )
      }))
    },

    setUserInput: (input) => {
      set({ userInput: input })
    },

    setIsGenerating: (generating) => {
      set({ isGenerating: generating })
    },

    setAbortController: (controller) => {
      set({ abortController: controller })
    },

    stopGeneration: () => {
      const { abortController } = get()
      if (abortController) {
        abortController.abort()
        set({ abortController: null, isGenerating: false })
      }
    },

    clearMessages: () => {
      set({ messages: [] })
    },

    updateConversationTitle: (conversationId, title) => {
      set((state) => ({
        conversations: state.conversations.map(conv => 
          conv.id === conversationId ? { ...conv, title } : conv
        ),
        activeConversation: state.activeConversation?.id === conversationId 
          ? { ...state.activeConversation, title }
          : state.activeConversation
      }))
    },

    updateConversationWorkspace: (conversationId, workspaceId) => {
      set((state) => ({
        conversations: state.conversations.map(conv => 
          conv.id === conversationId ? { ...conv, workspace_id: workspaceId } : conv
        ),
        activeConversation: state.activeConversation?.id === conversationId 
          ? { ...state.activeConversation, workspace_id: workspaceId }
          : state.activeConversation
      }))
    },

    addConversation: (conversation) => {
      set((state) => ({
        conversations: [conversation, ...state.conversations]
      }))
    },

    removeConversation: (conversationId) => {
      set((state) => ({
        conversations: state.conversations.filter(conv => conv.id !== conversationId),
        activeConversation: state.activeConversation?.id === conversationId 
          ? null 
          : state.activeConversation,
        messages: state.activeConversation?.id === conversationId ? [] : state.messages
      }))
    }
  }))
)