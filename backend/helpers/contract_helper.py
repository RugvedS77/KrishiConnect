# helpers/contract_helper.py

import os
import google.generativeai as genai
from models.all_model import Contract as ContractModel

# Configure the API client (shares configuration with recommendation_engine)
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error configuring Google AI: {e}")
    model = None

def generate_contract_summary(contract: ContractModel) -> str:
    """
    Uses an LLM to generate a simple, easy-to-understand summary
    of a contract for a farmer.
    """
    if not model:
        return "AI summarizer is currently unavailable."

    # Gather all the necessary details from the contract object and its relationships
    details = {
        "Crop": contract.listing.crop_type,
        "Quantity": f"{contract.quantity_proposed} {contract.listing.unit}",
        "Agreed Price": f"{contract.price_per_unit_agreed} INR per {contract.listing.unit}",
        "Total Value": f"{contract.quantity_proposed * contract.price_per_unit_agreed:.2f} INR",
        "Buyer": contract.buyer.full_name,
        "Farmer": contract.farmer.full_name
    }

    details_text = "\n".join([f"- {key}: {value}" for key, value in details.items()])

    prompt = f"""
    You are an assistant who helps small-scale farmers in India understand their legal contracts.
    Your task is to summarize the key points of a contract in a simple, 2-3 sentence paragraph.

    Use clear and simple language. Do not use complex legal terms.
    Focus on what the farmer needs to deliver and what they will be paid.

    Here are the contract details:
    {details_text}

    Generate the summary now.
    """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error calling LLM for contract summary: {e}")
        return "Could not generate summary due to an error."