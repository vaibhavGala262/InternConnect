from fastapi import Depends, HTTPException , APIRouter
from sqlalchemy import or_
from sqlalchemy.orm import Session , joinedload
from database import get_db
import models
from oauth import get_current_user 
from datetime import datetime, timedelta




router = APIRouter(prefix='/stats')


seven_days_ago = datetime.utcnow() - timedelta(days=7)

@router.get('/')
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
        
):
    base_internships = db.query(models.Internship)
    total_internships =base_internships.count()
    total_internships_in_last_week=base_internships.filter(models.Internship.created_at >=seven_days_ago).count()
    latest_internship = base_internships.order_by(models.Internship.created_at.desc()).first()

    base_students = db.query(models.Student)
    total_students = base_students.count()
    total_students_created_in_last_week = base_students.filter(models.Student.created_at>=seven_days_ago).count()

    base_teachers = db.query(models.Teacher)
    total_teachers = base_teachers.count()
    total_teachers_created_in_last_week = base_teachers.filter(models.Student.created_at>=seven_days_ago).count()


    unread_messages_base = db.query(models.ChatMessage).join(models.ChatRoom).filter(
    models.ChatMessage.is_read == False,
    models.ChatMessage.sender_id != current_user.id,
    or_(
        models.ChatRoom.student_id == current_user.id,
        models.ChatRoom.teacher_id == current_user.id
    )
)
    total_unread_messages= unread_messages_base.count()
    total_unread_messages_in_last_week = unread_messages_base.filter(models.ChatMessage.sent_at>=seven_days_ago).count()
    latest_message = unread_messages_base.order_by(models.ChatMessage.sent_at.desc()).options(joinedload(models.ChatMessage.sender)).first()


  
  
    return {
        "total_internships":total_internships, 
        'total_interships_lastweek': total_internships_in_last_week , 
        'latest_internship': latest_internship, 
        'total_students': total_students,
        'total_students_lastweek':total_students_created_in_last_week, 
        'total_teachers':total_teachers , 
        'total_teachers_lastweek':total_teachers_created_in_last_week, 
        'total_unread_messages':total_unread_messages, 
        'total_unread_messages_lastweek':total_unread_messages_in_last_week, 
        'latest_message':latest_message
        
            
            }

