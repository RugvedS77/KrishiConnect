# routers/wallet_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.postgresConn import get_db
# FIX: Import models and schemas with aliases
from models.all_model import User as UserModel, Wallet as WalletModel, Transaction as TransactionModel, UserRole
from schemas.all_schema import Wallet as WalletSchema, TokenData, WalletAddFunds, Transaction as TransactionSchema
from auth import oauth2

router = APIRouter(
    prefix="/api/wallet",
    tags=["Wallet & Payments"]
)

@router.get("/me", response_model=WalletSchema)
def get_user_wallet(
    db: Session = Depends(get_db),
    current_user_token: TokenData = Depends(oauth2.get_current_user)
):
    user = db.query(UserModel).filter(UserModel.email == current_user_token.username).first()
    if not user or not user.wallet:
        raise HTTPException(status_code=404, detail="Wallet not found for this user.")
    return user.wallet

@router.post("/me/add-funds", response_model=WalletSchema)
def add_dummy_funds(
    request: WalletAddFunds,
    db: Session = Depends(get_db),
    current_user_token: TokenData = Depends(oauth2.get_current_user)
):
    user = db.query(UserModel).filter(UserModel.email == current_user_token.username).first()
    if user.role != UserRole.buyer:
        raise HTTPException(status_code=403, detail="Only buyers can add funds.")
    
    wallet = user.wallet
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found.")

    wallet.balance += request.amount
    
    new_transaction = TransactionModel(
        wallet_id=wallet.id,
        amount=request.amount,
        type="deposit"
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(wallet)
    return wallet

@router.get("/me/transactions", response_model=List[TransactionSchema])
def get_transaction_history(
    db: Session = Depends(get_db),
    current_user_token: TokenData = Depends(oauth2.get_current_user)
):
    user = db.query(UserModel).filter(UserModel.email == current_user_token.username).first()
    if not user or not user.wallet:
        raise HTTPException(status_code=404, detail="Wallet not found.")
        
    transactions = db.query(TransactionModel).filter(TransactionModel.wallet_id == user.wallet.id).order_by(TransactionModel.created_at.desc()).all()
    return transactions

@router.post("/me/withdraw", response_model=WalletSchema)
def withdraw_funds(
    request: WalletAddFunds, # We can reuse the same schema for the amount
    db: Session = Depends(get_db),
    current_user_token: TokenData = Depends(oauth2.get_current_user)
):
    """
    [FARMER ONLY] Withdraws funds from the farmer's wallet.
    """
    user = db.query(UserModel).filter(UserModel.email == current_user_token.username).first()
    
    # Authorization: Check if the user is a farmer
    if user.role != UserRole.farmer:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only farmers can withdraw funds.")
    
    wallet = user.wallet
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found.")

    # Check for sufficient funds
    if wallet.balance < request.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient funds. You have {wallet.balance}, but tried to withdraw {request.amount}."
        )

    # Subtract the funds
    wallet.balance -= request.amount
    
    # Log the withdrawal transaction
    new_transaction = TransactionModel(
        wallet_id=wallet.id,
        amount=request.amount,
        type="withdrawal"
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(wallet)
    
    return wallet

@router.get("/me/transactions", response_model=List[TransactionSchema])
def get_transaction_history(
    db: Session = Depends(get_db),
    current_user_token: TokenData = Depends(oauth2.get_current_user)
):
    user = db.query(UserModel).filter(UserModel.email == current_user_token.username).first()
    if not user or not user.wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found.")
        
    transactions = db.query(TransactionModel).filter(TransactionModel.wallet_id == user.wallet.id).order_by(TransactionModel.created_at.desc()).all()
    return transactions