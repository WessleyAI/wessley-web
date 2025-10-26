-- 011_allow_nullable_workspace_id.sql
-- Allow workspace_id to be nullable for user-level chats that aren't tied to specific projects

-- Modify chat_conversations to allow nullable workspace_id
ALTER TABLE public.chat_conversations 
ALTER COLUMN workspace_id DROP NOT NULL;

-- Update the existing index to handle null values
DROP INDEX IF EXISTS idx_chat_conversations_workspace_id;
CREATE INDEX idx_chat_conversations_workspace_id ON public.chat_conversations(workspace_id) WHERE workspace_id IS NOT NULL;

-- Add a new index for user-level (orphaned) chats
CREATE INDEX idx_chat_conversations_user_orphaned ON public.chat_conversations(user_id) WHERE workspace_id IS NULL;

-- Update RLS policy to handle nullable workspace_id
DROP POLICY IF EXISTS "Users can manage own conversations" ON public.chat_conversations;
CREATE POLICY "Users can manage own conversations" ON public.chat_conversations
FOR ALL USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = chat_conversations.workspace_id 
    AND w.user_id = auth.uid()
  )
);