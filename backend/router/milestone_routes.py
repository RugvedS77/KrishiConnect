# router/milestone_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from decimal import Decimal

from database.postgresConn import get_db
from models.all_model import (
    User as UserModel,
    Contract as ContractModel,
    Milestone as MilestoneModel,
    Transaction as TransactionModel,
    Wallet as WalletModel,
    ContractStatus,
    UserRole
)
from schemas.all_schema import Milestone as MilestoneSchema, TokenData, MilestoneCreate, MilestoneUpdateByFarmer
from auth import oauth2
from helpers.milestone_helper import analyze_milestone_image
from helpers.financial_helper import get_contract_financials

router = APIRouter(
    prefix="/api/milestones",
    tags=["Milestones"]
)

@router.post("/contract/{contract_id}", response_model=MilestoneSchema)
def create_milestone_by_buyer(contract_id: int, request: MilestoneCreate, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """[BUYER ONLY] Creates the milestone structure for an ongoing contract."""
    buyer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract or contract.buyer_id != buyer.id:
        raise HTTPException(status_code=403, detail="Only the contract buyer can create milestones.")

    new_milestone = MilestoneModel(
        contract_id=contract_id,
        name=request.name,
        amount=request.amount
    )
    db.add(new_milestone)
    db.commit()
    db.refresh(new_milestone)
    return new_milestone

@router.put("/{milestone_id}/update", response_model=MilestoneSchema)
def update_milestone_by_farmer(milestone_id: int, request: MilestoneUpdateByFarmer, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """[FARMER ONLY] Farmer submits an update for a milestone and marks it complete."""
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    milestone = db.query(MilestoneModel).options(joinedload(MilestoneModel.contract)).filter(MilestoneModel.id == milestone_id).first()

    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    if milestone.contract.farmer_id != farmer.id:
        raise HTTPException(status_code=403, detail="You are not the farmer for this contract")
    if milestone.is_complete:
        raise HTTPException(status_code=400, detail="This milestone has already been marked complete")

    ai_notes = None
    # FIX: Only run AI analysis if an image URL is provided
    if request.image_url:
        ai_notes = analyze_milestone_image(request.image_url)

    milestone.update_text = request.update_text
    milestone.image_url = request.image_url
    milestone.ai_notes = ai_notes
    milestone.is_complete = True
    
    db.commit()
    db.refresh(milestone)
    return milestone

@router.post("/{milestone_id}/release-payment", response_model=MilestoneSchema)
def release_milestone_payment(
    milestone_id: int, 
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """
    [BUYER ONLY] Releases the payment for a completed milestone.
    This version checks if the contract is complete after payment.
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

    financials = get_contract_financials(milestone.contract, db)
    escrow_balance = financials["escrow_amount"]
    milestone_target_amount = milestone.amount
    
    unpaid_milestones_count = db.query(MilestoneModel).filter(
        MilestoneModel.contract_id == milestone.contract_id,
        MilestoneModel.payment_released == False
    ).count()

    payment_to_release = Decimal('0')

    if unpaid_milestones_count == 1:
        # This is the LAST milestone. Pay out the entire remaining escrow balance.
        payment_to_release = escrow_balance
    elif escrow_balance < milestone_target_amount:
        # This is NOT the last milestone, and there isn't enough money.
        raise HTTPException(status_code=400, detail=f"Insufficient funds in escrow. Needed: {milestone_target_amount}, Available: {escrow_balance}")
    else:
        # This is a normal, mid-contract milestone payment.
        payment_to_release = milestone_target_amount

    # Release the calculated payment to the farmer
    farmer_wallet = db.query(WalletModel).filter(WalletModel.user_id == milestone.contract.farmer_id).first()
    if not farmer_wallet:
        raise HTTPException(status_code=404, detail="Farmer wallet not found.")

    farmer_wallet.balance += payment_to_release
    
    release_transaction = TransactionModel(
        wallet_id=farmer_wallet.id,
        contract_id=milestone.contract_id,
        amount=payment_to_release, 
        type="release"
    )
    db.add(release_transaction)
    
    milestone.payment_released = True
    db.commit() # <-- Commit this milestone change

    # Check if this was the last milestone
    if unpaid_milestones_count == 1:
        milestone.contract.status = ContractStatus.completed
        db.commit()

    db.refresh(milestone)
    return milestone

@router.get("/contract/{contract_id}", response_model=List[MilestoneSchema])
def get_milestones_for_contract(contract_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """[FARMER & BUYER] Gets all milestones for a specific contract."""
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract or user.id not in [contract.farmer_id, contract.buyer_id]:
        raise HTTPException(status_code=403, detail="Not authorized to view these milestones.")
    
    milestones = db.query(MilestoneModel).filter(MilestoneModel.contract_id == contract_id).order_by(MilestoneModel.created_at.asc()).all()
    return milestones


# @router.patch("/{milestone_id}/complete", response_model=MilestoneSchema)
# def complete_milestone_as_farmer(
#     milestone_id: int,
#     request: MilestoneUpdateByFarmer,
#     db: Session = Depends(get_db),
#     current_user: TokenData = Depends(oauth2.get_current_user)
# ):
#     """
#     [FARMER ONLY] Farmer submits an update for a milestone and marks it complete.
#     """
#     farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
#     milestone = db.query(MilestoneModel).options(joinedload(MilestoneModel.contract)).filter(MilestoneModel.id == milestone_id).first()

#     if not milestone:
#         raise HTTPException(status_code=404, detail="Milestone not found")

#     # Security check: Make sure the logged-in user is the farmer for this contract
#     if milestone.contract.farmer_id != farmer.id:
#         raise HTTPException(status_code=403, detail="You are not the farmer for this contract")

#     if milestone.is_complete:
#         raise HTTPException(status_code=400, detail="This milestone has already been marked complete")

#     # Run AI analysis on the provided image
#     ai_notes = analyze_milestone_image(request.image_url) 

#     # Update the milestone with the farmer's proof
#     milestone.update_text = request.update_text
#     milestone.image_url = request.image_url
#     milestone.ai_notes = ai_notes
#     milestone.is_complete = True  # Mark as complete, ready for buyer review
    
#     db.commit()
#     db.refresh(milestone)
#     return milestone