# backend/recommendation/crop_recommender.py
import os
import json
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import asyncio
import httpx

# Gemini / Google Generative AI client
try:
    import google.generativeai as genai
except Exception:
    genai = None

# ---- config ----
BASE_DIR = Path(__file__).parent
print(BASE_DIR)
DATA_PATH = BASE_DIR / "crop_data.json"

PROMPT_TEMPLATE_PATH = BASE_DIR / "crop_prompt_template.py"

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
GEMINI_MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")
OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY")

# Initialize the Gemini client only once when the application starts
GEMINI_CLIENT = None
if genai and GOOGLE_API_KEY:
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        GEMINI_CLIENT = genai.GenerativeModel(GEMINI_MODEL_NAME)
        print(f"Successfully configured Gemini client with model: {GEMINI_MODEL_NAME}")
    except Exception as e:
        print(f"Failed to configure Gemini client: {e}")
else:
    print("Google AI library not found or GOOGLE_API_KEY not set. Gemini features will be disabled.")

# ---- load crop data ----
def load_crop_data() -> List[Dict[str, Any]]:
    if DATA_PATH.exists():
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

CROP_DATA = load_crop_data()

# ---- helper rule-based scorer ----
def score_crop_rule_based(crop: Dict[str, Any], params: Dict[str, Any]) -> float:
    ideal = crop.get("ideal", {})
    score = 0.0
    total = 0.0

    def in_range(val, rng):
        try:
            if isinstance(rng, list) and len(rng) == 2:
                return rng[0] <= val <= rng[1]
        except Exception:
            pass
        return False

    for key in ("nitrogen", "phosphorus", "potassium"):
        total += 1
        rng = ideal.get(key)
        val = params.get(key)
        if val is None or rng is None:
            score += 0.0
        else:
            if in_range(val, rng):
                score += 1.0
            else:
                low, high = rng
                if val < low:
                    dist = (low - val) / (low + 1e-6)
                else:
                    dist = (val - high) / (high + 1e-6)
                credit = max(0.0, 1.0 - min(dist, 1.0))
                score += credit

    total += 1
    rng = ideal.get("pH")
    val = params.get("pH")
    if val is not None and rng:
        if in_range(val, rng):
            score += 1.0
        else:
            low, high = rng
            dist = min(abs(val - low), abs(val - high)) / (max(abs(high - low), 0.1))
            score += max(0.0, 1.0 - min(dist, 1.0))

    total += 1
    temp = params.get("temperature")
    min_t = ideal.get("min_temp")
    max_t = ideal.get("max_temp")
    if temp is not None and min_t is not None and max_t is not None:
        if min_t <= temp <= max_t:
            score += 1.0
        else:
            dist = min(abs(temp - min_t), abs(temp - max_t)) / (abs(max_t - min_t) + 1e-6)
            score += max(0.0, 1.0 - min(dist, 1.0))

    total += 1
    rain = params.get("rainfall")
    rng = ideal.get("rainfall")
    if rain is not None and rng:
        low, high = rng
        if low <= rain <= high:
            score += 1.0
        else:
            dist = min(abs(rain - low), abs(rain - high)) / (max(abs(high - low), 1))
            score += max(0.0, 1.0 - min(dist, 1.0))

    total += 1
    water_avail = params.get("water_available_liters")
    area = params.get("area_hectares") or 1.0
    req = ideal.get("water_required_per_hectare")
    if water_avail is None or req is None:
        score += 0.0
    else:
        per_ha = water_avail / max(area, 1e-6)
        if per_ha >= req:
            score += 1.0
        else:
            score += per_ha / req

    if total <= 0:
        return 0.0
    return max(0.0, min(1.0, score / total))

def recommend_rule_based(params: Dict[str, Any], top_k: int = 5) -> List[Dict[str, Any]]:
    """Generates top-k crop recommendations using the rule-based engine."""
    scored_crops = [
        {
            "name": crop["name"],
            "suitability_score": round(score_crop_rule_based(crop, params), 3),
            "reason": f"Matches soil and climate parameters. {crop.get('notes', '')}"
        }
        for crop in CROP_DATA
    ]
    scored_crops.sort(key=lambda x: x["suitability_score"], reverse=True)
    return scored_crops[:top_k]


# --- Helper Services ---

async def fetch_weather_by_coords(lat: float, lon: float) -> Dict[str, Any]:
    """Fetches and simplifies weather data from OpenWeatherMap."""
    if not OPENWEATHER_API_KEY:
        return {}
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
            return {
                "temperature": data.get("main", {}).get("temp"),
                "humidity": data.get("main", {}).get("humidity"),
            }
    except Exception as e:
        print(f"Weather fetch failed: {e}")
        return {}


# --- Gemini-Based Recommendation Engine (Updated to be fully async) ---

async def recommend_with_gemini(params: Dict[str, Any], top_k: int = 5) -> Optional[List[Dict[str, Any]]]:
    """Generates crop recommendations using the Gemini model asynchronously."""
    if not GEMINI_CLIENT:
        return None

    # Dynamically import the prompt template to avoid circular dependencies if needed
    from services.crop_prompt_template import PROMPT_JSON_TEMPLATE
    
    prompt = PROMPT_JSON_TEMPLATE.format(**params)

    try:
        # --- KEY CHANGE: Use the native asynchronous method ---
        response = await GEMINI_CLIENT.generate_content_async(prompt)
        content = response.text
        # ---------------------------------------------------
        
        if not content:
            return None
            
        # Clean the response to ensure it's valid JSON
        cleaned_content = content.strip().lstrip("```json").rstrip("```")
        data = json.loads(cleaned_content)
        
        recommendations = data.get("recommendations", [])
        return recommendations[:top_k]

    except Exception as e:
        print(f"Gemini recommendation failed: {e}")
        return None


# --- Main Orchestrator Function ---

async def recommend(params: Dict[str, Any], top_k: int = 5) -> Tuple[List[Dict[str, Any]], str]:
    """
    Main recommendation function. Tries Gemini first, then falls back to the rule-based engine.
    """
    # Try to get a recommendation from Gemini
    gemini_recommendations = await recommend_with_gemini(params, top_k=top_k)

    if gemini_recommendations:
        print("Returning recommendations from Gemini.")
        return gemini_recommendations, "gemini"

    # If Gemini fails or is disabled, use the reliable rule-based fallback
    print("Gemini failed or is disabled. Falling back to rule-based engine.")
    rule_based_recommendations = recommend_rule_based(params, top_k=top_k)
    return rule_based_recommendations, "rule-based"