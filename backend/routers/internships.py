from fastapi import FastAPI, Depends, HTTPException , APIRouter , status , Query
from sqlalchemy.exc import IntegrityError
from schemas import UserBase , TeacherCreate , StudentCreate  , TeacherOut , StudentOut, InternshipCreate , InternshipOut
from database import get_db
from sqlalchemy.orm import Session
from utils import hash
import models
from typing import Union , List  , Optional
from oauth import get_current_user , create_access_token , verify_access_token
from sqlalchemy import or_


router  = APIRouter(
    prefix= '/internships', 
    tags = ['Internships']
)


@router.post('/' , status_code = 201)
def create(internship: InternshipCreate ,  db: Session = Depends(get_db) , current_user: int = Depends(get_current_user)):
    new = models.Internship(**internship.dict())
    if current_user.type == 'student':
        raise HTTPException(status_code = 403 , detail = 'You are not allowed to create internship')
    try:
        db.add(new)
        db.commit()
        db.refresh(new)
        return {"message": "done"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating internship: {str(e.orig)}"
        )
    

@router.get('/'  , response_model = List[InternshipOut])
def get_internships(limit : int =5 ,skip : int=0 ,search : Optional[str]= "" , skills: List[str] = Query(default=[]), db : Session = Depends(get_db) , current_user: int = Depends(get_current_user)):
    print(skills)
    if skills :
        skill_filters = [models.Internship.skills_required.any(skill) for skill in skills]
        print(skill_filters)
    
        internships = (
        db.query(models.Internship)
        .filter(models.Internship.title.ilike(f"%{search}%"))
        .filter(or_(*skill_filters))
        .limit(limit)
        .offset(skip)
        .all()
        )
    else :
            internships = (
        db.query(models.Internship)
        .filter(models.Internship.title.ilike(f"%{search}%"))
        .limit(limit)
        .offset(skip)
        .all()
            )
  
    if not internships :
        raise HTTPException(status_code = 404 , detail = f"No internships found ")
    
    return internships

 

@router.get('/{teacher_id}' , response_model = List[InternshipOut])
def get_internships_of(
    teacher_id: int, 
     db: Session = Depends(get_db)  , 
     current_user: int = Depends(get_current_user)

):  
    teacher = db.query(models.Teacher).filter(models.Teacher.teacher_id==teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail="Teacher not found")
    
    posted_internships = db.query(models.Internship).filter(models.Internship.teacher_id==teacher_id).all()

    return posted_internships





