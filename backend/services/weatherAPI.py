# services/weatherAPI.py
import os
import httpx

def generate_advisories(hourly_forecast: list):
    """
    Takes the hourly forecast list from Google Weather (forecastHours)
    and returns insights.
    (This function is unchanged)
    """
    advisories = []
    
    # --- 1. Check for Spraying (High Wind) ---
    high_wind = False
    for hour in hourly_forecast[:12]: 
        wind_speed = hour.get('wind', {}).get('speed', {}).get('value', 0)
        if wind_speed > 15:
            high_wind = True
            break
            
    if high_wind:
        advisories.append({
            "type": "Spraying",
            "insight": "High winds (>15 km/h) expected in the next 12 hours.",
            "action": "DO NOT SPRAY. High risk of spray drift."
        })

    # --- 2. Check for Spraying (Rain) ---
    high_rain_chance = False
    for hour in hourly_forecast[:6]: 
        rain_percent = hour.get('precipitation', {}).get('probability', {}).get('percent', 0)
        if rain_percent > 60:
            high_rain_chance = True
            break

    if high_rain_chance:
        advisories.append({
            "type": "Spraying",
            "insight": "High chance of rain (>60%) in the next 6 hours.",
            "action": "POSTPONE SPRAYING. Rain will wash off pesticides."
        })

    # --- 3. Check for Fungal Risk ---
    fungal_risk = False
    for hour in hourly_forecast:
        humidity = hour.get('relativeHumidity', 0)
        temp = hour.get('temperature', {}).get('degrees', 0)
        if humidity > 80 and temp > 25:
            fungal_risk = True
            break
            
    if fungal_risk:
        advisories.append({
            "type": "Disease",
            "insight": "High humidity (>80%) and warm temps expected.",
            "action": "HIGH FUNGAL RISK. Scout fields for signs of mildew or blight."
        })

    # --- 4. Irrigation Advice ---
    is_dry_spell = all(
        hour.get('precipitation', {}).get('probability', {}).get('percent', 0) < 20 
        for hour in hourly_forecast[:24]
    )

    if is_dry_spell and not high_rain_chance: 
         advisories.append({
            "type": "Irrigation",
            "insight": "Dry conditions expected for the next 24 hours.",
            "action": "PLAN TO IRRIGATE. Check soil moisture for sensitive crops."
        })
    
    if not advisories:
         advisories.append({
            "type": "General",
            "insight": "Weather conditions look stable for the next 48 hours.",
            "action": "It's a good time for general fieldwork."
        })

    return advisories


async def fetch_google_weather_and_advisories(lat: float = 18.52, lon: float = 73.85):
    """
    Fetches 48-hour forecast from Google Weather API (using hours:lookup)
    and generates farm advisories.
    """
    API_KEY = os.getenv("GOOGLE_WEATHER_API_KEY")
    if not API_KEY:
        return {"error": "GOOGLE_WEATHER_API_KEY not found in .env file."}

    API_URL = "https://weather.googleapis.com/v1/forecast/hours:lookup"
    
    params = {
        "key": API_KEY,
        "location.latitude": lat,
        "location.longitude": lon
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(API_URL, params=params)
            response.raise_for_status() 
            weather_data = response.json()
        
        hourly_forecast = weather_data.get('forecastHours', [])
        
        # --- 1. Get the list of insights (same as before) ---
        insights = generate_advisories(hourly_forecast)
        
        # --- 2. NEW: Get the "current" conditions from the first hour of the forecast ---
        current_conditions = {
            "temperature": "N/A",
            "humidity": "N/A",
            "rainfall_chance": "N/A",
            "description": "N/A"
        }
        
        if hourly_forecast: # Check if the list is not empty
            current_hour = hourly_forecast[0]
            current_conditions["temperature"] = current_hour.get('temperature', {}).get('degrees', 'N/A')
            current_conditions["humidity"] = current_hour.get('relativeHumidity', 'N/A')
            current_conditions["rainfall_chance"] = current_hour.get('precipitation', {}).get('probability', {}).get('percent', 'N/A')
            current_conditions["description"] = current_hour.get('weatherCondition', {}).get('description', {}).get('text', 'N/A')

        # --- 3. NEW: Return a new object containing BOTH insights and current conditions ---
        return {
            "insights": insights,
            "current_conditions": current_conditions
        }
        
    except httpx.HTTPStatusError as e:
        error_text = e.response.text
        return {
            "error": "Google API request failed", 
            "status_code": e.response.status_code,
            "message_from_google": error_text
        }
    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}"}