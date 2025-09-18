# router/contract_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.postgresConn import get_db
from models.all_model import (
    User as UserModel,
    CropList as CropListModel,
    Contract as ContractModel,
    UserRole,
    ContractStatus
)
from schemas.all_schema import ContractResponse, ContractCreate, TokenData
from auth import oauth2

# FIX: Import the new AI helper and models
from helpers.compliance_helper import get_compliance_advice
from models.all_model import AIAdvice as AIAdviceModel
from schemas.all_schema import AIAdvice as AIAdviceSchema


router = APIRouter(
    prefix="/api/contracts",
    tags=["Contracts"]
)

@router.post("/", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
def propose_contract(
    request: ContractCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """
    [BUYER ONLY] Propose a new contract for a crop listing.
    """
    buyer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    if buyer.role != UserRole.buyer:
        raise HTTPException(status_code=403, detail="Only buyers can propose contracts.")

    listing = db.query(CropListModel).filter(CropListModel.id == request.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Crop listing not found.")
    
    new_contract = ContractModel(
        listing_id=listing.id,
        buyer_id=buyer.id,
        farmer_id=listing.farmer_id,
        quantity_proposed=request.quantity_proposed,
        price_per_unit_agreed=request.price_per_unit_agreed
    )
    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)
    return new_contract

@router.post("/{contract_id}/accept", response_model=ContractResponse)
def accept_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """
    [FARMER ONLY] Accept a pending contract proposal.
    This action triggers the AI Contract Summarizer.
    """
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")
    
    if contract.farmer_id != farmer.id:
        raise HTTPException(status_code=403, detail="You are not authorized to accept this contract.")
    
    if contract.status != ContractStatus.pending_farmer_approval:
        raise HTTPException(status_code=400, detail="This contract is not pending approval.")

    # NOT NOW : get the summary generated and add to the response
    contract.status = ContractStatus.accepted
    db.commit()
    db.refresh(contract)
    # --------------------

    return contract

# --- NEW ENDPOINT ADDED BELOW ---

@router.post("/{contract_id}/compliance-check", response_model=AIAdviceSchema)
def get_contract_compliance_advice(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """
    [FARMER ONLY] Triggers the Compliance Helper to generate advice for a contract.
    """
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")
    
    if contract.farmer_id != farmer.id:
        raise HTTPException(status_code=403, detail="You are not authorized to get advice for this contract.")
        
    # 1. Call the AI helper to generate the advice
    advice_text = get_compliance_advice(contract, db)
    
    # 2. Save the new advice to the database
    new_advice = AIAdviceModel(
        contract_id=contract.id,
        advice_text=advice_text
    )
    db.add(new_advice)
    db.commit()
    db.refresh(new_advice)
    
    return new_advice