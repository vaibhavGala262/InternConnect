from fastapi import FastAPI, Depends, HTTPException , APIRouter , status  , Query ,  UploadFile, File
import shutil
import os 
from utils import send_email
from sqlalchemy.exc import IntegrityError
from schemas import EmailSchema, UserBase , TeacherCreate , StudentCreate  , TeacherOut , StudentOut, StudentCreateBase, TeacherCreateBase
from database import get_db
from sqlalchemy.orm import Session
from utils import hash
import models
from typing import Union , List, Optional
from oauth import get_current_user , create_access_token , verify_access_token
from sqlalchemy import or_
from fastapi.responses import FileResponse
from PIL import Image
from io import BytesIO


router = APIRouter(
    prefix= "/users"  , 
    tags = ["Users"]
)

UPLOAD_DIR = "user_photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get('/', response_model=List[StudentOut | TeacherOut])
def search_users(
    db: Session = Depends(get_db),
    current_user: int= Depends(get_current_user),
    query: Optional[str] = Query(None, min_length=2, description="Name search query"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Search for users based on current user's role:
    - Teachers always search students
    - Students always search teachers
    """
    # Determine target model based on current user's role
    if current_user.type == 'teacher':
        target_model = models.Student
    elif current_user.type == 'student':
        target_model = models.Teacher
    else:
        raise HTTPException(status_code=400, detail="Invalid user role")

    # Base query
    base_query = db.query(target_model)

    # Apply search filter if query provided
    if query:
        base_query = base_query.filter(
            or_(
                target_model.first_name.ilike(f"%{query}%"),
                target_model.last_name.ilike(f"%{query}%")
            )
        )

    # Apply pagination
    users = base_query.order_by(target_model.first_name)\
                     .limit(limit).offset(offset).all()

    if not users:
        raise HTTPException(
            status_code=404,
            detail="No users found matching your criteria"
        )

    return users


@router.post('/' , status_code = 201 , response_model = TeacherOut |  StudentOut )
async def post_users(user_data :  Union[StudentCreate, TeacherCreate] , db: Session = Depends(get_db)):
    if user_data.type =="student": 
        new_user=models.Student(
            email = user_data.email, 
            password= hash(user_data.password) ,
            first_name = user_data.first_name , 
            last_name = user_data.last_name ,
            department= user_data.department , 
            roll_no = user_data.roll_no , 
            graduation_year= user_data.graduation_year , 
            gpa = user_data.gpa, 
            type = user_data.type 

        )

    elif user_data.type=="teacher":
        new_user = models.Teacher(
            email = user_data.email , 
            password= hash(user_data.password) , 
            first_name = user_data.first_name  , 
            last_name = user_data.last_name , 
            department  =user_data.department , 
            start_date = user_data.start_date ,
            type = user_data.type 
        )
    


    else:
        raise HTTPException(status_code=400, detail="Invalid user type.")
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
        await send_email(EmailSchema(email=user_data.email))
        return new_user
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e.orig)
        )
    

# update main teacher can change teacher details n student can change student but not interchange
@router.delete('/{id}' , status_code = 204)
def delete(id :int , db: Session = Depends(get_db) , current_user:int= Depends(get_current_user)):

    user= db.query(models.User).filter(models.User.id== id)
    if not user.first() : 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail=f'User  not found')
    
    if user.first().id != current_user.id :
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN , detail=f'Not authorized')
    
    
    print(user)
    user.delete(synchronize_session=False)
    db.commit()
    return {'detail' : f'post with id {id} deleted'}


# delete main teacher can delete teacher but student can delete student 
@router.put('/{id}' , status_code=202)
def update(id : int  ,updated_user  : Union[StudentCreateBase , TeacherCreateBase] , db: Session = Depends(get_db) , current_user:int= Depends(get_current_user) ):
    user_type = current_user.type
    users = db.query(models.User).filter(models.User.id ==id ).first()
    if not users :
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail=f'user with id {id} not found')
    

    if users.id != current_user.id :
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN , detail=f'not allowed to update post with id {id}')
    
    users.email = updated_user.email
    users.first_name = updated_user.first_name
    users.last_name = updated_user.last_name
    users.password = hash(updated_user.password)
    
    # Update specific fields based on type
    if users.type == "student":
        student = db.query(models.Student).filter(models.Student.user_id == id).first()
        student.department = updated_user.department
        student.roll_no = updated_user.roll_no
        student.graduation_year = updated_user.graduation_year
        student.gpa = updated_user.gpa

    elif users.type == "teacher":
        teacher = db.query(models.Teacher).filter(models.Teacher.user_id == id).first()
        teacher.department = updated_user.department
        teacher.start_date = updated_user.start_date

    db.commit()
    return {"detail": f"User with id {id} updated"}



@router.get("/me")
def read_users_me(current_user: int = Depends(get_current_user)):
    return current_user


@router.post("/upload-image")
async def  upload_image(
    current_user: int = Depends(get_current_user) ,
     file: UploadFile = File(...)  
):  
    user_id = current_user.id
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image type")
    
    try:
        image = Image.open(BytesIO(await file.read()))
        rgb_image = image.convert("RGB")  # Convert to RGB (needed for JPEG)

    except Exception:
        raise HTTPException(status_code=400, detail=f"Failed to process image  , Error ${Exception}")
    

    file_path = os.path.join(UPLOAD_DIR, f"user_{user_id}.jpeg")
    rgb_image.save(file_path, "JPEG")

    return {"detail": f"Image uploaded successfully"}


  
@router.get("/get-image/{user_id}")
async def get_image(
    user_id : int ,
    current_user: int = Depends(get_current_user) ,
):
    
    file_path = os.path.join(UPLOAD_DIR , f"user_{user_id}.jpeg")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_200_OK , detail="Image not found")
    
    return FileResponse(file_path  , media_type="image/jpeg" , filename="image.jpg")
    


