import apiRequest from "@/lib/api-service"

export interface ChatRoomCreate {
  user_id: number
}

export interface MessageSend {
  content: string
}

export interface UserMessage {
  message: string
}

const ChatService = {
  getChatRooms: async () => {
    return await apiRequest("/chat/rooms")
  },

  createChatRoom: async (userId: number) => {
    const payload = { user_id: userId }
  
    return await apiRequest("/chat/rooms", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
,  

  getRoomMessages: async (roomId: number, limit = 50, offset = 0) => {
    return await apiRequest(`/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`)
  },

  sendMessage: async (roomId: number, messageContent: string) => {
    return await apiRequest(`/chat/rooms/${roomId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content: messageContent }),
    })
  },

  askChatbot: async (message: string) => {
    return await apiRequest("/ask_chatbot", {
      method: "POST",
      body: JSON.stringify({ message }),
    })
  },

  searchUsers: async (searchTerm: string) => {
    return await apiRequest(`/users?query=${encodeURIComponent(searchTerm)}`)
  },
}

export default ChatService
