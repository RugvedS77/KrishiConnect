PROMPT_JSON_TEMPLATE = """
You are an expert agronomist. Given the farm conditions, return a JSON array `recommendations`
with up to 5 crop recommendations sorted by best fit first.

INPUT:
- location: {location}
- soil: N={nitrogen} P={phosphorus} K={potassium}, pH={pH}
- weather: temperature(C)={temperature}, humidity(%)={humidity}, rainfall_mm_per_year={rainfall}
- water_available_liters={water_available_liters}
- area_hectares={area_hectares}
- additional_notes: {notes}

INSTRUCTION:
Analyze soil nutrients, pH, rainfall, temperature range, water available and area.
Return JSON like:
{{
  "recommendations": [
    {{
      "name": "Crop name",
      "suitability_score": 0.0,   // 0.0 - 1.0
      "reason": "short reason why it's suitable",
      "expected_yield_estimate": "optional, e.g. 2.5 t/ha"
    }}
    // up to 5
  ]
}}

Do not include any other text. Strict valid JSON only.
"""