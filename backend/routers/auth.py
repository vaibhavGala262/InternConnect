from fastapi import APIRouter , Depends , status, HTTPException , Response 
from fastapi.security.oauth2 import  OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
import schemas, models, utils , oauth


router = APIRouter(tags=["Authentication"])


@router.post('/login')
def login(user_credential : OAuth2PasswordRequestForm=Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email==user_credential.username).first()

    if  not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN , detail='wrong email')
    
    original_hashed =user.password
    given_plain = user_credential.password
    
    flag = utils.compare(given_plain , original_hashed )

    if not flag:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN , detail='wrong password')
    
    access_token = oauth.create_access_token(data={"user_id": user.id})
    return {"access_token": access_token , "token_type": "bearer"}