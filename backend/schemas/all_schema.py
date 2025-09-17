# schemas/all_schema.py

from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

# --- Base Schemas & Forward References ---

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
    expected_price_per_unit: Decimal
    farmer: User
    model_config = ConfigDict(from_attributes=True)

# --- User Schemas ---

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
    expected_price_per_unit: Decimal
    harvest_date: date
    location: str
    # ADDED: New fields to match the model
    farming_practice: Optional[str] = None
    Soil_type: str
    irrigation_source: Optional[str] = None
    photo_url: Optional[str] = None

class CropListCreate(CropListBase):
    pass

class CropListResponse(CropListBase):
    id: int
    farmer_id: int
    status: str
    created_at: datetime
    farmer: User
    model_config = ConfigDict(from_attributes=True)

class CropListUpdate(BaseModel):
    crop_type: Optional[str] = None
    quantity: Optional[float] = None
    status: Optional[str] = None
    # ADDED: New fields can also be updatable
    farming_practice: Optional[str] = None
    Soil_type: Optional[str] = None
    irrigation_source: Optional[str] = None
    photo_url: Optional[str] = None

# --- Wallet & Transaction Schemas ---

class Wallet(BaseModel):
    id: int
    user_id: int
    balance: Decimal
    # REMOVED: updated_at field to match the model
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

# --- Contract & Milestone Schemas ---

class Milestone(BaseModel):
    id: int
    update_text: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ContractBase(BaseModel):
    quantity_proposed: float
    # RENAMED: To match the model
    price_per_unit_agreed: Decimal

class ContractCreate(ContractBase):
    listing_id: int

class ContractResponse(ContractBase):
    id: int
    status: str
    created_at: datetime
    listing: CropListResponse
    buyer: User
    farmer: User
    milestones: List[Milestone] = []
    model_config = ConfigDict(from_attributes=True)
    
# --- Auth Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# This final call is important for Pydantic to resolve the relationship
# between User and CropList correctly.
UserResponse.model_rebuild()