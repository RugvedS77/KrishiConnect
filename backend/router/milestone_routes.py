# router/milestone_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from decimal import Decimal

from database.postgresConn import get_db
from models.all_model import (
    User as UserModel,
    Contract as ContractModel,
    Milestone as MilestoneModel,
    Transaction as TransactionModel, Wallet as WalletModel, # Import additional models
)
# FIX: Import the new MilestoneCreate schema
from schemas.all_schema import Milestone as MilestoneSchema, TokenData, MilestoneCreate
from auth import oauth2
from helpers.milestone_helper import analyze_milestone_image
from helpers.financial_helper import get_contract_financials

router = APIRouter(
    prefix="/api/milestones",
    tags=["Milestones"]
)

# FIX: response_model should be MilestoneSchema, not MilestoneCreate
@router.post("/contract/{contract_id}", response_model=MilestoneSchema)
def create_milestone_for_contract(contract_id: int, request: MilestoneCreate, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract or contract.farmer_id != farmer.id:
        raise HTTPException(status_code=403, detail="You are not authorized to update this contract.")

    # ai_analysis_notes = analyze_milestone_image(request.image_url)
    

    new_milestone = MilestoneModel(
        contract_id=contract_id,
        name=request.name,
        amount=request.amount,
        update_text=request.update_text,
        image_url=request.image_url,
        ai_notes=None,
        is_complete=True
    )
    db.add(new_milestone)
    
    if contract.payment_terms == 'milestone':
        paid_milestone_exists = db.query(MilestoneModel).filter(
            MilestoneModel.contract_id == contract_id, 
            MilestoneModel.payment_released == True
        ).first()
        
        if not paid_milestone_exists:
            # FIX: Correctly handle float * Decimal multiplication
            total_value = Decimal(contract.quantity_proposed) * contract.price_per_unit_agreed
            payment_amount = total_value * Decimal('0.5')
            
            farmer_wallet = db.query(WalletModel).filter(WalletModel.user_id == contract.farmer_id).first()
            farmer_wallet.balance += payment_amount
            
            release_transaction = TransactionModel(
                wallet_id=farmer_wallet.id,
                contract_id=contract.id,
                amount=payment_amount,
                type="release"
            )
            db.add(release_transaction)
            new_milestone.payment_released = True

    db.commit()
    db.refresh(new_milestone)
    return new_milestone
# --- NEW VIEW Endpoints Added Below ---

@router.get("/contract/{contract_id}", response_model=List[MilestoneSchema])
def get_milestones_for_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """
    [FARMER & BUYER] Gets all milestones for a specific contract.
    """
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")

    # Authorization: Check if the current user is part of this contract
    if user.id not in [contract.farmer_id, contract.buyer_id]:
        raise HTTPException(status_code=403, detail="Not authorized to view these milestones.")
    
    milestones = db.query(MilestoneModel).filter(MilestoneModel.contract_id == contract_id).order_by(MilestoneModel.created_at.asc()).all()
    return milestones

@router.get("/{milestone_id}", response_model=MilestoneSchema)
def get_milestone_by_id(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """
    [FARMER & BUYER] Gets a single milestone by its ID.
    """
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    milestone = db.query(MilestoneModel).filter(MilestoneModel.id == milestone_id).first()

    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    # Authorization: Check if the current user is part of this milestone's contract
    if user.id not in [milestone.contract.farmer_id, milestone.contract.buyer_id]:
        raise HTTPException(status_code=403, detail="Not authorized to view this milestone.")
        
    return milestone

# --- NEW ENDPOINT ---
@router.post("/{milestone_id}/release-payment", response_model=MilestoneSchema)
def release_milestone_payment(milestone_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """
    [BUYER ONLY] Releases the payment for a completed milestone.
    """
    buyer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    milestone = db.query(MilestoneModel).options(joinedload(MilestoneModel.contract)).filter(MilestoneModel.id == milestone_id).first()
    
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found.")
    
    if milestone.contract.buyer_id != buyer.id:
        raise HTTPException(status_code=403, detail="Only the contract buyer can release payments.")
        
    if not milestone.is_complete:
        raise HTTPException(status_code=400, detail="Milestone is not yet marked as complete by the farmer.")
        
    if milestone.payment_released:
        raise HTTPException(status_code=400, detail="Payment for this milestone has already been released.")

    # Check if there are enough funds in escrow for this contract
    financials = get_contract_financials(milestone.contract, db)
    if financials["escrow_amount"] < milestone.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds in escrow.")

    # Release the payment to the farmer
    farmer_wallet = db.query(WalletModel).filter(WalletModel.user_id == milestone.contract.farmer_id).first()
    farmer_wallet.balance += milestone.amount
    
    release_transaction = TransactionModel(
        wallet_id=farmer_wallet.id,
        contract_id=milestone.contract_id,
        amount=milestone.amount,
        type="release"
    )
    db.add(release_transaction)
    
    milestone.payment_released = True
    db.commit()
    db.refresh(milestone)
    return milestone