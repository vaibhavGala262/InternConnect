"use client"

import { Bot } from "lucide-react"
import { ChatbotPanel } from "@/components/chatbot-panel"

export default function ChatbotPage() {
  return (
    <div className="flex h-[calc(100dvh-2rem)] min-h-0 flex-col p-4 md:p-6">
      <div className="mb-4 flex shrink-0 items-center gap-3">
        <Bot className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">Get help with internships and InternConnect.</p>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ChatbotPanel />
      </div>
    </div>
  )
}
