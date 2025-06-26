from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import ChatRoom, ChatMessage, Student, Teacher, User
from app.schemas import ChatRoomResponse, ChatRoomCreate, MessageResponse
from app.auth import get_current_user

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

@router.get("/rooms/{room_id}/messages", response_model=List[MessageResponse])
async def get_room_messages(
    room_id: int,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify chat room exists
    chat_room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
    if not chat_room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat room not found"
        )
    
    # Verify user has access to this chat room
    if current_user.type == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student or chat_room.student_id != student.sap_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this chat room"
            )
    elif current_user.type == "teacher":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher or chat_room.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this chat room"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized user type"
        )
    
    # Mark messages from other user as read
    unread_messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.chat_room_id == room_id,
            ChatMessage.sender_id != current_user.id,
            ChatMessage.is_read == False
        )
        .all()
    )
    
    for message in unread_messages:
        message.is_read = True
    
    db.commit()
    
    # Get paginated messages for this room
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.chat_room_id == room_id)
        .order_by(ChatMessage.sent_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    # Return messages in chronological order
    return list(reversed(messages))

@router.post("/rooms", response_model=ChatRoomResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_room(
    room_data: ChatRoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify the current user is either the student or teacher in this chat
    if current_user.type == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student or room_data.student_id != student.sap_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create this chat room"
            )
    elif current_user.type == "teacher":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher or room_data.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create this chat room"
            )
    
    # Check if chat room already exists between these users
    existing_room = (
        db.query(ChatRoom)
        .filter(
            ChatRoom.student_id == room_data.student_id,
            ChatRoom.teacher_id == room_data.teacher_id
        )
        .first()
    )
    
    if existing_room:
        return existing_room
    
    # Create new chat room
    new_room = ChatRoom(
        student_id=room_data.student_id,
        teacher_id=room_data.teacher_id,
        name=room_data.name
    )
    
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    return new_room

@router.post("/rooms/{room_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    room_id: int,
    message_content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify chat room exists
    chat_room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
    if not chat_room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat room not found"
        )
    
    # Verify user has access to this chat room
    if current_user.type == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student or chat_room.student_id != student.sap_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this chat room"
            )
    elif current_user.type == "teacher":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher or chat_room.teacher_id != teacher.teacher_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this chat room"
            )
    
    # Create new message
    new_message = ChatMessage(
        chat_room_id=room_id,
        sender_id=current_user.id,
        content=message_content,
        is_read=False
    )
    
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return new_message
