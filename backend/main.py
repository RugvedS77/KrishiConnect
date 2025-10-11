from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette_session import SessionMiddleware
import os
from database.postgresConn import engine, Base
from models import all_model

from contextlib import asynccontextmanager
from services.scheduler import send_daily_alerts # <-- Make sure this imports the right function
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from router import user_routes, auth_routes, croplist_routes, wallet_routes, contract_routes, signature_routes, milestone_routes, logistics_routes, chat_routes, service_routes, community_routes

all_model.Base.metadata.create_all(bind=engine)

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up the application...")
    # For testing, run every 30 seconds. For production, change back to 'cron'.
    scheduler.add_job(send_daily_alerts, 'interval', seconds=30)
    scheduler.start()
    yield
    print("Shutting down the application...")
    scheduler.shutdown()

app = FastAPI(
    title="Krishi Connect",
    lifespan=lifespan
)
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("Missing SECRET_KEY environment variable for session middleware")

app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    cookie_name="krishiconnect_session",
    same_site="lax"
)

origins = [
    "http://localhost:5173",
    "https://krishi-connect2.vercel.app"  # Your Vite frontend URL
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message" : "Welcom to Krishi Connect!"}


app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(croplist_routes.router)
app.include_router(wallet_routes.router)
app.include_router(contract_routes.router)
app.include_router(signature_routes.router)
app.include_router(milestone_routes.router)
app.include_router(logistics_routes.router)
app.include_router(chat_routes.router)
app.include_router(service_routes.router)
app.include_router(community_routes.router)
# app.include_router(whatsapp_routes.router)