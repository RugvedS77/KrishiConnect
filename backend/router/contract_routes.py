# router/contract_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from decimal import Decimal

from database.postgresConn import get_db
from models.all_model import (
    User as UserModel,
    CropList as CropListModel,
    Contract as ContractModel,
    Transaction as TransactionModel, Wallet as WalletModel, # Import additional models
    UserRole,
    ContractStatus
)

#from schemas.all_schema import ContractResponse, ContractCreate, TokenData, Transaction, ContractDashboardResponse
from auth import oauth2
from schemas.all_schema import (
    ContractResponse, ContractCreate, TokenData, 
    Transaction as TransactionSchema, ContractDashboardResponse, AIAdvice as AIAdviceSchema
)

# FIX: Import the new AI helper and models
from helpers.compliance_helper import get_compliance_advice
from models.all_model import AIAdvice as AIAdviceModel
from schemas.all_schema import AIAdvice as AIAdviceSchema
# FIX: Import the new financial helper
from helpers.financial_helper import get_contract_financials


router = APIRouter(
    prefix="/api/contracts",
    tags=["Contracts"]
)

# Helper function to calculate financial details for a contract
def get_contract_financials(contract: ContractModel, db: Session):
    transactions = db.query(TransactionModel).filter(TransactionModel.contract_id == contract.id).all()
    total_value = contract.quantity_proposed * contract.price_per_unit_agreed
    escrowed_amount = sum(t.amount for t in transactions if t.type == 'escrow')
    released_amount = sum(t.amount for t in transactions if t.type == 'release')
    return {
        "total_value": total_value,
        "escrow_amount": escrowed_amount - released_amount,
        "amount_paid": released_amount
    }

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
        price_per_unit_agreed=request.price_per_unit_agreed,
        payment_terms=request.payment_terms # Save payment terms
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
    

    buyer_wallet = db.query(WalletModel).filter(WalletModel.user_id == contract.buyer_id).first()
    # FIX: Correctly handle float * Decimal multiplication
    total_value = Decimal(contract.quantity_proposed) * contract.price_per_unit_agreed


    # 1. Check if the buyer has sufficient funds
    if not buyer_wallet or buyer_wallet.balance < total_value:
        raise HTTPException(status_code=400, detail="Buyer has insufficient funds to secure this contract.")

    # 2. Lock funds in escrow
    buyer_wallet.balance -= total_value
    escrow_transaction = TransactionModel(
        wallet_id=buyer_wallet.id,
        contract_id=contract.id,
        amount=total_value,
        type="escrow"
    )
    db.add(escrow_transaction)

    contract.status = ContractStatus.ongoing
    db.commit()
    db.refresh(contract)
    return contract


# FIX: This endpoint had the wrong logic. It should generate and save advice.
@router.post("/{contract_id}/compliance-check", response_model=AIAdviceSchema)
def get_contract_compliance_advice(contract_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    farmer = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")
    if contract.farmer_id != farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized to get advice for this contract.")
        
    advice_text = get_compliance_advice(contract, db)
    
    new_advice = AIAdviceModel(contract_id=contract.id, advice_text=advice_text)
    db.add(new_advice)
    db.commit()
    db.refresh(new_advice)
    return new_advice


# --- NEW ENDPOINTS ---
@router.get("/ongoing", response_model=List[ContractDashboardResponse])
def get_ongoing_contracts(db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    
    contracts = db.query(ContractModel).options(joinedload(ContractModel.listing)).filter(
        (ContractModel.buyer_id == user.id) | (ContractModel.farmer_id == user.id),
        ContractModel.status == ContractStatus.ongoing
    ).all()
    
    response = []
    for contract in contracts:
        financials = get_contract_financials(contract, db)
        contract_data = ContractResponse.from_orm(contract).dict()
        response.append(ContractDashboardResponse(**contract_data, **financials))
        
    return response

@router.get("/{contract_id}/transactions", response_model=List[TransactionSchema])
def get_transactions_for_contract(contract_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
    if not contract or user.id not in [contract.buyer_id, contract.farmer_id]:
        raise HTTPException(status_code=403, detail="Not authorized to view these transactions.")
    
    transactions = db.query(TransactionModel).filter(TransactionModel.contract_id == contract_id).order_by(TransactionModel.created_at.desc()).all()
    return transactions