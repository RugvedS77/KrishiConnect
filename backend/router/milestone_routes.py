# router/milestone_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from database.postgresConn import get_db
from models.all_model import (
    User as UserModel,
    Contract as ContractModel,
    Milestone as MilestoneModel,
)
# FIX: Import the new MilestoneCreate schema
from schemas.all_schema import Milestone as MilestoneSchema, TokenData, MilestoneCreate
from auth import oauth2
from helpers.milestone_helper import analyze_milestone_image

router = APIRouter(
    prefix="/api/milestones",
    tags=["Milestones"]
)

# FIX: The endpoint now accepts a simple JSON body (MilestoneCreate) instead of a file upload
@router.post("/contract/{contract_id}", response_model=MilestoneSchema)
def create_milestone_for_contract(
    contract_id: int,
    request: MilestoneCreate, # Use the new Pydantic schema
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")
    
    if contract.farmer_id != farmer.id:
        raise HTTPException(status_code=403, detail="You are not authorized to update this contract.")

    # Call the AI helper with the URL from the request body
    ai_analysis_notes = analyze_milestone_image(request.image_url)

    # Create the milestone record with the provided URL
    new_milestone = MilestoneModel(
        contract_id=contract_id,
        update_text=request.update_text,
        image_url=request.image_url,
        ai_notes=ai_analysis_notes
    )
    
    db.add(new_milestone)
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