"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ChatService from "@/services/chat-service"
import { UserAvatar } from "@/components/user-avatar"

interface Teacher {
  id: number
  teacher_id: number
  first_name: string
  last_name: string
  email: string
  department: string
}

export function ChatWithTeacher({ onChatCreated, userType }: { onChatCreated: () => void; userType: string }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isCreatingChat, setIsCreatingChat] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    try {
      setIsSearching(true)
      const results = await ChatService.searchTeachers(searchTerm)
      setTeachers(results)
    } catch (error) {
      console.error("Error searching teachers:", error)
      toast({
        title: "Error",
        description: "Failed to search for teachers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleCreateChat = async (teacherId: number) => {
    try {
      setIsCreatingChat(teacherId)
      console.log(teacherId)
      await ChatService.createChatRoom( teacherId )
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
          {userType === "teacher" ? "Chat with Colleague" : "Chat with Teacher"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Find a Teacher</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {teachers.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                {isSearching ? "Searching..." : "No teachers found. Try searching by name or department."}
              </p>
            ) : (
              teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar userId={teacher.id} firstName={teacher.first_name} lastName={teacher.last_name} />
                    <div>
                      <p className="font-medium">
                        {teacher.first_name} {teacher.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{teacher.department}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCreateChat(teacher.id)}
                    disabled={isCreatingChat === teacher.id}
                  >
                    {isCreatingChat === teacher.teacher_id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Chat"}
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
