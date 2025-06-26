from fastapi import APIRouter, Depends , HTTPException
from oauth import get_current_user
from schemas import ContactUs
from sqlalchemy.orm import Session
from database import get_db
from models import ContactUs as ContactUsModel



router = APIRouter()



@router.post('/contact-us' )
def contact_us(
    data: ContactUs , 
     db: Session = Depends(get_db) 
    ):

    try :
        query = ContactUsModel(  ** data.model_dump() )
        db.add(query)
        db.commit()
        db.refresh(query)

    except Exception as e :
        raise HTTPException(status_code=201 , detail=f"{e}")
    

    return {"message": "Contact us page"}
    