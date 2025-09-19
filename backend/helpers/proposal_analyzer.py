# helpers/proposal_analyzer.py

import os
import json
from decimal import Decimal
import google.generativeai as genai
from typing import List
from models.all_model import CropList as CropListModel, Contract as ContractModel

# Configure the API client
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error configuring Google AI: {e}")
    model = None

def analyze_proposals(listing: CropListModel, proposals: List[ContractModel]) -> dict:
    """
    Uses an LLM to analyze a list of contract proposals and recommend the best one for the farmer.
    """
    if not model:
        return {"error": "AI analyzer is currently unavailable."}

    # Format the farmer's original listing details as a baseline
    listing_details = (
        f"Your Original Listing:\n"
        f"- Crop: {listing.crop_type}\n"
        f"- Quantity: {listing.quantity} {listing.unit}\n"
        f"- Asking Price: {listing.expected_price_per_unit} INR per {listing.unit}\n"
    )

    # Format each proposal for the LLM
    proposals_text = []
    for p in proposals:
        total_value = Decimal(p.quantity_proposed) * p.price_per_unit_agreed
        proposal_str = (
            f"Proposal ID: {p.id}\n"
            f"  - Buyer ID: {p.buyer_id}\n"
            f"  - Proposed Price: {p.price_per_unit_agreed} INR per {listing.unit}\n"
            f"  - Proposed Quantity: {p.quantity_proposed} {listing.unit}\n"
            f"  - Total Value: {total_value:.2f} INR\n"
            f"  - Payment Terms: '{p.payment_terms}'"
        )
        proposals_text.append(proposal_str)

    proposals_details = "\n\n".join(proposals_text)

    prompt = f"""
    You are an expert farm advisor named 'Sahayak' who helps farmers in India. Your goal is to help a farmer choose the most beneficial contract proposal for their crop listing.

    First, here is the farmer's original listing:
    {listing_details}

    Next, here are the contract proposals they have received from different buyers:
    {proposals_details}

    Analyze all the proposals and compare them based on total value, price per unit, and payment terms. Recommend the single best proposal for the farmer.

    Your response MUST be a clean JSON object with exactly two keys: "best_proposal_id" (the integer ID of the best proposal) and "reason" (a brief, simple, 2-sentence explanation written to the farmer about why that proposal is the best choice for them).
    """

    try:
        response = model.generate_content(prompt)
        json_response = response.text.strip().replace('`', '').replace('json', '')
        analysis_data = json.loads(json_response)
        return analysis_data
    except Exception as e:
        print(f"Error calling LLM for proposal analysis: {e}")
        return {"error": "Could not analyze proposals due to an error."}