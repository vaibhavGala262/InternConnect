from  datetime import date
from pydantic import BaseModel, ConfigDict, Field,SkipValidation , EmailStr ,conint , validator  
from typing import Optional  , List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    type: str  # "student" or "teacher"

    @validator('type')
    def validate_type(cls, v):
        if v not in ['student', 'teacher']:
            raise ValueError("type must be either 'student' or 'teacher'")
        return v

class StudentCreateBase(UserBase):
    department: str
    roll_no: str
    graduation_year: Optional[int]
    gpa: Optional[float]

    @validator('gpa')
    def validate_gpa(cls, v):
        if v is not None and (v < 0.0 or v > 10.0):
            raise ValueError('GPA must be between 0.0 and 10.0')
        return v
    

    

class StudentCreate(StudentCreateBase):
    sap_id : int 


class TeacherCreateBase(UserBase):
    department: str
    start_date: date

class UserInfo(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    type: str
    
    class Config:
        orm_mode = True

class TeacherCreate(TeacherCreateBase):
    teacher_id : int 

class TeacherOut(BaseModel):
    id: int
    teacher_id: int
    first_name :str 
    last_name :str
    email: EmailStr
    type: str
    department: str
    start_date: date

    model_config = {
        "from_attributes": True
    }



class StudentOut(BaseModel):
    id: int
    sap_id: int
    type: str
    department: str
    email : EmailStr 
    first_name :str
    last_name :str
    roll_no: str
    graduation_year: Optional[int]
    gpa: Optional[float]

    model_config = {
        "from_attributes": True
    }

class Token(BaseModel):
    access_token: str
    token_type: str



class TokenData(BaseModel):
    id: Optional[str] = None


class InternshipCreate(BaseModel):
    
    title: str
    description: str
    application_link: str  # or use HttpUrl if you want strict URL validation
    company_name: Optional[str] = None
    location: Optional[str] = None
    is_remote: bool = False
    skills_required: Optional[List[str]] = None
    duration_weeks: Optional[int] = None
    deadline: Optional[datetime] = None
    is_active: bool = True
    teacher_id: int
    model_config = {
        "from_attributes": True
    }

class InternshipOut(InternshipCreate):
    id :int     
    teacher : TeacherOut
    model_config = {
        "from_attributes": True
    }

class MessageCreate(BaseModel):
    content: str
    chat_room_id: int

class MessageResponse(BaseModel):
    id: int
    content: str
    sender_id: int
    sent_at: datetime
    is_read: bool
    sender: UserInfo

class ChatRoomCreate(BaseModel):
    teacher_id: int

class ChatRoomResponse(BaseModel):
    id: int
    user_id :int 
    student_id: int
    teacher_id: int
    last_message: Optional[str] = Field(None, description="Preview of the last message")
    last_message_at: Optional[datetime] = Field(None, description="Timestamp of the last message")
    unread_count: int = Field(0, description="Number of unread messages")
    created_at: datetime = Field(..., description="Room creation timestamp")
    
    class Config:
        orm_mode = True

class InternshipStudentOut(BaseModel):
    student : StudentOut
    internship :InternshipOut 
    id :int 
    enrolled_at :datetime
    class Config:
        orm_mode = True



class UserMessage(BaseModel):
    message: str


class EnrollIn(BaseModel):
    internship_id: int

class ContactUs(BaseModel):
    name : str 
    email: EmailStr
    subject : str   
    message : str


class EmailSchema(BaseModel):
    email: EmailStr  # receiver's email
