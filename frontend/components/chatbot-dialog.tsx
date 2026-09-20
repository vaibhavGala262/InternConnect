"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import { ChatbotPanel } from "@/components/chatbot-panel"

export function ChatbotDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bot className="h-4 w-4" />
          Ask Chatbot
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[min(720px,90vh)] w-[min(720px,calc(100vw-2rem))] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Internship Assistant</DialogTitle>
        </DialogHeader>
        <ChatbotPanel />
      </DialogContent>
    </Dialog>
  )
}
