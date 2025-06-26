
from typing import Dict
from fastapi import WebSocket

# rn we are getting messages loaded which are not recieved 
#but once logout after recieveing all msgs then we can see any new msg in the chat
class ConnectionManager:
    def __init__(self):
        # Map of user_id -> WebSocket connection
        self.active_connections: Dict[int, WebSocket] = {}
        
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        
    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            
    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)
            return True
        return False
    
    def is_connected(self, user_id: int) -> bool:
        return user_id in self.active_connections

manager = ConnectionManager()