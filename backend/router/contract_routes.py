# # router/contract_routes.py

from fastapi import APIRouter, Depends, HTTPException, status   
from sqlalchemy.orm import Session, joinedload
from typing import List, cast, Optional
from decimal import Decimal
import json

from database.postgresConn import get_db
from models.all_model import (
    User as UserModel,
    CropList as CropListModel,
    Contract as ContractModel,
    Transaction as TransactionModel,
    Wallet as WalletModel,
    Milestone as MilestoneModel,
    UserRole,
    ContractStatus,
    AIAdvice as AIAdviceModel,
    NegotiationMessage as NegotiationMessageModel
)
from schemas.all_schema import (
    ContractResponse, ContractCreate, ContractAcceptRequest, TokenData, 
    Transaction as TransactionSchema, ContractDashboardResponse, AIAdvice as AIAdviceSchema, ContractOfferUpdate,
    NegotiationMessageSchema
)
from auth import oauth2
from helpers.compliance_helper import get_compliance_advice
from helpers.financial_helper import get_contract_financials
from helpers.websocket_manager import manager

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
    
        # --- NEW LOGIC ADDED HERE ---
    # 1. Calculate the total value of the proposed contract
    total_value = Decimal(request.quantity_proposed) * request.price_per_unit_agreed
    
    # 2. Get the buyer's wallet
    buyer_wallet = db.query(WalletModel).filter(WalletModel.user_id == buyer.id).first()

    # 3. Check if the wallet balance is sufficient
    if buyer_wallet is None:
        raise HTTPException(
        status_code=404,
        detail="Buyer wallet not found."
    )

    if cast(Decimal, buyer_wallet.balance) < total_value:
        raise HTTPException(
        status_code=400,
        detail=f"Insufficient wallet balance. You need ₹{total_value} but have ₹{buyer_wallet.balance}."
    )
    # --- END OF NEW LOGIC ---
    
    new_contract = ContractModel(
        listing_id=listing.id,
        buyer_id=buyer.id,
        farmer_id=listing.farmer_id,
        quantity_proposed=request.quantity_proposed,
        price_per_unit_agreed=request.price_per_unit_agreed,
        payment_terms=request.payment_terms,
        buyer_signature_url=request.buyer_signature_url
    )
    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)
    return new_contract

