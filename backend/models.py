from sqlalchemy import TIMESTAMP, Column , String ,Boolean, Integer, text , ForeignKey  , Float  , Date, Text, DateTime , ARRAY, UniqueConstraint
from sqlalchemy.orm import relationship, validates
from database import Base
from datetime import datetime



class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(256), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False  , server_default=text('now()'))
    type = Column(String(50))  # Add this to User class
    
    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": type,
        "with_polymorphic": "*"
    }

    
    
class Student(User):
    __tablename__ = "students"
    sap_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id' , ondelete = 'CASCADE')  ,nullable = False )
    department= Column(String(50)  , nullable = False )
    roll_no = Column(String(50) , nullable = False ,unique = True)
    graduation_year = Column(Integer , nullable = True )
    gpa = Column(Float , nullable = True )
    enrolled_in = relationship("Enrolled", back_populates="student")
    
    __mapper_args__ = {
        "polymorphic_identity": "student"
    }


class Teacher(User):
    __tablename__ = "teachers"
    teacher_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id' , ondelete = 'CASCADE' ) , nullable = False)
    department = Column(String(50) , nullable = False )
    start_date = Column(Date, nullable = False )  # e.g., 2024-04-07
    internships = relationship("Internship", back_populates="teacher")
    

    __mapper_args__ = {
        "polymorphic_identity": "teacher",
    }



class Internship(Base):
    __tablename__ = 'internships'
    
    id = Column(Integer, primary_key=True , index= True )
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    application_link = Column(String(512), nullable=False )
    company_name = Column(String(100) )
    location = Column(String(100))
    is_remote = Column(Boolean, default=False)
    skills_required = Column(ARRAY(String))
    duration_weeks = Column(Integer)
    deadline = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    teacher_id = Column(Integer, ForeignKey('teachers.teacher_id'))
    teacher = relationship("Teacher", back_populates="internships")
    saved_by = relationship("Enrolled", back_populates="internship")
    
    @validates('application_link')
    def validate_application_link(self, key, link):
        assert link.startswith(('http://', 'https://')), "Invalid URL"
        return link
    
    __table_args__ = (
        UniqueConstraint('title', 'company_name', name='uq_title_company'),
    )

    
class Enrolled(Base):
    __tablename__ = 'enrolled'

    id = Column(Integer , primary_key=True  )
    student_id = Column(Integer, ForeignKey('students.sap_id') , nullable= False)
    internship_id = Column(Integer, ForeignKey('internships.id') , nullable= False)
    enrolled_at  = Column(DateTime , default=datetime.utcnow )

    student =relationship("Student" , back_populates='enrolled_in')
    internship = relationship("Internship", back_populates="saved_by")
    __table_args__ = (
        UniqueConstraint('student_id', 'internship_id',  name='uq_student_internship'),
    )

# two routes


class ChatRoom(Base):
    __tablename__ = "chat_rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    
    # Participants
    student_id = Column(Integer, ForeignKey('students.sap_id'), nullable=False)
    teacher_id = Column(Integer, ForeignKey('teachers.teacher_id'), nullable=False)
    
    # Relationships
    student = relationship("Student", backref="chat_rooms")
    teacher = relationship("Teacher", backref="chat_rooms")
    messages = relationship("ChatMessage", back_populates="chat_room", cascade="all, delete-orphan")
    
    # Enforce uniqueness for student-teacher pair
    __table_args__ = (
        UniqueConstraint('student_id', 'teacher_id', name='uq_student_teacher_chat'),
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_room_id = Column(Integer, ForeignKey('chat_rooms.id', ondelete='CASCADE'), nullable=False)
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    sent_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    is_read = Column(Boolean, default=False)
    
    # Relationships
    chat_room = relationship("ChatRoom", back_populates="messages")
    sender = relationship("User")


class ContactUs(Base):
    __tablename__ = "contact_us"
   
    
    id = Column(Integer, primary_key=True , autoincrement=True)  # Add unique ID
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text , nullable=False)



    