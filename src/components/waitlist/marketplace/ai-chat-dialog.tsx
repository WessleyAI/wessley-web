import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partName: string;
  context?: 'buy' | 'sell';
}

export function AIChatDialog({ open, onOpenChange, partName, context = 'buy' }: AIChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize conversation when opened
  useEffect(() => {
    if (open && messages.length === 0) {
      const initialMessage: Message = {
        id: '1',
        role: 'ai',
        content: context === 'buy' 
          ? `I can help you find the best ${partName} for your Hyundai Galloper. I've analyzed 12 nearby sellers and can answer questions about compatibility, pricing, condition, and installation.`
          : `I see you're considering listing a ${partName}. Based on current market data, there's high demand for this part. I can help you price it competitively and provide insights on buyer preferences.`,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, [open, partName, context, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: generateResponse(input, partName, context),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateResponse = (query: string, part: string, ctx?: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('price') || lowerQuery.includes('cost')) {
      return ctx === 'buy'
        ? `For the ${part}, I found prices ranging from $120-$180. The best value is from Auto Parts Pro at $145 (4.9★, 2.3 mi away). They offer a 30-day warranty and have authentic OEM parts.`
        : `Based on recent sales, ${part}s for your Galloper typically sell for $120-$180. I recommend listing at $155 for quick sale, or $175 if condition is excellent.`;
    }
    
    if (lowerQuery.includes('install') || lowerQuery.includes('how')) {
      return `Installing a ${part} typically takes 45-60 minutes. You'll need: basic socket set, wrench, and safety glasses. I can provide step-by-step instructions or recommend nearby mechanics (avg. cost $45-$65).`;
    }
    
    if (lowerQuery.includes('compatible') || lowerQuery.includes('fit')) {
      return `Yes, I've verified compatibility with your 2000 Hyundai Galloper. The ${part} must match VIN specs - I can help verify the part number when you find a seller.`;
    }
    
    if (lowerQuery.includes('seller') || lowerQuery.includes('who')) {
      return `Top 3 sellers: (1) Auto Parts Pro - 4.9★, OEM parts, 30-day warranty, $145. (2) CarParts Hub - 5.0★, refurbished, 90-day warranty, $125. (3) Mike Chen - 4.8★, used/good condition, 14-day return, $142.`;
    }

    return `I can help with that. For your ${part}, would you like me to: (1) Compare all seller offers, (2) Check compatibility details, (3) Provide installation guidance, or (4) Negotiate on your behalf?`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#808080]/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white font-['DM_Sans']">
            <Bot className="w-5 h-5 text-[#8BE196]" />
            AI Assistant
            <span className="text-[#C4C4C4]/70 text-sm font-['DM_Sans']">• {partName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Messages */}
          <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-[#8BE196]/20 border border-[#8BE196]/30 text-gray-200 font-[\'DM_Sans\']'
                        : 'bg-[#161616] border border-[#808080]/30 text-[#C4C4C4] font-[\'DM_Sans\']'
                    }`}
                  >
                    {message.role === 'ai' && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3 h-3 text-[#8BE196]" />
                        <span className="text-[10px] text-[#8BE196] font-['DM_Sans']">Wessley AI</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#161616] border border-[#808080]/30 rounded-lg p-3">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#8BE196]" />
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 bg-[#8BE196] rounded-full"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about pricing, compatibility, installation..."
              className="bg-[#161616] border-[#808080]/30 text-gray-200 placeholder:text-gray-500 resize-none min-h-[60px] max-h-[120px] font-['DM_Sans']"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-[#8BE196] hover:bg-[#9DF4A8] text-[#000000] h-[60px] px-4 font-['DM_Sans'] font-semibold"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {[
              'Compare all sellers',
              'Check compatibility',
              'Installation guide',
              'Best price'
            ].map((action) => (
              <Button
                key={action}
                size="sm"
                variant="ghost"
                onClick={() => {
                  setInput(action);
                  setTimeout(() => handleSend(), 100);
                }}
                className="text-xs h-6 px-2 text-[#C4C4C4]/70 hover:text-[#8BE196] hover:bg-[#8BE196]/10 border border-[#808080]/30 hover:border-[#8BE196]/30 font-['DM_Sans']"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
