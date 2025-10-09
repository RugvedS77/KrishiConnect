# helpers/recommendation_engine.py

import os
import json
import google.generativeai as genai
from models.all_model import CropList as CropListModel
from decimal import Decimal

# Configure the API client
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel('gemini-2.5-flash-lite')
except Exception as e:
    print(f"Error configuring Google AI: {e}")
    model = None
# FIX: Load the template context from the external text file
try:
    with open('helpers/contract_templates.txt', 'r') as f:
        template_context = f.read()
except FileNotFoundError:
    print("Warning: 'helpers/contract_templates.txt' not found. Using fallback context.")
    template_context = "Basic contract templates are available."


def get_template_recommendation_with_llm(listing: CropListModel) -> dict:
    """
    Uses a Generative LLM to provide an intelligent contract template recommendation.
    """
    if not model:
        return {
            "template_name": "Simple Supply Contract",
            "reason": "AI engine not available. Defaulting to the simplest template."
        }
    
    total_value = Decimal(listing.quantity) * listing.expected_price_per_unit

    prompt = f"""
    You are an expert advisor for small-scale farmers in India, specializing in contract farming agreements. Your goal is to protect the farmer's interests.
    
    Here are the available contract templates:
    {template_context}

    Carefully analyze the following crop listing from a farmer. Based on its details and the pros/cons of each template, recommend the single best contract type for the farmer.
    The total estimated value of this deal is {total_value:.2f} INR.

    Crop Listing Details:
    - Crop Type: {listing.crop_type}
    - Quantity: {listing.quantity}{listing.unit}
    - Expected Price per Unit: {listing.expected_price_per_unit} INR
    - Farming Practice: {listing.farming_practice or 'Not specified'}
    - Location: {listing.location}
    - Soil Type: {listing.soil_type}

    Your response MUST be a clean JSON object with exactly two keys: "template_name" (the full name of the best template) and "reason" (a brief, simple, one-sentence explanation written directly to the farmer explaining *why* this template is best for them and protects their interests).
    """

    try:
        response = model.generate_content(prompt)
        json_response = response.text.strip().replace('`', '').replace('json', '')
        recommendation_data = json.loads(json_response)
        return recommendation_data
    except Exception as e:
        print(f"Error calling LLM or parsing response: {e}")
        return {
            "template_name": "Simple Supply Contract",
            "reason": "Could not get an intelligent recommendation. Defaulting to a basic template is a safe option."
        }