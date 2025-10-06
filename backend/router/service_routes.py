from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import JSONResponse
from schemas.all_schema import TokenData # Or wherever your schemas are
from auth import oauth2
from services.weatherAPI import fetch_google_weather_and_advisories
from services.cotton_model import cotton_disease_model

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