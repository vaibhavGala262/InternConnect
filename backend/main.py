from fastapi import FastAPI, Depends, HTTPException
import uvicorn
from routers import users  , auth, internships, messages  , chatrooms, internships_logic , chatbot, stats,contact_us
from database import get_db
import models
from fastapi.middleware.cors import CORSMiddleware
import os 
from contextlib import asynccontextmanager
from fastapi import FastAPI


PORT = os.getenv('PORT')


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://intern-connect-seven.vercel.app" ,
        "http://localhost:3000"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


app.include_router(users.router)
app.include_router(auth.router)
app.include_router(internships.router)
app.include_router(messages.router)
app.include_router(chatrooms.router)
app.include_router(internships_logic.router)
app.include_router(chatbot.router)
app.include_router(contact_us.router)
app.include_router(stats.router)


@app.api_route('/', methods=['GET', 'HEAD'])
def home():
    return {"message": "Hello, World!"}


@app.api_route('/health', methods=['GET', 'HEAD'])
def health():
    from sqlalchemy import text
    from database import engine
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception:
        raise HTTPException(
            status_code=503,
            detail={"status": "error", "database": "unreachable"},
        )


if __name__ =='__main__':
    uvicorn.run('main:app', host='localhost', port=int(PORT) , reload = True)
