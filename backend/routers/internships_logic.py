from sqlalchemy.orm import Session
from database import get_db
from fastapi import APIRouter , HTTPException , Depends , status
from oauth import get_current_user
from typing import List
from schemas import InternshipOut , StudentOut , EnrollIn, InternshipStudentOut
from sqlalchemy.exc import SQLAlchemyError
import models
import pandas as pd 
from fastapi.responses import StreamingResponse
from io import BytesIO



router= APIRouter()


@router.get('/my_internships' , response_model=List[InternshipOut] )
def get_my_internships(
     db: Session = Depends(get_db)  , 
     current_user: int = Depends(get_current_user)

):
    if current_user.type =="student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN , detail="Student not allowed to see internships")
    
    teacher = db.query(models.User).filter(models.User.id==current_user.id).first()

    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail="Teacher not found")
    
    my_internships = (db.query(models.Internship)
                      .filter(models.Internship.teacher_id==teacher.teacher_id)
                      .all())
    return my_internships

@router.get('/my-internships/{internship_id}' , response_model = InternshipOut)
def get_internships_of(
    internship_id: int,
     db: Session = Depends(get_db)  , 
     current_user: int = Depends(get_current_user)

):  
    internship = db.query(models.Internship).filter(models.Internship.id==internship_id).first()
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail="Internship not found")
    
    return internship


#write enrollment logic

@router.post("/enroll"  , status_code=status.HTTP_201_CREATED  )
def enroll_in_internship(
    data : EnrollIn,
    db: Session = Depends(get_db)   , 
    current_user: int = Depends(get_current_user)
):
    if current_user.type == "teacher":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN , detail=f"Teachers not allowed to enroll in internships")

    student = db.query(models.Student).filter(models.Student.id == current_user.id).first()
    

    if not student : 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail="Student not found")
    
    
    enrollment = models.Enrolled(
        internship_id=data.internship_id,
        student_id=student.sap_id,
        
    )

    try : 
        
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)


    except SQLAlchemyError as e : 
        raise HTTPException(status_code=  status.HTTP_500_INTERNAL_SERVER_ERROR , detail = f"{e.orig}")
    
    




@router.get("/enrolled_students/{internship_id}" , response_model=List[InternshipStudentOut] )
def get_enrolled_students(
    internship_id: int, 
    db: Session = Depends(get_db)   , 
    current_user: int = Depends(get_current_user)
):
    internship = db.query(models.Internship).filter(models.Internship.id == internship_id).first()
    if current_user.type =="student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN , detail="Student not allowed to see who enrolled")
    

    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail = f"Internship with id {internship_id} not found")
    
    enrolled_students = db.query(models.Enrolled).filter(models.Enrolled.internship_id==internship_id).all()

    return enrolled_students


@router.get('/download-excel-enrolled-students/{internship_id}')
def get_enrolled_students_inexcel(
    internship_id:int  , 
    db: Session = Depends(get_db)   , 
    current_user: int = Depends(get_current_user)

):
    
    results = (
        db.query(models.Student )
        .join(models.Enrolled, models.Student.sap_id  == models.Enrolled.student_id)
        .filter(models.Enrolled.internship_id == internship_id)
        .all()
    )

    data = [
        {
            "Sap_id": s.sap_id,
            "Name": s.first_name + " " + s.last_name,
            "Email": s.email,
            "Department":s.department, 
            "roll_no": s.roll_no, 
            "cgpa": s.gpa
        }
        for s in results
    ]
    df = pd.DataFrame(data)
    output= BytesIO()

    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=True ,  sheet_name=f"StudentsEnrolled_{internship_id}")
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
        headers={
            "Content-Disposition": "attachment; filename=students.xlsx"
        }
    )



   






    
    
    



