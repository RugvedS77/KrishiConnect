# router/auth_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database.postgresConn import get_db
# FIX: Import the specific model and schemas needed, with aliases
from models.all_model import User as UserModel
from schemas.all_schema import TokenWithUser
from auth import hashing, token

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

@router.post("/login", response_model=TokenWithUser)
def login(
    request: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Use the UserModel for the query
    user = db.query(UserModel).filter(UserModel.email == request.username).first()

    if not user or not hashing.Hash.verify(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = token.create_access_token(data={"sub": user.email})
  
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user 
    }