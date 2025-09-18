# helpers/milestone_helper.py

import os
import google.generativeai as genai
from PIL import Image
import io
import requests # Import the requests library

# ... (API configuration remains the same)
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel('gemini-pro-vision')
except Exception as e:
    print(f"Error configuring Google AI: {e}")
    model = None

# FIX: The function now accepts a URL string instead of raw bytes
def analyze_milestone_image(image_url: str) -> str:
    """
    Downloads an image from a public URL and uses the Gemini Pro Vision
    model to analyze it.
    """
    if not model:
        return "AI image analysis is currently unavailable."

    try:
        # 1. Download the image from the URL
        response = requests.get(image_url, stream=True)
        response.raise_for_status() # Raise an exception for bad status codes
        
        # 2. Prepare the image for the API from the downloaded content
        image_bytes = response.content
        img = Image.open(io.BytesIO(image_bytes))
        
        prompt = """
        You are an agricultural expert. Analyze this image of a crop. In 2-3 concise sentences, describe the following:
        1. The current growth stage of the crop (e.g., seedling, vegetative, flowering, harvesting).
        2. Any visible signs of common pests, diseases, or nutrient deficiencies. If the crop looks healthy, state that.
        """
        
        # 3. Call the LLM with the prompt and the downloaded image
        response = model.generate_content([prompt, img])
        return response.text.strip()
        
    except Exception as e:
        print(f"Error downloading or analyzing image from URL: {e}")
        return "Could not analyze image due to an error."