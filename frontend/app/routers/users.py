from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List, Union, Annotated

from app.database import get_db
from app.models import Student, Teacher, User
from app.schemas import StudentCreate, TeacherCreate, StudentOut, TeacherOut, UserBase
from app.utils import hash_password
from app.auth import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# Get all users based on current user type (teachers see students, students see teachers)
@router.get('/', response_model=List[Union[StudentOut, TeacherOut]], status_code=status.HTTP_200_OK)
async def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type == 'student':
        users = db.query(Teacher).all()
    elif current_user.type == 'teacher':
        users = db.query(Student).all()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user type"
        )
    
    return users

# Create a new user (student or teacher)
@router.post('/', status_code=status.HTTP_201_CREATED, response_model=Union[TeacherOut, StudentOut])
async def create_user(
    user_data: Union[StudentCreate, TeacherCreate],
    db: Session = Depends(get_db)
):
    try:
        if user_data.type == "student":
            new_user = Student(
                email=user_data.email,
                password=hash_password(user_data.password),
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                department=user_data.department,
                roll_no=user_data.roll_no,
                graduation_year=user_data.graduation_year,
                gpa=user_data.gpa,
                type=user_data.type
            )
        elif user_data.type == "teacher":
            new_user = Teacher(
                email=user_data.email,
                password=hash_password(user_data.password),
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                department=user_data.department,
                start_date=user_data.start_date,
                type=user_data.type
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user type"
            )
            
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
        
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User creation failed: {str(e.orig)}"
        )

# Delete a user (can only delete yourself)
@router.delete('/{id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {id} not found"
        )
    
    if user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this user"
        )
    
    db.delete(user)
    db.commit()
    
    return {"detail": f"User with id {id} deleted successfully"}

# Update a user (can only update yourself)
@router.put('/{id}', status_code=status.HTTP_200_OK)
async def update_user(
    id: int,
    updated_user: Union[StudentCreate, TeacherCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {id} not found"
        )
    
    if user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    # Update base user fields
    user.email = updated_user.email
    user.first_name = updated_user.first_name
    user.last_name = updated_user.last_name
    user.password = hash_password(updated_user.password)
    
    # Update specific fields based on type
    if user.type == "student":
        student = db.query(Student).filter(Student.user_id == id).first()
        student.department = updated_user.department
        student.roll_no = updated_user.roll_no
        student.graduation_year = updated_user.graduation_year
        student.gpa = updated_user.gpa
    elif user.type == "teacher":
        teacher = db.query(Teacher).filter(Teacher.user_id == id).first()
        teacher.department = updated_user.department
        teacher.start_date = updated_user.start_date
    
    db.commit()
    db.refresh(user)
    
    return {"detail": f"User with id {id} updated successfully"}
