from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)  # "student" or "teacher"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __mapper_args__ = {
        "polymorphic_on": type,
        "polymorphic_identity": "user"
    }

class Student(User):
    __tablename__ = "students"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    sap_id = Column(Integer, primary_key=True, autoincrement=True)
    department = Column(String(100), nullable=False)
    roll_no = Column(String(20), unique=True, nullable=False)
    graduation_year = Column(Integer, nullable=False)
    gpa = Column(Float, nullable=False)
    
    chat_rooms = relationship("ChatRoom", back_populates="student")
    
    __mapper_args__ = {
        "polymorphic_identity": "student"
    }

class Teacher(User):
    __tablename__ = "teachers"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    teacher_id = Column(Integer, primary_key=True, autoincrement=True)
    department = Column(String(100), nullable=False)
    start_date = Column(DateTime, nullable=False)
    
    chat_rooms = relationship("ChatRoom", back_populates="teacher")
    
    __mapper_args__ = {
        "polymorphic_identity": "teacher"
    }

class ChatRoom(Base):
    __tablename__ = "chat_rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.sap_id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    student = relationship("Student", back_populates="chat_rooms")
    teacher = relationship("Teacher", back_populates="chat_rooms")
    messages = relationship("ChatMessage", back_populates="chat_room", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_room_id = Column(Integer, ForeignKey("chat_rooms.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    
    chat_room = relationship("ChatRoom", back_populates="messages")
    sender = relationship("User")
