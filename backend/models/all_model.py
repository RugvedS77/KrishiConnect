# models/models.py

import enum
from sqlalchemy import (
    Column, Integer, String, Float, Date, Enum,
    ForeignKey, DateTime, Text, Numeric
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

# --- ENUMS ---

class UserRole(str, enum.Enum):
    buyer = "buyer"
    farmer = "farmer"

class ContractStatus(str, enum.Enum):
    pending_farmer_approval = "pending_farmer_approval"
    accepted = "accepted"
    rejected = "rejected"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"

# --- MODELS ---

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), nullable=False)
    business_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    lists = relationship("CropList", back_populates="farmer", cascade="all, delete-orphan")
    contracts_as_buyer = relationship("Contract", foreign_keys="[Contract.buyer_id]", back_populates="buyer")
    contracts_as_farmer = relationship("Contract", foreign_keys="[Contract.farmer_id]", back_populates="farmer")

class CropList(Base):
    __tablename__ = "crop_lists"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_type = Column(String, index=True, nullable=False)
    quantity = Column(Float, nullable=False)  # in tons / KG/ Quintals
    expected_price_per_unit = Column(Numeric(10, 2), nullable=False)   #in rupe
    harvest_date = Column(Date, nullable=False)
    location = Column(String, nullable=False)
    farming_practice = Column(String, nullable=True)
    Soil_type = Column(String, nullable=False)
    status = Column(String, default="active", nullable=False)
    irrigation_source = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    farmer = relationship("User", back_populates="lists")
    contracts = relationship("Contract", back_populates="listing", cascade="all, delete-orphan")

class Contract(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("crop_lists.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quantity_proposed = Column(Float, nullable=False)
    price_per_unit_agreed = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(ContractStatus), default=ContractStatus.pending_farmer_approval, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    listing = relationship("CropList", back_populates="contracts")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="contracts_as_buyer")
    farmer = relationship("User", foreign_keys=[farmer_id], back_populates="contracts_as_farmer")
    milestones = relationship("Milestone", back_populates="contract", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="contract")

class Milestone(Base):
    __tablename__ = "milestones"
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    update_text = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    contract = relationship("Contract", back_populates="milestones")

class Wallet(Base):
    __tablename__ = "wallets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Numeric(12, 2), default=0.00, nullable=False)
    
    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    wallet = relationship("Wallet", back_populates="transactions")
    contract = relationship("Contract", back_populates="transactions")