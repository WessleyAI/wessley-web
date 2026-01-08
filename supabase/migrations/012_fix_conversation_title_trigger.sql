-- Fix the generate_conversation_title function to check conversation title, not message title
-- The bug was checking NEW.title (from chat_messages which doesn't have that column)
-- Should check the conversation's title instead

CREATE OR REPLACE FUNCTION public.generate_conversation_title()
RETURNS TRIGGER AS $$
DECLARE
  first_message TEXT;
  generated_title TEXT;
  conversation_title TEXT;
  message_count INT;
BEGIN
  -- Only generate title for user messages
  IF NEW.role = 'user' THEN
    -- Check if conversation already has a title
    SELECT title,
           (SELECT COUNT(*) FROM public.chat_messages WHERE conversation_id = NEW.conversation_id)
    INTO conversation_title, message_count
    FROM public.chat_conversations
    WHERE id = NEW.conversation_id;

    -- Only generate title if:
    -- 1. Conversation has no title OR has default title
    -- 2. This is one of the first messages (to avoid race conditions)
    IF (conversation_title IS NULL OR conversation_title LIKE 'New Chat%' OR conversation_title LIKE 'Chat%')
       AND message_count <= 2 THEN

      -- Get the first few words of the content
      first_message := split_part(NEW.content, ' ', 1) || ' ' ||
                      split_part(NEW.content, ' ', 2) || ' ' ||
                      split_part(NEW.content, ' ', 3) || ' ' ||
                      split_part(NEW.content, ' ', 4);

      -- Clean and truncate
      generated_title := substr(trim(first_message), 1, 50);
      IF length(generated_title) < length(trim(first_message)) THEN
        generated_title := generated_title || '...';
      END IF;

      -- Update the conversation with the generated title
      UPDATE public.chat_conversations
      SET title = generated_title, updated_at = NOW()
      WHERE id = NEW.conversation_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
