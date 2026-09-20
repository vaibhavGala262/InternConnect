from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

import models
from database import get_db
from oauth import get_current_user
from schemas import ChatRoomCreate, ChatRoomResponse


router = APIRouter(prefix="/chat")


def _find_room(db: Session, user_ids: tuple[int, int]):
    return (
        db.query(models.ChatRoom)
        .join(models.ChatRoomParticipant)
        .filter(models.ChatRoomParticipant.user_id.in_(user_ids))
        .group_by(models.ChatRoom.id)
        .having(func.count(distinct(models.ChatRoomParticipant.user_id)) == len(user_ids))
        .filter(
            ~models.ChatRoom.participants.any(
                ~models.ChatRoomParticipant.user_id.in_(user_ids)
            )
        )
        .first()
    )


@router.post("/rooms")
async def create_chat_room(
    chat_room: ChatRoomCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if chat_room.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot start a chat with yourself")

    target_user = db.query(models.User).filter(models.User.id == chat_room.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_ids = tuple(sorted((current_user.id, target_user.id)))
    existing_room = _find_room(db, user_ids)
    if existing_room:
        return existing_room

    new_room = models.ChatRoom()
    new_room.participants = [
        models.ChatRoomParticipant(user_id=current_user.id),
        models.ChatRoomParticipant(user_id=target_user.id),
    ]
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room


@router.get("/rooms", response_model=list[ChatRoomResponse])
async def get_chat_rooms(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rooms = (
        db.query(models.ChatRoom)
        .join(models.ChatRoomParticipant)
        .filter(models.ChatRoomParticipant.user_id == current_user.id)
        .order_by(models.ChatRoom.created_at.desc())
        .all()
    )
    response = []

    for room in rooms:
        other_participant = (
            db.query(models.ChatRoomParticipant)
            .join(models.User)
            .filter(
                models.ChatRoomParticipant.room_id == room.id,
                models.ChatRoomParticipant.user_id != current_user.id,
            )
            .first()
        )
        other_user = other_participant.user if other_participant else None
        other_user_id = other_user.id if other_user else -1
        other_user_name = (
            f"{other_user.first_name} {other_user.last_name}".strip()
            if other_user
            else "Unknown user"
        )

        last_message = (
            db.query(models.ChatMessage)
            .filter(models.ChatMessage.chat_room_id == room.id)
            .order_by(models.ChatMessage.sent_at.desc())
            .first()
        )
        unread_count = (
            db.query(models.ChatMessage)
            .filter(
                models.ChatMessage.chat_room_id == room.id,
                models.ChatMessage.is_read.is_(False),
                models.ChatMessage.sender_id != current_user.id,
            )
            .count()
        )

        response.append(
            ChatRoomResponse(
                id=room.id,
                name=other_user_name,
                user_id=other_user_id,
                last_message=last_message.content if last_message else None,
                last_message_at=last_message.sent_at if last_message else None,
                unread_count=unread_count,
                created_at=room.created_at,
            )
        )

    return response
