from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from database.postgresConn import engine, Base
from models import all_model

from router import user_routes, auth_routes, croplist_routes, wallet_routes, contract_routes, milestone_routes, logistics_routes, chat_routes, service_routes, community_routes

all_model.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Krishi Connect"
)

origins = [
    "http://localhost:5173",  # Your Vite frontend URL
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
app.include_router(milestone_routes.router)
app.include_router(logistics_routes.router)
app.include_router(chat_routes.router)
app.include_router(service_routes.router)
app.include_router(community_routes.router)