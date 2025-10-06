# models/all_model.py

import enum
from sqlalchemy import (
    Column, Integer, String, Float, Date, Enum,
    ForeignKey, DateTime, Text, Numeric, Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import Enum as SQLAlchemyEnum
# IMPORTANT: Import the single, shared Base object from your database file
from database.postgresConn import Base

# --- ENUMS ---
class UserRole(str, enum.Enum):
    buyer = "buyer"
    farmer = "farmer"

class ContractStatus(str, enum.Enum):
    pending_farmer_approval = "pending_farmer_approval"
    accepted = "accepted"
    rejected = "rejected"
    ongoing = "ongoing"
    negotiating = "negotiating"
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

    forum_posts = relationship("ForumPost", back_populates="author", cascade="all, delete-orphan")
    forum_replies = relationship("ForumReply", back_populates="author", cascade="all, delete-orphan")

class CropList(Base):
    __tablename__ = "crop_lists"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_type = Column(String, index=True, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    expected_price_per_unit = Column(Numeric(10, 2), nullable=False)
    harvest_date = Column(Date, nullable=False)
    location = Column(String, nullable=False)
    farming_practice = Column(String, nullable=True)
    soil_type = Column(String, nullable=False) # Standardized to lowercase
    status = Column(String, default="active", nullable=False)
    irrigation_source = Column(String, nullable=True)
    img_url = Column(String, nullable=True) # Standardized name
    recommended_template_name = Column(String, nullable=True)
    recommendation_reason = Column(Text, nullable=True)
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
    payment_terms = Column(String, default="final", nullable=False)
    summary = Column(Text, nullable=True)
    last_offer_by = Column(String, nullable=False, default='buyer')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    listing = relationship("CropList", back_populates="contracts")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="contracts_as_buyer")
    farmer = relationship("User", foreign_keys=[farmer_id], back_populates="contracts_as_farmer")
    milestones = relationship("Milestone", back_populates="contract", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="contract", cascade="all, delete-orphan")
    ai_advisories = relationship("AIAdvice", back_populates="contract", cascade="all, delete-orphan")
    shipments = relationship("Shipment", back_populates="contract", cascade="all, delete-orphan")
    negotiation_messages = relationship("NegotiationMessage", back_populates="contract", cascade="all, delete-orphan")

class Milestone(Base):
    __tablename__ = "milestones"
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    is_complete = Column(Boolean, default=False, nullable=False)
    payment_released = Column(Boolean, default=False, nullable=False)
    update_text = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    ai_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    contract = relationship("Contract", back_populates="milestones")
    shipment = relationship("Shipment", back_populates="milestone", uselist=False, cascade="all, delete-orphan")

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

class AIAdvice(Base):
    __tablename__ = "ai_advisories"
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    advice_text = Column(Text, nullable=False)

    contract = relationship("Contract", back_populates="ai_advisories")

class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    milestone_id = Column(Integer, ForeignKey("milestones.id"), unique=True, nullable=False)
    logistics_provider = Column(String, nullable=True)
    booking_id = Column(String, nullable=True)
    status = Column(String, default="pending", nullable=False)
    estimated_cost = Column(Numeric(10, 2), nullable=True)
    tracking_url = Column(String, nullable=True)
    
    contract = relationship("Contract", back_populates="shipments")
    milestone = relationship("Milestone", back_populates="shipment")

class NegotiationMessage(Base):
    __tablename__ = 'negotiation_messages'
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey('contracts.id'), nullable=False)
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # This will store the template message, e.g., "I propose a new price."
    message = Column(String, nullable=False)
    
    # The actual new values being negotiated
    proposed_price = Column(Float, nullable=True)
    proposed_quantity = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    sender = relationship("User")
    contract = relationship("Contract", back_populates="negotiation_messages") # Add back_populates to Contract model

# Community and other Services

class ForumPost(Base):
    __tablename__ = "forum_posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    content = Column(String, nullable=False)
    category = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    created_at =  Column(DateTime(timezone=True), server_default=func.now())

    # Foreign key to User
    author_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    # Relationships
    author = relationship("User", back_populates="forum_posts")
    replies = relationship("ForumReply", back_populates="post", cascade="all, delete-orphan")

class ForumReply(Base):
    __tablename__ = "forum_replies"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    created_at =  Column(DateTime(timezone=True), server_default=func.now())

    # Foreign keys
    post_id = Column(Integer, ForeignKey("forum_posts.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    post = relationship("ForumPost", back_populates="replies")
    author = relationship("User", back_populates="forum_replies")

