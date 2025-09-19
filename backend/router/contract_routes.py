# # router/contract_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from decimal import Decimal

from database.postgresConn import get_db
from models.all_model import (
    User as UserModel,
    CropList as CropListModel,
    Contract as ContractModel,
    Transaction as TransactionModel,
    Wallet as WalletModel,
    UserRole,
    ContractStatus,
    AIAdvice as AIAdviceModel
)
from schemas.all_schema import (
    ContractResponse, ContractCreate, TokenData, 
    Transaction as TransactionSchema, ContractDashboardResponse, AIAdvice as AIAdviceSchema
)
from auth import oauth2
from helpers.compliance_helper import get_compliance_advice
from helpers.financial_helper import get_contract_financials

router = APIRouter(
    prefix="/api/contracts",
    tags=["Contracts"]
)

@router.post("/", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
def propose_contract(request: ContractCreate, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """[BUYER ONLY] Propose a new contract for a crop listing."""
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
        price_per_unit_agreed=request.price_per_unit_agreed,
        payment_terms=request.payment_terms
    )
    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)
    return new_contract

@router.post("/{contract_id}/accept", response_model=ContractResponse)
def accept_contract(contract_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """[FARMER ONLY] Accept a pending contract, locking buyer's funds in escrow."""
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")
    if contract.farmer_id != farmer.id:
        raise HTTPException(status_code=403, detail="You are not authorized to accept this contract.")
    if contract.status != ContractStatus.pending_farmer_approval:
        raise HTTPException(status_code=400, detail="This contract is not pending approval.")

    buyer_wallet = db.query(WalletModel).filter(WalletModel.user_id == contract.buyer_id).first()
    total_value = Decimal(contract.quantity_proposed) * contract.price_per_unit_agreed

    if not buyer_wallet or buyer_wallet.balance < total_value:
        raise HTTPException(status_code=400, detail="Buyer has insufficient funds to secure this contract.")

    buyer_wallet.balance -= total_value
    escrow_transaction = TransactionModel(
        wallet_id=buyer_wallet.id, contract_id=contract.id, amount=total_value, type="escrow"
    )
    db.add(escrow_transaction)
    contract.status = ContractStatus.ongoing
    db.commit()
    db.refresh(contract)
    return contract

@router.post("/{contract_id}/complete", response_model=ContractResponse)
def complete_contract(contract_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """[FARMER ONLY] Marks a contract as complete, releasing the final payment from escrow."""
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract or contract.farmer_id != farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized to complete this contract.")
    if contract.status != ContractStatus.ongoing:
        raise HTTPException(status_code=400, detail="Contract is not ongoing.")
        
    financials = get_contract_financials(contract, db)
    final_payment = financials["escrow_amount"]

    if final_payment > 0:
        farmer_wallet = db.query(WalletModel).filter(WalletModel.user_id == contract.farmer_id).first()
        farmer_wallet.balance += final_payment
        release_transaction = TransactionModel(
            wallet_id=farmer_wallet.id, contract_id=contract.id, amount=final_payment, type="release"
        )
        db.add(release_transaction)
    
    contract.status = ContractStatus.completed
    db.commit()
    db.refresh(contract)
    return contract

@router.post("/{contract_id}/compliance-check", response_model=AIAdviceSchema)
def get_contract_compliance_advice(contract_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """[FARMER ONLY] Triggers the Compliance Helper to generate advice for a contract."""
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract or contract.farmer_id != farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized to get advice for this contract.")
        
    advice_text = get_compliance_advice(contract, db)
    new_advice = AIAdviceModel(contract_id=contract.id, advice_text=advice_text)
    db.add(new_advice)
    db.commit()
    db.refresh(new_advice)
    return new_advice

# --- THIS IS THE CORRECTED FUNCTION ---
@router.get("/ongoing", response_model=List[ContractDashboardResponse])
def get_ongoing_contracts(db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    
    # 1. Your database query (this is unchanged and correct)
    contracts = db.query(ContractModel).options(
        joinedload(ContractModel.listing).joinedload(CropListModel.farmer),
        joinedload(ContractModel.buyer),
        joinedload(ContractModel.farmer),
        joinedload(ContractModel.milestones) # Eager load all relationships
    ).filter(
        (ContractModel.buyer_id == user.id) | (ContractModel.farmer_id == user.id),
        ContractModel.status == ContractStatus.ongoing
    ).all()
    
    # 2. --- FIX: ADDED THIS LOOP ---
    # We must iterate over the SQLAlchemy objects and manually add the 
    # attributes that the ContractDashboardResponse schema requires.
    
    processed_contracts = []
    for contract in contracts:
        # Get the financial dict
        financials = get_contract_financials(contract, db)
        
        # Attach the calculated values as new attributes to the SA object
        contract.total_value = financials['total_value']
        contract.escrow_amount = financials['escrow_amount']
        contract.amount_paid = financials['amount_paid']
        
        processed_contracts.append(contract)

    # 3. Return the modified list of contract objects.
    # FastAPI will now validate this list against List[ContractDashboardResponse],
    # and Pydantic will successfully find all the required fields.
    return processed_contracts

@router.get("/listing/{listing_id}", response_model=List[ContractResponse])
def get_proposals_for_listing(listing_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """[FARMER ONLY] Gets all pending proposals for a specific listing."""
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    listing = db.query(CropListModel).filter(CropListModel.id == listing_id, CropListModel.farmer_id == farmer.id).first()
    
    if not listing:
        raise HTTPException(status_code=404, detail=f"Listing not found or you do not own it.")

    proposals = db.query(ContractModel).filter(
        ContractModel.listing_id == listing_id,
        ContractModel.status == ContractStatus.pending_farmer_approval
    ).all()
    return proposals

#
# --- ADD THIS ENTIRE FUNCTION TO router/contract_routes.py ---
#
@router.get("/completed", response_model=List[ContractDashboardResponse])
def get_completed_contracts(db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """
    [FARMER & BUYER] Gets all contracts for the user that are marked as 'completed'.
    """
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    
    # This query is almost identical to 'get_ongoing_contracts'...
    contracts = db.query(ContractModel).options(
        joinedload(ContractModel.listing).joinedload(CropListModel.farmer),
        joinedload(ContractModel.buyer),
        joinedload(ContractModel.farmer),
        joinedload(ContractModel.milestones)
    ).filter(
        (ContractModel.buyer_id == user.id) | (ContractModel.farmer_id == user.id),
        # ...except for this line, which filters for COMPLETED status
        ContractModel.status == ContractStatus.completed  
    ).all()
    
    # We still need to process the financials just like the ongoing route
    processed_contracts = []
    for contract in contracts:
        financials = get_contract_financials(contract, db)
        
        # Attach the calculated values to the object for Pydantic validation
        contract.total_value = financials['total_value']
        contract.escrow_amount = financials['escrow_amount']
        contract.amount_paid = financials['amount_paid']
        
        processed_contracts.append(contract)

    return processed_contracts

# --- Add this new function to your router/contract_routes.py file ---

@router.get("/proposals/pending-all", response_model=List[ContractResponse])
def get_all_pending_proposals_for_farmer(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """
    [FARMER ONLY] Gets all contract proposals across ALL listings 
    that are pending this farmer's approval.
    """
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    if farmer.role != UserRole.farmer:
        raise HTTPException(status_code=403, detail="Only farmers can view their proposals.")

    # Find all contracts where the farmer_id matches the current user
    # AND the status is pending their approval
    proposals = db.query(ContractModel).options(
        joinedload(ContractModel.listing),
        joinedload(ContractModel.buyer)
    ).filter(
        ContractModel.farmer_id == farmer.id,
        ContractModel.status == ContractStatus.pending_farmer_approval
    ).all()
    
    return proposals

@router.get("/proposals/sent-pending", response_model=List[ContractResponse])
def get_all_pending_proposals_by_buyer(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """
    [BUYER ONLY] Gets all contract proposals sent by the current buyer
    that are still awaiting farmer approval.
    """
    buyer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    if buyer.role != UserRole.buyer:
        raise HTTPException(status_code=403, detail="Only buyers can view their sent proposals.")

    # Find all contracts where the buyer_id matches the current user
    # AND the status is pending farmer approval
    proposals = db.query(ContractModel).options(
        joinedload(ContractModel.listing),
        joinedload(ContractModel.farmer)
    ).filter(
        ContractModel.buyer_id == buyer.id,
        ContractModel.status == ContractStatus.pending_farmer_approval
    ).all()
    
    return proposals

# ... (after your other endpoints)
@router.post("/{contract_id}/reject", response_model=ContractResponse)
def reject_contract(contract_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """
    [FARMER ONLY] Reject a pending contract proposal.
    """
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")
    
    if contract.farmer_id != farmer.id:
        raise HTTPException(status_code=403, detail="You are not authorized to reject this contract.")
    
    if contract.status != ContractStatus.pending_farmer_approval:
        raise HTTPException(status_code=400, detail="This contract is not pending approval.")

    contract.status = ContractStatus.rejected
    db.commit()
    db.refresh(contract)
    return contract

@router.get("/proposals/pending", response_model=List[ContractResponse])
def get_all_pending_proposals_for_farmer(
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """
    [FARMER ONLY] Gets all contract proposals from all listings that are
    pending this farmer's approval.
    """
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    
    pending_proposals = db.query(ContractModel).filter(
        ContractModel.farmer_id == farmer.id,
        ContractModel.status == ContractStatus.pending_farmer_approval
    ).all()
    
    return pending_proposals