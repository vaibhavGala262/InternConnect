import models 
from fastapi import HTTPException , FastAPI , Depends , status , Response , APIRouter
from schemas import ChatRoomResponse , ChatRoomCreate 
from database import get_db 
from sqlalchemy.orm import Session
from oauth import get_current_user
from typing import List , Literal


router  = APIRouter(
    prefix="/chat",
)

# Regular HTTP endpoints for chat management
@router.post("/rooms")
async def create_chat_room(
    chat_room: ChatRoomCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    # Ensure current user is a student
    print("Hello")
    
    if current_user.type != "student":
        raise HTTPException(status_code=403, detail="Only students can initiate chat rooms")
    
    # Check if student and teacher exist
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    

    teacher = db.query(models.Teacher).filter(models.Teacher.id == chat_room.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    print("Hello")
    # Check if chat room already exists
    existing_room = db.query(models.ChatRoom).filter(
        models.ChatRoom.student_id == student.sap_id,
        models.ChatRoom.teacher_id == teacher.teacher_id
    ).first()
    
    if existing_room:
        return existing_room
    
    # Create new chat room
    new_room = models.ChatRoom(
        student_id=student.sap_id,
        teacher_id=teacher.teacher_id
    )
    
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    return new_room

#add so you can get name of teacher n student with this 
# @router.get("/rooms/", response_model=List[ChatRoomResponse])
# async def get_chat_rooms(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user)
# ):
#     if current_user.type == "student":
#         student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
#         rooms = db.query(models.ChatRoom).filter(models.ChatRoom.student_id == student.sap_id).all()
#     elif current_user.type == "teacher":
#         teacher = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()
#         rooms = db.query(models.ChatRoom).filter(models.ChatRoom.teacher_id == teacher.teacher_id).all()
#     else:
#         raise HTTPException(status_code=403, detail="Unauthorized")
    
#     return rooms





@router.get("/rooms", response_model=List[ChatRoomResponse])
async def get_chat_rooms(
    current_user: models.User = Depends(get_current_user) , 
    db: Session = Depends(get_db)
):
    """
    Returns all chat rooms for the specified user with last ChatMessage preview and unread count
    """
    # Determine the relationship based on user type
    
    if current_user.type == "student":
        user_id = db.query(models.Student).filter(models.Student.user_id== current_user.id).first().sap_id
        rooms_query = db.query(models.ChatRoom).filter(models.ChatRoom.student_id == user_id)
    else:
        user_id = db.query(models.Teacher).filter(models.Teacher.user_id== current_user.id).first().teacher_id
        rooms_query = db.query(models.ChatRoom).filter(models.ChatRoom.teacher_id == user_id)

    rooms = rooms_query.all()
    response = []
    
    for room in rooms:
        # Get the last ChatMessage
        last_ChatMessage = (db.query(models.ChatMessage)
            .filter(models.ChatMessage.chat_room_id == room.id)
            .order_by(models.ChatMessage.sent_at.desc())
            .first())
        
        # Count unread ChatChatMessages (example logic - adjust as needed)
        unread_count = db.query(models.ChatMessage)\
            .filter(
                models.ChatMessage.chat_room_id == room.id,
                models.ChatMessage.is_read == False,
                models.ChatMessage.sender_id != user_id  # Only count ChatMessages from the other user
            )\
            .count()

        other_user_id = -1
        if current_user.type == "student":
            teacher = db.query(models.Teacher).filter(models.Teacher.teacher_id == room.teacher_id).first()
            other_user_id = teacher.user_id if teacher else -1
        else:
            student = db.query(models.Student).filter(models.Student.sap_id == room.student_id).first()
            other_user_id = student.user_id if student else -1

        response.append(ChatRoomResponse(
            id=room.id,
            student_id=room.student_id,
            teacher_id=room.teacher_id,
            last_message=last_ChatMessage.content if last_ChatMessage else None,
            last_message_at=last_ChatMessage.sent_at if last_ChatMessage else None,
            unread_count=unread_count,
            created_at=room.created_at , 
            user_id=other_user_id
        ))
    
    return response
