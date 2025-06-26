from fastapi import WebSocket , WebSocketDisconnect , status ,HTTPException ,Depends 
import json 
from database import get_db
from routers.websocket.websocket_manager import manager 
from utils import get_current_user_ws
from sqlalchemy.orm import Session
import models
 
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    # Authenticate user
    try:
        current_user = await get_current_user_ws(token, db)
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    
    
    # Verify chat room access
    chat_room = db.query(models.ChatRoom).filter(models.ChatRoom.id == room_id).first()
    if not chat_room:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    
    has_access = False
    if current_user.type == "student":
        print(current_user.id)
        student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
        
        if student and chat_room.student_id == student.sap_id:
            has_access = True
            print("Hello")
    elif current_user.type == "teacher":
        teacher = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()
        if teacher and chat_room.teacher_id == teacher.teacher_id:
            has_access = True
    
    if not has_access:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    # Connect to WebSocket
  

    await manager.connect(websocket, current_user.id)
    # fetch msg by student
    unread_messages = db.query(models.ChatMessage).filter(
    models.ChatMessage.chat_room_id == room_id,
    models.ChatMessage.sender_id != current_user.id,
    models.ChatMessage.is_read == False
).order_by(models.ChatMessage.sent_at).all()

    for message in unread_messages:
    # Send the message over WebSocket
        message_response = {
        "id": message.id,
        "content": message.content,
        "sender_id": message.sender_id,
        "chat_room_id": message.chat_room_id,
        "sent_at": message.sent_at.isoformat(),
        "is_read": message.is_read
    }
        await websocket.send_text(json.dumps(message_response))
    
    # Mark it as read
        message.is_read = True

    db.commit()
    
    try:
        while True:
            # Receive message from WebSocket
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Create database record
            new_message = models.ChatMessage(
                chat_room_id=room_id,
                sender_id=current_user.id,
                content=message_data["content"],
                is_read=False
            )
            
            db.add(new_message)
            db.commit()
            db.refresh(new_message)
            
            # Determine recipient
            recipient_id = None
            if current_user.type == "student":
                teacher = db.query(models.Teacher).filter(models.Teacher.teacher_id == chat_room.teacher_id).first()
                if teacher:
                    recipient_id = teacher.user_id
            elif current_user.type == "teacher":
                student = db.query(models.Student).filter(models.Student.sap_id == chat_room.student_id).first()
                if student:
                    recipient_id = student.user_id
            
            # Format message for sending
            message_response = {
                "id": new_message.id,
                "content": new_message.content,
                "sender_id": new_message.sender_id,
                "chat_room_id": new_message.chat_room_id,
                "sent_at": new_message.sent_at.isoformat(),
                "is_read": new_message.is_read
            }
            
            # Send message to recipient if online
            if recipient_id:
                if manager.is_connected(recipient_id):
                    await manager.send_personal_message(json.dumps(message_response), recipient_id)
                
            # Send acknowledgment back to sender
            await websocket.send_text(json.dumps({
                "status": "delivered",
                "message_id": new_message.id
            }))
                
    except WebSocketDisconnect:
        manager.disconnect(current_user.id)