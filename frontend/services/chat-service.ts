import apiRequest from "@/lib/api-service"

export interface ChatRoomCreate {
  teacher_id: number
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

  createChatRoom: async (teacherId: number) => {
     // NOT { teacher_id: { teacher_id: teacherId } }
    const payload = { teacher_id: teacherId };
    console.log(teacherId)
    console.log("Sending payload:", payload); // should print: { teacher_id: 2 }
  
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

  searchTeachers: async (searchTerm: string) => {
    return await apiRequest(`/users?type=teacher&query=${encodeURIComponent(searchTerm)}`)
  },
}

export default ChatService