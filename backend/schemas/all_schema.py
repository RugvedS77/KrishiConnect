# schemas/all_schema.py

from pydantic import BaseModel, ConfigDict, EmailStr, model_validator, Field
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

# --- Base Schemas for Nesting ---
class User(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    model_config = ConfigDict(from_attributes=True)

class CropListResponseForNesting(BaseModel):
    id: int
    crop_type: str
    quantity: float
    unit: str
    expected_price_per_unit: Decimal
    farmer: User
    model_config = ConfigDict(from_attributes=True)

# --- Full Schemas ---

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    business_type: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    lists: List[CropListResponseForNesting] = []
    model_config = ConfigDict(from_attributes=True)

# --- CropList Schemas ---
class CropListBase(BaseModel):
    crop_type: str
    quantity: float
    unit: str
    expected_price_per_unit: Decimal
    harvest_date: date
    location: str
    farming_practice: Optional[str] = None
    soil_type: str
    irrigation_source: Optional[str] = None
    img_url: Optional[str] = None

class CropListCreate(CropListBase):
    pass

class CropListResponse(CropListBase):
    id: int
    farmer_id: int
    status: str
    created_at: datetime
    farmer: User
    recommended_template_name: Optional[str] = None
    recommendation_reason: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class CropListUpdate(BaseModel):
    crop_type: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    status: Optional[str] = None
    farming_practice: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_source: Optional[str] = None
    img_url: Optional[str] = None

# --- Wallet & Transaction Schemas ---
class Wallet(BaseModel):
    id: int
    user_id: int
    balance: Decimal
    model_config = ConfigDict(from_attributes=True)

class WalletAddFunds(BaseModel):
    amount: Decimal

class Transaction(BaseModel):
    id: int
    wallet_id: int
    contract_id: Optional[int] = None
    amount: Decimal
    type: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Logistics & Shipment Schemas ---
class QuoteRequest(BaseModel):
    pickup_address: str
    dropoff_address: str
    vehicle_type: str

class QuoteResponse(BaseModel):
    quote_id: str
    estimated_cost: Decimal
    logistics_provider: str

class BookingRequest(BaseModel):
    quote_id: str
    estimated_cost: Decimal
    logistics_provider: str
    
class Shipment(BaseModel):
    id: int
    contract_id: int
    milestone_id: int
    logistics_provider: Optional[str] = None
    booking_id: Optional[str] = None
    status: str
    estimated_cost: Optional[Decimal] = None
    tracking_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class TrackingResponse(BaseModel):
    id: int
    booking_id: str
    tracking_url: str
    status: str

# --- Milestone Schemas ---
class Milestone(BaseModel):
    id: int
    name: str
    amount: Decimal
    is_complete: bool
    payment_released: bool
    update_text: Optional[str] = None
    image_url: Optional[str] = None
    ai_notes: Optional[str] = None
    created_at: datetime
    shipment: Optional[Shipment] = None
    model_config = ConfigDict(from_attributes=True)

class MilestoneCreate(BaseModel):
    name: str
    amount: Decimal

class MilestoneUpdateByFarmer(BaseModel):
    update_text: Optional[str] = None
    image_url: Optional[str] = None

    @model_validator(mode='after')
    def check_at_least_one_field(self):
        if not self.update_text and not self.image_url:
            raise ValueError('At least one of update_text or image_url must be provided.')
        return self

# --- Contract Schemas ---
class ContractBase(BaseModel):
    quantity_proposed: float
    price_per_unit_agreed: Decimal
    buyer_signature_url: Optional[str] = None

class ContractCreate(ContractBase):
    listing_id: int
    payment_terms: Optional[str] = 'final'

class ContractAcceptRequest(BaseModel):
    farmer_signature_url: str

class ContractResponse(ContractBase):
    id: int
    status: str
    payment_terms: str
    created_at: datetime
    listing: CropListResponse
    buyer: User
    farmer: User
    buyer_signature_url: Optional[str] = None
    farmer_signature_url: Optional[str] = None
    milestones: List[Milestone] = []
    model_config = ConfigDict(from_attributes=True)

class ContractDashboardResponse(ContractResponse):
    total_value: Decimal
    escrow_amount: Decimal
    amount_paid: Decimal

class ContractOfferUpdate(BaseModel):
    price_per_unit_agreed: float
    quantity_proposed: int
    
# --- AI Helper Schemas ---
class AIAdvice(BaseModel):
    id: int
    contract_id: int
    generated_at: datetime
    advice_text: str
    model_config = ConfigDict(from_attributes=True)
    
class ProposalAnalysis(BaseModel):
    best_proposal_id: Optional[int] = None
    reason: str

class NegotiationMessageSchema(BaseModel):
    id: int
    sender_id: int
    message: str
    proposed_price: Optional[float] = None
    proposed_quantity: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    userRole: str
    
class TokenData(BaseModel):
    username: Optional[str] = None

# This will be your new response model for the login route
class TokenWithUser(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse # <-- Nest the user object here

# Community and other services 

class AuthorResponse(BaseModel):
    id: int
    full_name: str
    # avatar_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ReplyCreate(BaseModel):
    content: str

class ForumPostSummaryResponse(BaseModel):
    id: int
    title: str
    author_id: int
    category: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    author: AuthorResponse
    reply_count: int
    model_config = ConfigDict(from_attributes=True)

class ReplyResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    author: AuthorResponse # Reuse the AuthorResponse schema we defined before
    model_config = ConfigDict(from_attributes=True)

class PostDetailResponse(ForumPostSummaryResponse):
    replies: List[ReplyResponse] = []
    model_config = ConfigDict(from_attributes=True)

#crop recommendation

class RecommendationRequest(BaseModel):
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    pH: Optional[float] = Field(None, alias="pH")
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rainfall: Optional[float] = None
    water_available_liters: Optional[float] = None
    area_hectares: Optional[float] = None
    notes: Optional[str] = None

class CropRecommendation(BaseModel):
    name: str
    suitability_score: float
    reason: Optional[str] = None

class RecommendationResponse(BaseModel):
    recommendations: List[CropRecommendation]
    source: str
    

# --- Final Rebuild ---
# This helps Pydantic resolve the nested relationships correctly.
UserResponse.model_rebuild()
ContractResponse.model_rebuild()
Milestone.model_rebuild()