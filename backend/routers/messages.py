import models 
from fastapi import HTTPException , FastAPI , Depends , status , Response , APIRouter
from schemas import ChatRoomResponse , ChatRoomCreate , MessageResponse 
from database import get_db 
from sqlalchemy.orm import Session , joinedload
from oauth import get_current_user
from typing import List


router= APIRouter(
    prefix='/chat'
)

@router.get("/rooms/{room_id}/messages", response_model=List[MessageResponse])
async def get_room_messages(
    limit: int,
    offset: int,
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    print("Hello")
    # Ensure the user is a participant in this chat room
    chat_room = db.query(models.ChatRoom).filter(models.ChatRoom.id == room_id).first()
    if not chat_room:
        raise HTTPException(status_code=404, detail="Chat room not found")
    
    if current_user.type == "student":
        student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
        print("Hello")
        if chat_room.student_id != student.sap_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this chat room")
    elif current_user.type == "teacher":
        teacher = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()
        if chat_room.teacher_id != teacher.teacher_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this chat room")
    else:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Mark messages from the other user as read
    messages_to_mark = (
        db.query(models.ChatMessage).filter(
            models.ChatMessage.chat_room_id == room_id,
            models.ChatMessage.sender_id != current_user.id,
            models.ChatMessage.is_read == False
        )
        .order_by(models.ChatMessage.sent_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    for message in messages_to_mark:
        message.is_read = True
    
    db.commit()
    
    # Get all messages for this room with sender information
    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.chat_room_id == room_id)
        .options(joinedload(models.ChatMessage.sender))  # Eagerly load the sender
        .order_by(models.ChatMessage.sent_at)
        .all()
    )
    
    return messages