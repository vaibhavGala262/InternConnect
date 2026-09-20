from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

import models
from database import get_db
from oauth import get_current_user
from schemas import ChatRoomCreate, ChatRoomResponse, MessageResponse

router = APIRouter(prefix="/chat")


class MessageCreate(BaseModel):
    content: str


def _require_participant(db: Session, room_id: int, user_id: int) -> models.ChatRoom:
    room = db.query(models.ChatRoom).filter(models.ChatRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Chat room not found")

    participant = (
        db.query(models.ChatRoomParticipant)
        .filter(
            models.ChatRoomParticipant.room_id == room_id,
            models.ChatRoomParticipant.user_id == user_id,
        )
        .first()
    )
    if not participant:
        raise HTTPException(status_code=403, detail="Not authorized to access this chat room")
    return room

@router.get("/rooms/{room_id}/messages", response_model=List[MessageResponse])
async def get_room_messages(
    limit: int,
    offset: int,
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    print("Hello")
    chat_room = _require_participant(db, room_id, current_user.id)
    
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


@router.post("/rooms/{room_id}/messages")
async def create_room_message(
    room_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _require_participant(db, room_id, current_user.id)

    message = models.ChatMessage(
        chat_room_id=room_id,
        sender_id=current_user.id,
        content=payload.content,
        is_read=False,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return {
        "id": message.id,
        "content": message.content,
        "sender_id": message.sender_id,
        "chat_room_id": message.chat_room_id,
        "sent_at": message.sent_at,
        "is_read": message.is_read,
    }
