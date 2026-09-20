from sqlalchemy.orm import Session
from database import get_db
from fastapi import APIRouter , HTTPException , Depends , status
from oauth import get_current_user
from typing import List
from schemas import InternshipOut , StudentOut , EnrollIn, InternshipStudentOut, ApplicationStatusUpdate
from sqlalchemy.exc import SQLAlchemyError
import models
from openpyxl import Workbook
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
    
    
    internship = db.query(models.Internship).filter(models.Internship.id == data.internship_id).first()
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
    if not internship.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This internship is no longer active")

    existing_application = db.query(models.Enrolled).filter(
        models.Enrolled.internship_id == data.internship_id,
        models.Enrolled.student_id == student.sap_id,
    ).first()
    if existing_application:
        return {"id": existing_application.id, "status": existing_application.status}

    enrollment = models.Enrolled(
        internship_id=data.internship_id,
        student_id=student.sap_id,
        
    )

    try : 
        
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)
        return {"id": enrollment.id, "status": enrollment.status}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e.orig}")


@router.get("/applications/mine", response_model=List[InternshipStudentOut])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.type != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students have personal applications")

    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    return (
        db.query(models.Enrolled)
        .filter(models.Enrolled.student_id == student.sap_id)
        .order_by(models.Enrolled.enrolled_at.desc())
        .all()
    )


@router.get("/applications/received", response_model=List[InternshipStudentOut])
def get_received_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.type != "teacher":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers receive applications")

    teacher = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")

    return (
        db.query(models.Enrolled)
        .join(models.Internship, models.Enrolled.internship_id == models.Internship.id)
        .filter(models.Internship.teacher_id == teacher.teacher_id)
        .order_by(models.Enrolled.enrolled_at.desc())
        .all()
    )


@router.patch("/applications/{application_id}", response_model=InternshipStudentOut)
def update_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.type != "teacher":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can update applications")

    teacher = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()
    application = (
        db.query(models.Enrolled)
        .join(models.Internship, models.Enrolled.internship_id == models.Internship.id)
        .filter(
            models.Enrolled.id == application_id,
            models.Internship.teacher_id == teacher.teacher_id,
        )
        .first()
        if teacher
        else None
    )
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    application.status = payload.status
    db.commit()
    db.refresh(application)
    return application


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def withdraw_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.type != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can withdraw applications")

    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    application = (
        db.query(models.Enrolled)
        .filter(
            models.Enrolled.id == application_id,
            models.Enrolled.student_id == (student.sap_id if student else -1),
        )
        .first()
    )
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if application.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending applications can be withdrawn")

    db.delete(application)
    db.commit()
    return None

@router.get("/enrolled_students/{internship_id}" , response_model=List[InternshipStudentOut] )
def get_enrolled_students(
    internship_id: int, 
    db: Session = Depends(get_db)   , 
    current_user: int = Depends(get_current_user)
):
    internship = db.query(models.Internship).filter(models.Internship.id == internship_id).first()
    if current_user.type != "teacher":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can view applicants")

    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail = f"Internship with id {internship_id} not found")

    teacher = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()
    if not teacher or internship.teacher_id != teacher.teacher_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this internship")
    
    enrolled_students = db.query(models.Enrolled).filter(models.Enrolled.internship_id==internship_id).all()

    return enrolled_students


@router.get('/download-excel-enrolled-students/{internship_id}')
def get_enrolled_students_inexcel(
    internship_id:int  , 
    db: Session = Depends(get_db)   , 
    current_user: int = Depends(get_current_user)

):
    if current_user.type != "teacher":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can export applicants")

    internship = db.query(models.Internship).filter(models.Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")

    teacher = db.query(models.Teacher).filter(models.Teacher.user_id == current_user.id).first()
    if not teacher or internship.teacher_id != teacher.teacher_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this internship")

    results = (
        db.query(models.Enrolled, models.Student)
        .join(models.Student, models.Student.sap_id == models.Enrolled.student_id)
        .filter(models.Enrolled.internship_id == internship_id)
        .order_by(models.Enrolled.enrolled_at.desc())
        .all()
    )

    data = [
        {
            "Sap_id": s.sap_id,
            "Name": s.first_name + " " + s.last_name,
            "Email": s.email,
            "Department":s.department, 
            "roll_no": s.roll_no, 
            "cgpa": s.gpa,
            "Status": enrollment.status.capitalize(),
            "Applied_At": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else "",
        }
        for enrollment, s in results
    ]

    wb = Workbook()
    ws = wb.active
    ws.title = f"StudentsEnrolled_{internship_id}"

    if data:
        headers = list(data[0].keys())
        ws.append(headers)
        for row in data:
            ws.append([row.get(header) for header in headers])
    else:
        ws.append([""])

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
        headers={
            "Content-Disposition": "attachment; filename=students.xlsx"
        }
    )



   






    
    
    



