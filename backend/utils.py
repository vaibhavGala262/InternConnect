from passlib.context import CryptContext
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from fastapi_mail import FastMail , MessageSchema
from pydantic import EmailStr, BaseModel
from config import conf
from oauth import verify_access_token
import models
pwd_context= CryptContext(schemes=["bcrypt"],deprecated = "auto")
from schemas import EmailSchema



def hash(password:str):
    return pwd_context.hash(password)

def compare(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def to_dict_list(results):
    return [dict(row._mapping) for row in results]



async def get_current_user_ws(token: str, db: Session):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Use your actual authentication logic here
    # This is a placeholder - replace with your actual authentication function
    # user= verify_access_token(token, db)
    # if user is None:
    #     raise credentials_exception
    # return user

    token  = verify_access_token(token , credentials_exception)
    user = db.query(models.User).filter(models.User.id == token.id).first()
    print(user)
    return user


async def send_email(data: EmailSchema):
    message = MessageSchema(
        subject="Welcome To InternConnect" ,
        recipients=[data.email], 
        body = "Hey there! You successfully registered. Thanks for joining!",
        subtype="plain"
    )

    try :
        fm = FastMail(conf)
        await fm.send_message(message=message)
        print("Mail Is Sent")
        return {
        "message": "email sent successfully"
        }
    except Exception as e :
        return {
            "message": f"An Error occured {e}"
        }




