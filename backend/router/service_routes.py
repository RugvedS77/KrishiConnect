from fastapi import APIRouter, Depends, UploadFile, File, status
from fastapi.responses import JSONResponse
from schemas.all_schema import TokenData, RecommendationRequest, RecommendationResponse
from auth import oauth2
from services.weatherAPI import fetch_google_weather_and_advisories
from services.cotton_model import cotton_disease_model
from services.crop_recommender import recommend, fetch_weather_by_coords
import logging

router = APIRouter(
    prefix="/api/services",
    tags=["Services"]
)

@router.get("/weather")
async def get_weather(current_user: TokenData = Depends(oauth2.get_current_user)):
    response = await fetch_google_weather_and_advisories()
    return response

@router.post("/cotton-predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        result = cotton_disease_model.predict_disease(image_bytes)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
logger = logging.getLogger("recommendation")
logging.basicConfig(level=logging.INFO)

@router.post("/recommend-crops", response_model=RecommendationResponse, status_code=status.HTTP_200_OK)
async def recommend_crops(req: RecommendationRequest):
    params = req.dict(by_alias=True)

    # If lat/lon provided, try to fetch current weather and merge
    if params.get("latitude") is not None and params.get("longitude") is not None:
        weather = await fetch_weather_by_coords(params["latitude"], params["longitude"])
        if weather:
            if params.get("temperature") is None and weather.get("temperature") is not None:
                params["temperature"] = weather["temperature"]
            if params.get("humidity") is None and weather.get("humidity") is not None:
                params["humidity"] = weather["humidity"]
            if params.get("rainfall") is None and weather.get("rainfall") is not None:
                params["rainfall"] = weather["rainfall"]

    try:
        recs, source = await recommend(params, top_k=5)
        logger.info(f"Recommendation generated using: {source}")
    except Exception as e:
        logger.error(f"Recommendation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {e}")

    return {"recommendations": recs, "source": source}

