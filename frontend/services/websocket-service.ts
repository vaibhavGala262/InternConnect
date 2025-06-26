class WebSocketService {
  private socket: WebSocket | null = null
  private messageHandlers: ((message: any) => void)[] = []
  private connectionHandlers: (() => void)[] = []
  private disconnectionHandlers: (() => void)[] = []
  private errorHandlers: ((error: Event) => void)[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10 // Increased from 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private pingInterval: NodeJS.Timeout | null = null
  private pingTimeout: NodeJS.Timeout | null = null // New: timeout to detect dead connections
  private currentRoomId: number | null = null
  private isManualDisconnect = false // Flag to track if disconnect was intentional

  connect(roomId: number) {
    // Reset manual disconnect flag
    this.isManualDisconnect = false
    
    // Store the room ID for reconnection attempts
    this.currentRoomId = roomId
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // If already connected to the same room, don't reconnect
      if (this.currentRoomId === roomId) {
        return
      }
      // If connected to a different room, disconnect first
      this.disconnect()
    }

    const token = localStorage.getItem("token")
    if (!token) {
      console.error("No token found, cannot connect to WebSocket")
      return
    }

    try {
      this.socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/chat/${roomId}?token=${token}`)

      this.socket.onopen = () => {
        console.log("WebSocket connected")
        this.reconnectAttempts = 0
        this.connectionHandlers.forEach((handler) => handler())
        
        // Start sending ping messages to keep the connection alive
        this.startPingInterval()
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Reset ping timeout on any message received
          this.resetPingTimeout()
          
          // Reset the reconnect attempts on successful message
          this.reconnectAttempts = 0
          
          // If it's a pong message, just log it without notifying handlers
          if (data.type === 'pong') {
            console.debug("Received pong from server")
            return
          }
          
          console.log("WebSocket message received:", data)
          this.messageHandlers.forEach((handler) => handler(data))
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.socket.onclose = (event) => {
        console.log("WebSocket disconnected", event.code, event.reason)
        
        // Stop the ping interval and timeout
        this.clearPingTimers()
        
        this.disconnectionHandlers.forEach((handler) => handler())

        // Attempt to reconnect if not a normal closure and not manually disconnected
        if (!this.isManualDisconnect && event.code !== 1000 && event.code !== 1001 && this.currentRoomId !== null) {
          this.attemptReconnect()
        } else {
          this.socket = null
          this.currentRoomId = null
        }
      }

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        this.errorHandlers.forEach((handler) => handler(error))
        
        // Don't attempt to reconnect here, let onclose handle it
      }
    } catch (error) {
      console.error("Error creating WebSocket:", error)
      // If connection creation fails, try to reconnect
      this.attemptReconnect()
    }
  }

  private clearPingTimers() {
    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    
    // Clear ping timeout
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout)
      this.pingTimeout = null
    }
  }

  private resetPingTimeout() {
    // Clear existing timeout
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout)
    }
    
    // Set new timeout - if no messages received in 30 seconds, consider connection dead
    this.pingTimeout = setTimeout(() => {
      console.warn("No response from server - connection may be dead")
      this.forcedReconnect()
    }, 30000) // 30 seconds
  }

  private forcedReconnect() {
    // Force close and reconnect
    console.log("Forcing reconnection due to unresponsive connection")
    
    if (this.socket) {
      // Manually close the socket
      try {
        this.socket.close(4000, "Connection timeout")
      } catch (e) {
        console.error("Error while closing socket:", e)
      }
      this.socket = null
    }
    
    // Clear all timers
    this.clearPingTimers()
    
    // Attempt immediate reconnection
    if (this.currentRoomId !== null) {
      this.connect(this.currentRoomId)
    }
  }

  private startPingInterval() {
    // Clear any existing interval
    this.clearPingTimers()
    
    // Reset ping timeout immediately
    this.resetPingTimeout()
    
    // Send a ping every 15 seconds (reduced from 20) to keep the connection alive
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.debug("Sending ping to server")
        this.socket.send(JSON.stringify({ type: 'ping' }))
      } else {
        // If socket is closed during the interval, clear it
        this.clearPingTimers()
      }
    }, 15000) // 15 seconds (reduced from 20)
  }

  private attemptReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentRoomId !== null) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

      // Exponential backoff with jitter to prevent all clients reconnecting at same time
      const jitter = Math.random() * 1000
      const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts) + jitter, 30000) // Changed from 2 to 1.5 for less aggressive backoff

      this.reconnectTimeout = setTimeout(() => {
        console.log(`Reconnecting after ${Math.round(delay)}ms...`)
        if (this.currentRoomId !== null) {
          this.connect(this.currentRoomId)
        }
      }, delay)
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnect attempts reached. Please refresh the page.")
      this.socket = null
      this.currentRoomId = null
    }
  }

  disconnect() {
    this.isManualDisconnect = true
    this.currentRoomId = null
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    this.clearPingTimers()

    if (this.socket) {
      // Only try to close if not already closing or closed
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close(1000, "Disconnected by client")
      }
      this.socket = null
    }
  }

  sendMessage(content: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Reset ping timeout on sending a message
      this.resetPingTimeout()
      
      try {
        this.socket.send(JSON.stringify({ content }))
        return true
      } catch (error) {
        console.error("Error sending WebSocket message:", error)
        this.forcedReconnect()
        return false
      }
    } else {
      console.error("WebSocket is not connected")
      // Try to reconnect if not connected
      if (this.currentRoomId !== null && !this.isManualDisconnect) {
        this.connect(this.currentRoomId)
      }
      return false
    }
  }

  // Force a reconnection if needed
  reconnect() {
    if (this.currentRoomId !== null) {
      console.log("Manually triggering reconnection")
      this.forcedReconnect()
      return true
    }
    return false
  }

  onMessage(handler: (message: any) => void) {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
    }
  }

  onConnect(handler: () => void) {
    this.connectionHandlers.push(handler)
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter((h) => h !== handler)
    }
  }

  onDisconnect(handler: () => void) {
    this.disconnectionHandlers.push(handler)
    return () => {
      this.disconnectionHandlers = this.disconnectionHandlers.filter((h) => h !== handler)
    }
  }

  onError(handler: (error: Event) => void) {
    this.errorHandlers.push(handler)
    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler)
    }
  }

  isConnected() {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }

  // Get the current connection state
  getConnectionState() {
    if (!this.socket) return 'CLOSED';
    
    switch(this.socket.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

// Create a singleton instance
const websocketService = new WebSocketService()
export default websocketService