@router.post("/{contract_id}/accept", response_model=ContractResponse)
def accept_contract(contract_id: int, request: ContractAcceptRequest, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
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

        # --- ADD THIS LOGIC ---
    # 1. Update the contract's status to 'ongoing'
    contract.status = ContractStatus.ongoing
    # 2. Update the original listing's status to 'closed'
    contract.listing.status = 'closed'
    contract.farmer_signature_url = request.farmer_signature_url
    # --------------------
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

@router.get("/my-contracts", response_model=List[ContractResponse])
def get_my_contracts_as_buyer(
    status: Optional[str] = None, # <-- ADD: Optional status query parameter
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """[BUYER ONLY] Gets contracts proposed by the current user, with optional status filtering."""
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    if user.role != UserRole.buyer:
        raise HTTPException(status_code=403, detail="Only buyers can access this resource.")

    # Start the base query
    query = db.query(ContractModel).options(
        joinedload(ContractModel.listing).joinedload(CropListModel.farmer)
    ).filter(ContractModel.buyer_id == user.id)

    # --- ADD THIS LOGIC ---
    # Conditionally add a filter based on the status parameter
    if status == 'ongoing':
        query = query.filter(ContractModel.status == ContractStatus.ongoing)
    elif status == 'negotiating':
        query = query.filter(ContractModel.status.in_([
            ContractStatus.pending_farmer_approval, 
            ContractStatus.negotiating
        ]))
    elif status == "rejected":
        query = query.filter(ContractModel.status== ContractStatus.rejected)
    # If no status is provided, it will return all contracts
    # --- END OF LOGIC ---

    contracts = query.order_by(ContractModel.created_at.desc()).all()
    
    return contracts

@router.get("/ongoing", response_model=List[ContractDashboardResponse])
def get_ongoing_contracts(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user),
):
    """[BUYER & FARMER] Gets all ongoing contracts for the current user."""
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()

    contracts = (
        db.query(ContractModel)
        .options(
            joinedload(ContractModel.listing).joinedload(CropListModel.farmer),
            joinedload(ContractModel.buyer),
            joinedload(ContractModel.farmer),
            joinedload(ContractModel.milestones).joinedload(MilestoneModel.shipment),
        )
        .filter(
            (ContractModel.buyer_id == user.id) | (ContractModel.farmer_id == user.id),
            ContractModel.status == ContractStatus.ongoing,
        )
        .all()
    )

    response = []
    for contract in contracts:
        financials = get_contract_financials(contract, db)

        # Attach the calculated values as new attributes to the SA object
        contract.total_value = financials['total_value']
        contract.escrow_amount = financials['escrow_amount']
        contract.amount_paid = financials['amount_paid']
        
        response.append(contract)

    return response

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

@router.get("/proposals/pending", response_model=List[ContractResponse])
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

@router.post("/{contract_id}/start-negotiation", response_model=ContractResponse)
def start_negotiation(
    contract_id: int, 
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """[FARMER ONLY] Changes a contract status from 'pending' to 'negotiating'."""
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    # Authorization checks
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")
    if contract.farmer_id != user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to modify this contract.")
    
    # Logic check: Can only start negotiating on a pending contract
    if contract.status != ContractStatus.pending_farmer_approval:
        raise HTTPException(status_code=400, detail="Negotiation can only be started on a pending proposal.")

    # --- The Core Logic ---
    contract.status = ContractStatus.negotiating
    db.commit()
    db.refresh(contract)
    # --------------------
    
    print(f"Contract {contract.id} status updated to: {contract.status}") # For debugging
    return contract

@router.put("/{contract_id}/update-offer", response_model=ContractResponse)
async def update_contract_offer(
    contract_id: int, 
    request: ContractOfferUpdate, # The schema for your request body
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """Updates the terms of a contract during negotiation."""
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    # Authorization check (this part is correct)
    if not contract or user.id not in [contract.buyer_id, contract.farmer_id]:
        raise HTTPException(status_code=403, detail="Not authorized.")
    
    # --- FIX #2: Allow updates from 'pending' OR 'negotiating' states ---
    if contract.status not in [ContractStatus.negotiating, ContractStatus.pending_farmer_approval]:
        raise HTTPException(
            status_code=400, 
            detail="Contract is not in a state that can be negotiated."
        )

    # Update the actual contract terms
    contract.price_per_unit_agreed = request.price_per_unit_agreed
    contract.quantity_proposed = request.quantity_proposed
    contract.last_offer_by = user.role.value # Assumes user.role is an Enum
    contract.status = ContractStatus.negotiating # Always set to 'negotiating' after an offer
    
    db.commit()

    # After saving, broadcast a notification message via the WebSocket
    notification_payload = {
        "type": "system_message",
        "message": f"A new offer was sent by {user.role.value}: Price ₹{contract.price_per_unit_agreed}, Quantity {contract.quantity_proposed}"
    }
    await manager.broadcast(json.dumps(notification_payload), contract.id)

    db.refresh(contract)
    return contract

@router.get("/{contract_id}/negotiation-history", response_model=List[NegotiationMessageSchema])
def get_negotiation_history(
    contract_id: int, 
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """Gets the chat history for a specific contract negotiation."""
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    # --- THIS IS THE UPDATED VALIDATION LOGIC ---
    # First, check if the contract exists at all
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contract with ID {contract_id} not found."
        )

    # Next, check if the current user is part of this contract
    if user.id not in [contract.buyer_id, contract.farmer_id]:
        # Provide a detailed error message for easier debugging
        detail_message = (
            f"Authorization Error: Current user ID '{user.id}' is not authorized for this contract. "
            f"Allowed IDs are Buyer: '{contract.buyer_id}' and Farmer: '{contract.farmer_id}'."
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail_message
        )
    # --- END OF FIX ---

    history = db.query(NegotiationMessageModel).filter(
        NegotiationMessageModel.contract_id == contract_id
    ).order_by(NegotiationMessageModel.created_at.asc()).all()
    
    return history

@router.post("/{contract_id}/accept-offer", response_model=ContractResponse)
def buyer_accepts_offer(
    contract_id: int, 
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """[BUYER ONLY] Accepts a farmer's counter-offer and moves the contract to 'ongoing'."""
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).options(joinedload(ContractModel.listing)).filter(ContractModel.id == contract_id).first()

    # Validation
    if not contract or contract.buyer_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    if contract.status != ContractStatus.negotiating or contract.last_offer_by != ProposerRole.farmer:
        raise HTTPException(status_code=400, detail="No pending offer from the farmer to accept.")

    # --- This is the same Escrow logic as the original 'accept' endpoint ---
    wallet = db.query(WalletModel).filter(WalletModel.user_id == user.id).first()
    total_value = contract.total_value # Use the updated total value
    if not wallet or wallet.balance < total_value:
        raise HTTPException(status_code=400, detail="Insufficient funds to secure the contract.")

    wallet.balance -= total_value
    escrow_transaction = TransactionModel(wallet_id=wallet.id, contract_id=contract.id, amount=total_value, type="escrow")
    db.add(escrow_transaction)
    
    contract.status = ContractStatus.ongoing
    contract.listing.status = 'closed' # Mark the original listing as closed
    
    db.commit()
    db.refresh(contract)
    return contract

@router.post("/{contract_id}/reject-offer", response_model=ContractResponse)
def buyer_rejects_offer(
    contract_id: int, 
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """[BUYER ONLY] Rejects a farmer's counter-offer."""
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()

    if not contract or contract.buyer_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    contract.status = ContractStatus.rejected
    db.commit()
    db.refresh(contract)
    return contract