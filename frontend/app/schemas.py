from datetime import datetime
from typing import Optional, List, Union
from pydantic import BaseModel, EmailStr, Field

# Base User Schema
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    type: str

# Student Schemas
class StudentBase(UserBase):
    department: str
    roll_no: str
    graduation_year: int
    gpa: float
    type: str = "student"

class StudentCreate(StudentBase):
    password: str

class StudentOut(StudentBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# Teacher Schemas
class TeacherBase(UserBase):
    department: str
    start_date: datetime
    type: str = "teacher"

class TeacherCreate(TeacherBase):
    password: str

class TeacherOut(TeacherBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

# Chat Schemas
class ChatRoomBase(BaseModel):
    student_id: int
    teacher_id: int
    name: str

class ChatRoomCreate(ChatRoomBase):
    pass

class ChatRoomResponse(ChatRoomBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class MessageBase(BaseModel):
    content: str
    is_read: bool = False

class MessageCreate(MessageBase):
    chat_room_id: int
    sender_id: int

class MessageResponse(MessageBase):
    id: int
    chat_room_id: int
    sender_id: int
    sent_at: datetime
    
    class Config:
        orm_mode = True
