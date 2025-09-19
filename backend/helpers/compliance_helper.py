# helpers/compliance_helper.py

import os
import google.generativeai as genai
from sqlalchemy.orm import Session
from decimal import Decimal
from models.all_model import Contract as ContractModel, Transaction as TransactionModel, Milestone as MilestoneModel

# Configure the API client
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error configuring Google AI: {e}")
    model = None

def _gather_compliance_context(contract: ContractModel, db: Session) -> str:
    """Helper function to collect and format all data about a contract for the LLM."""

    # 1. Get financial details
    transactions = db.query(TransactionModel).filter(TransactionModel.contract_id == contract.id).all()
    total_value = Decimal(contract.quantity_proposed) * contract.price_per_unit_agreed
    
    amount_paid = sum(t.amount for t in transactions if t.type == 'release')
    amount_in_escrow = sum(t.amount for t in transactions if t.type == 'escrow') - amount_paid
    amount_remaining_to_pay = total_value - amount_paid

    # 2. Get latest milestone analysis
    latest_milestone = db.query(MilestoneModel).filter(MilestoneModel.contract_id == contract.id).order_by(MilestoneModel.created_at.desc()).first()
    latest_ai_notes = latest_milestone.ai_notes if latest_milestone else "No milestone submitted yet."

    # 3. Format everything into a clean text block
    context = f"""
    CONTRACT STATUS REPORT:
    - Crop: {contract.listing.crop_type}
    - Total Contract Value: {total_value:.2f} INR
    - Amount Paid to Farmer so far: {amount_paid:.2f} INR
    - Amount Currently in Escrow: {amount_in_escrow:.2f} INR
    - Remaining Amount to be Paid: {amount_remaining_to_pay:.2f} INR
    - Contract Status: {contract.status.value}
    
    LATEST MILESTONE ANALYSIS:
    {latest_ai_notes}
    """
    return context

def get_compliance_advice(contract: ContractModel, db: Session) -> str:
    """Generates a compliance and action plan for a farmer using an LLM."""
    if not model:
        return "AI Compliance Helper is currently unavailable."

    # First, gather all the up-to-date information
    context = _gather_compliance_context(contract, db)

    prompt = f"""
    You are an expert farm advisor named 'Sahayak'. Your goal is to help a small farmer in India understand their contract status and give them a clear, simple action plan. Use encouraging and simple language.

    Analyze the following contract status report. Based *only* on the data provided, generate a report for the farmer. The report must have three sections with these exact titles:
    1. **Risk Alerts**: Point out any potential risks mentioned in the report (e.g., "The latest milestone shows signs of nutrient deficiency which could risk the final quality"). If there are no obvious risks, say "No immediate risks found. Everything looks on track!".
    2. **Next Payment**: Clearly state what the farmer needs to do to receive their next payment, based on the contract status and remaining payments.
    3. **Action Plan**: Provide a simple, step-by-step plan for the rest of the contract.

    Here is the report to analyze:
    {context}
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error calling LLM for compliance advice: {e}")
        return "Could not generate compliance advice due to an error."