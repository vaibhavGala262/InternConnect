from fastapi import FastAPI, Depends, HTTPException
import uvicorn
from routers import users  , auth, internships, messages  , chatrooms, internships_logic , chatbot, stats,contact_us
from routers.websocket.endpoint import websocket_endpoint
from database import get_db
from database import Base  , engine
import models
from fastapi.middleware.cors import CORSMiddleware
import os 

PORT = os.getenv('PORT')


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://intern-connect-seven.vercel.app" ,  # Your frontend URL
        "http://localhost:3000"
    ],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


app.include_router(users.router)
app.include_router(auth.router)
app.include_router(internships.router)
app.include_router(messages.router)
app.include_router(chatrooms.router)
app.add_api_websocket_route("/ws/chat/{room_id}", websocket_endpoint)
app.include_router(internships_logic.router)
app.include_router(chatbot.router)
app.include_router(contact_us.router)
app.include_router(stats.router)

Base.metadata.create_all(bind = engine)
@app.get('/')
def home():
    return {"message": "Hello, World!"}


if __name__ =='__main__':
    uvicorn.run('main:app', host='localhost', port=int(PORT) , reload = True)
