"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Send, Loader2, X, ArrowLeft } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import ChatService from "@/services/chat-service"

interface ChatMessage {
  id: number
  content: string
  isBot: boolean
  timestamp: Date
}

export function ChatbotDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      content: "Hello! I'm your internship assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 1,
          content: "Hello! I'm your internship assistant. How can I help you today?",
          isBot: true,
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessageId = Date.now()
    const userMessage = {
      id: userMessageId,
      content: newMessage,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")
    setIsLoading(true)

    try {
      const response = await ChatService.askChatbot(newMessage)
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId + 1,
          content: response.chatbot_reply,
          isBot: true,
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error("Error getting chatbot response:", error)
      toast({
        title: "Error",
        description: "Failed to get response from the chatbot.",
        variant: "destructive",
      })
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId + 1,
          content: "Sorry, I'm having trouble connecting right now.",
          isBot: true,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bot className="h-4 w-4" />
          Ask Chatbot
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col w-full max-w-md h-[70vh] p-0 overflow-hidden">
        {/* Header with back button */}
        <DialogHeader className="border-b p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span>Internship Assistant</span>
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Chat area - now properly fills space */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 px-4 pt-2 pb-0 custom-scrollbar"
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${message.isBot ? "items-start" : "items-end"}`}>
                  {message.isBot && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src="/bot-avatar.png" />
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col gap-1">
                    <div
                      className={`rounded-xl p-3 ${
                        message.isBot 
                          ? "bg-muted" 
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input area - now sticks to bottom */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type your question..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !newMessage.trim()}
              size="icon"
              className="h-10 w-10"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
