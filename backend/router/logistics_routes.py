# router/logistics_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from models.all_model import (
    Contract as ContractModel, 
    Shipment as ShipmentModel, 
    User as UserModel,
    Milestone as MilestoneModel
)
from database.postgresConn import get_db
from schemas.all_schema import (
    TokenData, QuoteRequest, QuoteResponse, Shipment as ShipmentSchema,
    TrackingResponse, BookingRequest
)
from auth import oauth2
from helpers.logistics_helper import logistics_provider

router = APIRouter(
    prefix="/api/logistics",
    tags=["Logistics"]
)

@router.post("/milestone/{milestone_id}/quote", response_model=QuoteResponse)
def get_transport_quote_for_milestone(
    milestone_id: int,
    request: QuoteRequest,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """[FARMER or BUYER] Gets a simulated logistics quote for a specific milestone."""
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    milestone = db.query(MilestoneModel).options(joinedload(MilestoneModel.contract)).filter(MilestoneModel.id == milestone_id).first()

    if not milestone or user.id not in [milestone.contract.buyer_id, milestone.contract.farmer_id]:
        raise HTTPException(status_code=403, detail="Not authorized for this contract's milestones.")
    
    quote = logistics_provider.get_quote(
        from_address=request.pickup_address,
        to_address=request.dropoff_address,
        vehicle_type=request.vehicle_type
    )
    return quote

@router.post("/milestone/{milestone_id}/book", response_model=ShipmentSchema)
def book_transport_for_milestone(
    milestone_id: int,
    request: BookingRequest,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """[FARMER or BUYER] Books a simulated shipment for a specific milestone."""
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    milestone = db.query(MilestoneModel).options(joinedload(MilestoneModel.contract)).filter(MilestoneModel.id == milestone_id).first()
    
    if not milestone or user.id not in [milestone.contract.buyer_id, milestone.contract.farmer_id]:
        raise HTTPException(status_code=403, detail="Not authorized for this milestone.")
        
    if milestone.shipment:
        raise HTTPException(status_code=400, detail="A shipment has already been booked for this milestone.")

    booking_details = logistics_provider.book_transport(request.quote_id)

    new_shipment = ShipmentModel(
        contract_id=milestone.contract_id,
        milestone_id=milestone_id,
        logistics_provider=request.logistics_provider,
        booking_id=booking_details["booking_id"],
        status=booking_details["status"],
        estimated_cost=request.estimated_cost,
        tracking_url=booking_details["tracking_url"]
    )
    db.add(new_shipment)
    db.commit()
    db.refresh(new_shipment)
    return new_shipment

@router.get("/shipment/{shipment_id}/track", response_model=TrackingResponse)
def track_shipment_status(shipment_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """[FARMER or BUYER] Tracks the status of a specific shipment."""
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    shipment = db.query(ShipmentModel).options(joinedload(ShipmentModel.contract)).filter(ShipmentModel.id == shipment_id).first()

    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found.")
    if user.id not in [shipment.contract.buyer_id, shipment.contract.farmer_id]:
        raise HTTPException(status_code=403, detail="Not authorized to track this shipment.")
        
    tracking_info = logistics_provider.track_shipment(shipment)

    if shipment.status != tracking_info["status"]:
        shipment.status = tracking_info["status"]
        db.commit()

    print(tracking_info)
        
    return tracking_info

@router.delete("/shipment/{shipment_id}/cancel")
def cancel_shipment_booking(shipment_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(oauth2.get_current_user)):
    """[FARMER or BUYER] Cancels a shipment booking if possible."""
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    shipment = db.query(ShipmentModel).options(joinedload(ShipmentModel.contract)).filter(ShipmentModel.id == shipment_id).first()

    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found.")
    if user.id not in [shipment.contract.buyer_id, shipment.contract.farmer_id]:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this shipment.")
        
    cancellation_info = logistics_provider.cancel_shipment(shipment)
    
    if cancellation_info["success"]:
        db.delete(shipment)
        db.commit()
        return {"detail": cancellation_info["message"]}
    else:
        raise HTTPException(status_code=400, detail=cancellation_info["message"])