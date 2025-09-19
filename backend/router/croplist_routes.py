# # router/croplist_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database.postgresConn import get_db
# FIX: Import models and schemas with aliases
from models.all_model import CropList as CropListModel, User as UserModel, UserRole
from models.all_model import Contract as ContractModel, ContractStatus
from schemas.all_schema import CropListResponse, CropListCreate, CropListUpdate, TokenData, ProposalAnalysis
from helpers.proposal_analyzer import analyze_proposals

from helpers.recommendation_engine import get_template_recommendation_with_llm
from auth import oauth2

router = APIRouter(
    prefix="/api/croplists",
    tags=["Crop Lists"]
)

@router.post("/", response_model=CropListResponse, status_code=status.HTTP_201_CREATED)
def create_croplist(
    request: CropListCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    # ... (your existing user and role check logic)
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    if not user or user.role != UserRole.farmer:
        raise HTTPException(status_code=403, detail="Only farmers can create listings.")
    
    new_listing = CropListModel(**request.model_dump(), farmer_id=user.id)
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    
    # Get the AI recommendation
    recommendation_data = get_template_recommendation_with_llm(new_listing)
    
    # FIX: Save the recommendation to the database
    if recommendation_data:
        new_listing.recommended_template_name = recommendation_data.get("template_name")
        new_listing.recommendation_reason = recommendation_data.get("reason")
        db.commit()
        db.refresh(new_listing)

    return new_listing

@router.put("/{list_id}", response_model=CropListResponse)
def update_croplist(
    list_id: int,
    request: CropListUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    listing_query = db.query(CropListModel).filter(CropListModel.id == list_id)
    listing = listing_query.first()
    if not listing:
        raise HTTPException(status_code=404, detail=f"Listing with ID {list_id} not found.")

    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    if listing.farmer_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this listing.")
    
    listing_query.update(request.model_dump(exclude_unset=True))
    db.commit()
    return listing_query.first()

@router.get("/", response_model=List[CropListResponse])
def get_all_active_croplists(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user),
    crop_type: Optional[str] = None,
    location: Optional[str] = None
):
    query = db.query(CropListModel).filter(CropListModel.status == 'active')
    if crop_type:
        query = query.filter(CropListModel.crop_type.ilike(f"%{crop_type}%"))
    if location:
        query = query.filter(CropListModel.location.ilike(f"%{location}%"))

    listings = query.all()
        # FIX: Hide private recommendations from users who are not the owner
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    for listing in listings:
        if listing.farmer_id != user.id:
            listing.recommended_template_name = None
            listing.recommendation_reason = None
    
    return listings

@router.get("/{list_id}", response_model=CropListResponse)
def get_croplist_by_id(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    listing = db.query(CropListModel).filter(CropListModel.id == list_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail=f"Listing with ID {list_id} not found.")
    # Hide the recommendation if the requester is not the owner
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()

    if listing.farmer_id != user.id:
        listing.recommended_template_name = None
        listing.recommendation_reason = None
        
    return listing

# --- NEW ENDPOINT ADDED BELOW ---

@router.get("/{list_id}/analyze-proposals", response_model=ProposalAnalysis)
def get_proposal_analysis(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(oauth2.get_current_user)
):
    """
    [FARMER ONLY] Triggers the AI Proposal Analyzer for a specific crop listing.
    """
    user = db.query(UserModel).filter(UserModel.email == current_user.username).first()
    listing = db.query(CropListModel).filter(CropListModel.id == list_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Crop listing not found.")

    # Authorization: Only the farmer who owns the listing can get an analysis.
    if listing.farmer_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to analyze proposals for this listing.")

    # Fetch all pending proposals for this listing
    proposals = db.query(ContractModel).filter(
        ContractModel.listing_id == list_id,
        ContractModel.status == ContractStatus.pending_farmer_approval
    ).all()

    if not proposals:
        raise HTTPException(status_code=404, detail="No pending proposals found for this listing to analyze.")

    # Call the AI helper to get the analysis
    analysis = analyze_proposals(listing, proposals)

    if "error" in analysis:
        raise HTTPException(status_code=500, detail=analysis["error"])

    return analysis