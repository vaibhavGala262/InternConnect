"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Loader2, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import AuthService from "@/services/auth-service"
import ChatService from "@/services/chat-service"

interface ChatMessage {
  id: number
  content: string
  isBot: boolean
  timestamp: Date
}

export function ChatbotPanel() {
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
  const [historyKey, setHistoryKey] = useState<string | null>(null)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true

    const loadHistory = async () => {
      try {
        const user = await AuthService.getCurrentUser()
        const key = `internconnect_chat_history_${user.id}`
        const saved = localStorage.getItem(key)

        if (isMounted) {
          setHistoryKey(key)
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed.map((message) => ({ ...message, timestamp: new Date(message.timestamp) })))
            }
          }
          setHistoryLoaded(true)
        }
      } catch (error) {
        console.error("Failed to load chatbot history:", error)
        if (isMounted) {
          setHistoryKey("internconnect_chat_history")
          setHistoryLoaded(true)
        }
      }
    }

    loadHistory()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (historyKey && historyLoaded) {
      localStorage.setItem(historyKey, JSON.stringify(messages))
    }
  }, [historyKey, historyLoaded, messages])

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]")
    viewport?.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
  }, [messages])

  const handleClearChat = () => {
    setMessages([])
    if (historyKey) localStorage.removeItem(historyKey)
  }

  const handleSendMessage = async () => {
    const content = newMessage.trim()
    if (!content || isLoading) return

    const userMessageId = Date.now()
    setMessages((previous) => [
      ...previous,
      { id: userMessageId, content, isBot: false, timestamp: new Date() },
    ])
    setNewMessage("")
    setIsLoading(true)

    try {
      const response = await ChatService.askChatbot(content)
      setMessages((previous) => [
        ...previous,
        { id: userMessageId + 1, content: response.chatbot_reply, isBot: true, timestamp: new Date() },
      ])
    } catch (error) {
      console.error("Error getting chatbot response:", error)
      toast({
        title: "Error",
        description: "Failed to get response from the chatbot.",
        variant: "destructive",
      })
      setMessages((previous) => [
        ...previous,
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-background">
      <div className="flex shrink-0 items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 bg-primary/10">
            <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">Internship Assistant</h2>
            <p className="text-xs text-muted-foreground">Ask about internships and the platform</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClearChat}>Clear</Button>
      </div>

      <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1 p-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] rounded-xl p-3 ${message.isBot ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                <p className="mt-1 text-right text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="shrink-0 border-t bg-background p-4">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Input
            placeholder="Type your question..."
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={isLoading || !historyLoaded}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !newMessage.trim() || !historyLoaded} size="icon">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
