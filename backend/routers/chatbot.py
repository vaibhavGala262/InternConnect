from fastapi import APIRouter  , HTTPException , Depends
from database import get_db 
from oauth import get_current_user
from schemas import UserMessage
from sqlalchemy.orm import Session 
import httpx 
from chatbot import get_gemini_response



router = APIRouter()

# @router.post('/ask_chatbot')
# async def ask_chatbot(text: UserMessage  , 
#         db: Session = Depends(get_db)  , 
#         current_user: int = Depends(get_current_user)
#                       ):
#     print(text.message)
#     try:
#         async with httpx.AsyncClient() as client:
#             response = await client.post(
#                 "http://localhost:8000/chat",
#                 json={"message": text.message}
#             )
#         response.raise_for_status()  # raises exception if status is not 200 OK
#         return {"chatbot_reply": response.json()["response"]}
    
#     except httpx.RequestError as e:
#         # This will catch connection errors
#         print(f"Request failed: {e}")
#         raise HTTPException(status_code=503, detail="Chatbot server is not available")
#     except httpx.HTTPStatusError as e:
#         # This will catch non-2xx HTTP responses
#         print(f"HTTP error: {e}")
#         raise HTTPException(status_code=500, detail="Chatbot server returned an error")





@router.post('/ask_chatbot')
async def ask_chatbot(
    text: UserMessage,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    print("User asked:", text.message)
    try:
        reply = get_gemini_response(text.message)
        return {"chatbot_reply": reply}
    except Exception as e:
        print(f"Gemini error: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong with Gemini AI")
    