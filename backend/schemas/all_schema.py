# # schemas/all_schema.py

# from pydantic import BaseModel, ConfigDict, EmailStr
# from datetime import date, datetime
# from decimal import Decimal
# from typing import List, Optional

# # --- Base Schemas & Forward References ---

# class User(BaseModel):
#     id: int
#     email: EmailStr
#     full_name: Optional[str] = None
#     role: str
#     model_config = ConfigDict(from_attributes=True)

# class CropList(BaseModel):
#     id: int
#     crop_type: str
#     quantity: float
#     expected_price_per_unit: Decimal
#     farmer: User
#     model_config = ConfigDict(from_attributes=True)

# # --- User Schemas ---

# class UserBase(BaseModel):
#     email: EmailStr
#     full_name: Optional[str] = None
#     role: str
#     business_type: Optional[str] = None

# class UserCreate(UserBase):
#     password: str

# class UserResponse(UserBase):
#     id: int
#     created_at: datetime
#     lists: List[CropList] = []
#     model_config = ConfigDict(from_attributes=True)

# # --- CropList Schemas ---
# class Recommendation(BaseModel):
#     template_name: str
#     reason: str

# class CropListBase(BaseModel):
#     crop_type: str
#     quantity: float
#     unit: str
#     expected_price_per_unit: Decimal
#     harvest_date: date
#     location: str
#     # ADDED: New fields to match the model
#     farming_practice: Optional[str] = None
#     Soil_type: str
#     irrigation_source: Optional[str] = None
#     img_url: Optional[str] = None

# class CropListCreate(CropListBase):
#     pass

# class CropListResponse(CropListBase):
#     id: int
#     farmer_id: int
#     status: str
#     created_at: datetime
#     farmer: User
#     recommended_template_name: Optional[str] = None
#     recommendation_reason: Optional[str] = None
    
#     model_config = ConfigDict(from_attributes=True)

# class CropListUpdate(BaseModel):
#     crop_type: Optional[str] = None
#     quantity: Optional[float] = None
#     unit: Optional[str] = None
#     status: Optional[str] = None
#     # ADDED: New fields can also be updatable
#     farming_practice: Optional[str] = None
#     soil_type: Optional[str] = None
#     irrigation_source: Optional[str] = None
#     img_url: Optional[str] = None

# # --- Wallet & Transaction Schemas ---

# class Wallet(BaseModel):
#     id: int
#     user_id: int
#     balance: Decimal
#     # REMOVED: updated_at field to match the model
#     model_config = ConfigDict(from_attributes=True)

# class WalletAddFunds(BaseModel):
#     amount: Decimal

# class Transaction(BaseModel):
#     id: int
#     wallet_id: int
#     contract_id: Optional[int] = None
#     amount: Decimal
#     type: str
#     created_at: datetime
#     model_config = ConfigDict(from_attributes=True)

# # --- Contract & Milestone Schemas ---
# class Milestone(BaseModel):
#     id: int
#     # ADDED: New fields
#     name: str
#     amount: Decimal
#     is_complete: bool # 'done' in the frontend
    
#     update_text: Optional[str] = None
#     image_url: Optional[str] = None
#     ai_notes: Optional[str] = None
#     payment_released: bool # 'paid' in the frontend
#     created_at: datetime
#     model_config = ConfigDict(from_attributes=True)

# class MilestoneCreate(BaseModel):
#     # ADDED: name and amount are required when creating a milestone
#     name: str
#     amount: Decimal
#     update_text: Optional[str] = None
#     image_url: Optional[str] = None

# class ContractBase(BaseModel):
#     quantity_proposed: float
#     # RENAMED: To match the model
#     price_per_unit_agreed: Decimal

# class ContractCreate(ContractBase):
#     listing_id: int
#     # ADDED: Allow buyer to specify payment terms when proposing
#     payment_terms: Optional[str] = 'final' # Can be 'milestone' or 'final'

# class ContractResponse(ContractBase):
#     id: int
#     status: str
#     # ADDED: Show payment terms in the response
#     payment_terms: str
#     created_at: datetime
#     listing: CropListResponse
#     buyer: User
#     farmer: User
#     milestones: List[Milestone] = []
#     model_config = ConfigDict(from_attributes=True)

# # NEW: A comprehensive response for the dashboard
# class ContractDashboardResponse(ContractResponse):
#     total_value: Decimal
#     escrow_amount: Decimal
#     amount_paid: Decimal
    
# # --- Auth Schemas ---

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# class TokenData(BaseModel):
#     username: Optional[str] = None

# # --- NEW SCHEMA for the Compliance Helper's response ---
# class AIAdvice(BaseModel):
#     id: int
#     contract_id: int
#     generated_at: datetime
#     advice_text: str

#     model_config = ConfigDict(from_attributes=True)

# # This final call is important for Pydantic to resolve the relationship
# # between User and CropList correctly.
# ContractResponse.model_rebuild()

# # In schemas/all_schema.py
# class MilestoneFarmerUpdate(BaseModel):
#     update_text: str
#     image_url: Optional[str] = None

# schemas/all_schema.py

from pydantic import BaseModel, ConfigDict, EmailStr, model_validator
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

# --- Base Schemas for Nesting ---
# These are defined first to be used as types in other schemas below.

class User(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    model_config = ConfigDict(from_attributes=True)

class CropList(BaseModel):
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
    lists: List[CropList] = []
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
    Soil_type: str
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
    Soil_type: Optional[str] = None
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
    model_config = ConfigDict(from_attributes=True)

class MilestoneCreate(BaseModel):
    """Schema for a BUYER to create the milestone structure."""
    name: str
    amount: Decimal

class MilestoneUpdateByFarmer(BaseModel):
    """Schema for a FARMER to submit their update for a milestone."""
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

class ContractCreate(ContractBase):
    listing_id: int
    payment_terms: Optional[str] = 'final'

class ContractResponse(ContractBase):
    id: int
    status: str
    payment_terms: str
    created_at: datetime
    listing: CropListResponse
    buyer: User
    farmer: User
    milestones: List[Milestone] = []
    model_config = ConfigDict(from_attributes=True)

class ContractDashboardResponse(ContractResponse):
    total_value: Decimal
    escrow_amount: Decimal
    amount_paid: Decimal
    
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

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Final Rebuild ---
# This is no longer strictly necessary with the single-file structure,
# but it does no harm and is good practice for complex nested models.
UserResponse.model_rebuild()
ContractResponse.model_rebuild()