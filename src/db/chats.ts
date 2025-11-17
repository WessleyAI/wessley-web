import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getChatById = async (chatId: string) => {
  const { data: chat } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("id", chatId)
    .maybeSingle()

  return chat
}

export const getChatsByWorkspaceId = async (workspaceId: string) => {
  const { data: chats, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  if (!chats) {
    throw new Error(error.message)
  }

  return chats
}

export const getChatsByUserId = async (userId: string) => {
  const { data: chats, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return chats || []
}

export const getOrphanedChatsByUserId = async (userId: string) => {
  const { data: chats, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("user_id", userId)
    .is("workspace_id", null)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return chats || []
}

export const createChat = async (chat: TablesInsert<"chat_conversations">) => {
  console.log('[DB] createChat called with:', chat)
  console.log('[DB] Supabase client initialized:', !!supabase)
  console.log('[DB] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

  try {
    // First, test the connection by querying the table
    console.log('[DB] Testing Supabase connection...')
    const testQuery = supabase
      .from("chat_conversations")
      .select("id")
      .limit(1)

    const testTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection test timeout after 5s')), 5000)
    )

    const testResult = await Promise.race([testQuery, testTimeout]) as any
    console.log('[DB] Connection test result:', testResult)

    if (testResult.error) {
      console.error('[DB] Connection test failed:', testResult.error)
      throw new Error(`Supabase connection failed: ${testResult.error.message}`)
    }

    // Add timeout to Supabase operation itself
    const insertPromise = supabase
      .from("chat_conversations")
      .insert([chat])
      .select("*")
      .single()

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase insert timeout after 10s')), 10000)
    )

    console.log('[DB] Starting Supabase insert operation...')
    const { data: createdChat, error } = await Promise.race([insertPromise, timeoutPromise]) as any

    console.log('[DB] Supabase response:', { data: createdChat, error })

    if (error) {
      console.error('[DB] Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(error.message)
    }

    if (!createdChat) {
      console.error('[DB] No chat created and no error returned')
      throw new Error('Failed to create chat - no data returned')
    }

    console.log('[DB] Chat created successfully:', createdChat)
    return createdChat
  } catch (err) {
    console.error('[DB] createChat exception:', err)
    console.error('[DB] Exception type:', err instanceof Error ? 'Error' : typeof err)
    console.error('[DB] Exception details:', err)
    throw err
  }
}

export const createChats = async (chats: TablesInsert<"chat_conversations">[]) => {
  const { data: createdChats, error } = await supabase
    .from("chat_conversations")
    .insert(chats)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  return createdChats
}

export const updateChat = async (
  chatId: string,
  chat: TablesUpdate<"chat_conversations">
) => {
  const { data: updatedChat, error } = await supabase
    .from("chat_conversations")
    .update(chat)
    .eq("id", chatId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedChat
}

export const deleteChat = async (chatId: string) => {
  const { error } = await supabase.from("chat_conversations").delete().eq("id", chatId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
