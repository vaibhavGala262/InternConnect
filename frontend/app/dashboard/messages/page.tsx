"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Send, MessageSquare, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ChatService from "@/services/chat-service"
import websocketService from "@/services/websocket-service"
import AuthService from "@/services/auth-service"
import { ChatWithTeacher } from "@/components/chat-with-teacher"
import { ChatbotDialog } from "@/components/chatbot-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UserAvatar } from "@/components/user-avatar"

interface ChatRoom {
  id: number
  name: string
  student_id: number
  teacher_id: number
  created_at: string
  last_message?: string
  unread_count?: number
  user_id : number
}

interface Message {
  id: number
  content: string
  sender_id: number
  chat_room_id: number
  sent_at: string
  is_read: boolean
}

export default function MessagesPage() {
  const [userType, setUserType] = useState<"student" | "teacher" | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  


  // Fetch user info and chat rooms
  const fetchChatRooms = async () => {
    try {
      // Get chat rooms
      const rooms = await ChatService.getChatRooms()
      setChatRooms(rooms)
    } catch (error) {
      console.error("Error fetching chat rooms:", error)
      toast({
        title: "Error",
        description: "Failed to load chat rooms. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchUserAndRooms = async () => {
      try {
        setIsLoading(true)

        // Get current user info
        const userInfo = await AuthService.getCurrentUser()
        setUserType(userInfo.type)
        setUserId(userInfo.id)

        await fetchChatRooms()

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load chat data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchUserAndRooms()
  }, [toast])

  // Fetch messages when a room is selected
  useEffect(() => {
    if (selectedRoom) {
      const fetchMessages = async () => {
        try {
          setConnectionError(null)
          const messagesData = await ChatService.getRoomMessages(selectedRoom, 50, 0)
          setMessages(messagesData)

          // Scroll to bottom
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }, 100)

          // Connect to WebSocket
          websocketService.connect(selectedRoom)
        } catch (error) {
          console.error("Error fetching messages:", error)
          toast({
            title: "Error",
            description: "Failed to load messages. Please try again.",
            variant: "destructive",
          })
        }
      }

      fetchMessages()

      // Setup WebSocket connection handlers
      const onConnectHandler = () => {
        setIsConnected(true)
        setConnectionError(null)
      }

      const onDisconnectHandler = () => {
        setIsConnected(false)
      }

      const onErrorHandler = () => {
        setConnectionError("Connection lost. Attempting to reconnect...")
      }

      // Register handlers
      const removeConnectHandler = websocketService.onConnect(onConnectHandler)
      const removeDisconnectHandler = websocketService.onDisconnect(onDisconnectHandler)
      const removeErrorHandler = websocketService.onError(onErrorHandler)

      // Cleanup WebSocket connection
      return () => {
        removeConnectHandler()
        removeDisconnectHandler()
        removeErrorHandler()
        websocketService.disconnect()
      }
    }
  }, [selectedRoom, toast])

  // Handle WebSocket messages
  useEffect(() => {
    if (selectedRoom) {
      const removeMessageHandler = websocketService.onMessage((data) => {
        console.log("WebSocket message received:", data)

        // Check if it's a status update
        if (data.status === "delivered") {
          console.log("Message delivered:", data.message_id)
          return
        }

        // It's a new message
        if (data.id && data.content) {
          setMessages((prev) => {
            // Check if message already exists
            const exists = prev.some((msg) => msg.id === data.id)
            if (exists) return prev
            return [...prev, data]
          })

          // Scroll to bottom
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }, 100)
        }
      })

      return () => {
        removeMessageHandler()
      }
    }
  }, [selectedRoom])

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedRoom) {
      try {
        setIsSending(true)

        // Send message via WebSocket if connected, otherwise use HTTP
        if (websocketService.isConnected()) {
          const sent = websocketService.sendMessage(newMessage)

          if (sent) {
            // Add message to UI immediately (optimistic update)
            const tempMessage: Message = {
              id: Date.now(), // Temporary ID
              content: newMessage,
              sender_id: userId || 0,
              chat_room_id: selectedRoom,
              sent_at: new Date().toISOString(),
              is_read: false,
            }

            setMessages((prev) => [...prev, tempMessage])
            setNewMessage("")
          } else {
            // WebSocket failed to send, fallback to HTTP
            const sentMessage = await ChatService.sendMessage(selectedRoom, newMessage)
            setMessages((prev) => [...prev, sentMessage])
            setNewMessage("")
          }
        } else {
          // Fallback to HTTP
          const sentMessage = await ChatService.sendMessage(selectedRoom, newMessage)
          setMessages((prev) => [...prev, sentMessage])
          setNewMessage("")
        }

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      } catch (error) {
        console.error("Error sending message:", error)
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSending(false)
      }
    }
  }

  const filteredChatRooms = chatRooms

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with students and teachers</p>
        </div>
        <div className="flex gap-2">
      
        <ChatWithTeacher onChatCreated={fetchChatRooms} userType={userType || "student"} />
  <ChatbotDialog />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat List */}
        <div className="w-full md:w-80 border-r flex flex-col">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-0">
              <ScrollArea className="h-[calc(100vh-12rem)] flex-1 p-4 custom-scrollbar">
                <div className="space-y-2 p-2">
                  {filteredChatRooms.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No conversations found.
                      <div className="mt-4">
                        <ChatWithTeacher onChatCreated={fetchChatRooms} userType={userType || "student"} />
                      </div>
                    </div>
                  ) : (
                    filteredChatRooms.map((room) => (
                      
                      <div
                        key={room.id}
                        className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedRoom === room.id ? "bg-primary/10" : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedRoom(room.id)}
                      >
                        <UserAvatar
                          userId={room.user_id}
                          firstName={room.name?.split(" ")[0] || ""}
                          lastName={room.name?.split(" ")[1] || ""}
                        />
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">{room.name}</h3>
                            <span className="text-xs text-muted-foreground">
                              {new Date(room.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">
                              {room.last_message || "No messages yet"}
                            </p>
                            {room.unread_count && room.unread_count > 0 && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                {room.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="unread" className="mt-0">
              <ScrollArea className="h-[calc(100vh-12rem)] custom-scrollbar">
                <div className="space-y-2 p-2 ">
                  {filteredChatRooms.filter((room) => (room.unread_count || 0) > 0).length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No unread messages</div>
                  ) : (
                    filteredChatRooms
                      .filter((room) => (room.unread_count || 0) > 0)
                      .map((room) => (
                        <div
                          key={room.id}
                          className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedRoom === room.id ? "bg-primary/10" : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedRoom(room.id)}
                        >
                          <UserAvatar
                            userId={room.user_id}
                            firstName={room.name?.split(" ")[0] || ""}
                            lastName={room.name?.split(" ")[1] || ""}
                          />
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium truncate">{room.name}</h3>
                              <span className="text-xs text-muted-foreground">
                                {new Date(room.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground truncate">
                                {room.last_message || "No messages yet"}
                              </p>
                              {room.unread_count && room.unread_count > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                  {room.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                
                  <UserAvatar
                  
                    userId={ chatRooms.find((r) => r.id === selectedRoom)?.user_id || 0}
                    
                    firstName={chatRooms.find((r) => r.id === selectedRoom)?.name?.split(" ")[0] || ""}
                    lastName={chatRooms.find((r) => r.id === selectedRoom)?.name?.split(" ")[1] || ""}
                    className="h-8 w-8"
                  />
                  <div>
                    <h3 className="font-medium">{chatRooms.find((r) => r.id === selectedRoom)?.name}</h3>
                    <p className="text-xs text-muted-foreground">{userType === "student" ? "Teacher" : "Student"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {isConnected ? (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      Connected
                    </span>
                  ) : (
                    <span className="text-xs text-yellow-500 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                      Connecting...
                    </span>
                  )}
                </div>
              </div>

              {/* Connection Error Alert */}
              {connectionError && (
                <Alert variant="warning"  className="m-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Connection Issue</AlertTitle>
                  <AlertDescription>{connectionError}</AlertDescription>
                </Alert>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 custom-scrollbar" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No messages yet</div>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser = message.sender_id === userId

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} message-animation`}
                        >
                          <div className="flex gap-2 max-w-[80%]">
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>
                                  {chatRooms
                                    .find((r) => r.id === selectedRoom)
                                    ?.name?.split(" ")
                                    .map((n) => n[0])
                                    .join("") || "U"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <div
                                className={`rounded-lg p-3 ${
                                  isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                              >
                                {message.content}
                              </div>
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <span>
                                  {new Date(message.sent_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {isCurrentUser && (
                                  <span className="ml-2">{message.is_read ? "Read" : "Delivered"}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={isSending || !isConnected}
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={isSending || !isConnected}>
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="flex flex-col items-center justify-center max-w-sm text-center">
                <div className="rounded-full bg-primary/10 p-6 mb-4">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                <p className="text-muted-foreground mb-4">Select a conversation or start a new chat with a teacher</p>
                <ChatWithTeacher onChatCreated={fetchChatRooms} userType={userType || "student"} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    

  )
}
