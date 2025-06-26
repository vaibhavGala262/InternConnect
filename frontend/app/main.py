from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routers import users, chat
from app.database import engine
from app.models import Base
from app.utils import ensure_upload_dir

# Create database tables
Base.metadata.create_all(bind=engine)

# Ensure upload directory exists
ensure_upload_dir()

# Initialize FastAPI app
app = FastAPI(
    title="Student-Teacher API",
    description="API for student-teacher communication platform",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(chat.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Student-Teacher API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
