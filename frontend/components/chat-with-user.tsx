"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ChatService from "@/services/chat-service"
import { UserAvatar } from "@/components/user-avatar"

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  type: "student" | "teacher"
}

export function ChatWithUser({ onChatCreated }: { onChatCreated: () => void; userType: string }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isCreatingChat, setIsCreatingChat] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    try {
      setIsSearching(true)
      setUsers(await ChatService.searchUsers(searchTerm))
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        title: "Error",
        description: "Failed to search for users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleCreateChat = async (userId: number) => {
    try {
      setIsCreatingChat(userId)
      await ChatService.createChatRoom(userId)
      toast({
        title: "Success",
        description: "Chat room created successfully.",
      })
      setIsOpen(false)
      onChatCreated()
    } catch (error) {
      console.error("Error creating chat room:", error)
      toast({
        title: "Error",
        description: "Failed to create chat room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingChat(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="h-4 w-4" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Find a User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch()
              }}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
            {users.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {isSearching ? "Searching..." : "No users found. Try a name or email."}
              </p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-md border p-3 hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <UserAvatar userId={user.id} firstName={user.first_name} lastName={user.last_name} />
                    <div>
                      <p className="font-medium">{user.first_name} {user.last_name}</p>
                      <p className="text-sm capitalize text-muted-foreground">{user.type}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleCreateChat(user.id)} disabled={isCreatingChat === user.id}>
                    {isCreatingChat === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Chat"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
