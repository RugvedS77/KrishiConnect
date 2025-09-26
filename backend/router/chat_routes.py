# router/chat_routes.py (Final Corrected Logic)

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
import json
from datetime import datetime

from database.postgresConn import SessionLocal
from models.all_model import NegotiationMessage as NegotiationMessageModel, User as UserModel, Contract as ContractModel
from helpers.websocket_manager import manager # Assuming your manager is in the 'app' directory

router = APIRouter(
    prefix="/ws",
    tags=["Chat"]
)

@router.websocket("/negotiate/{contract_id}/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    contract_id: int, 
    user_id: int
):
    await websocket.accept()

    # --- Create a short-lived session for validation ---
    db = SessionLocal()
    try:
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        contract = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
        
        # --- THIS IS THE FIX ---
        # The validation logic is now INSIDE the 'try' block.
        if not user or not contract or user.id not in [contract.buyer_id, contract.farmer_id]:
            print("Validation failed: User/contract not found or not authorized.")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return # Exit early if validation fails
        
        print("--- VALIDATION SUCCESSFUL ---")

    finally:
        # The session is always closed after we're done with it.
        db.close()

    # If we get here, validation was successful.
    await manager.connect(websocket, contract_id)

    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            with SessionLocal() as message_db:
                new_message = NegotiationMessageModel(
                    contract_id=contract_id,
                    sender_id=user_id,
                    message=message_data.get("message"),
                    created_at=datetime.utcnow()
                )
                message_db.add(new_message)
                message_db.commit()
                message_db.refresh(new_message)
                
                broadcast_message = {
                    "id": new_message.id,
                    "sender_id": new_message.sender_id,
                    "message": new_message.message,
                    "created_at": new_message.created_at.isoformat()
                }

            await manager.broadcast(json.dumps(broadcast_message), contract_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, contract_id)
    except Exception as e:
        print(f"An error occurred in chat loop for room {contract_id}: {e}")
        manager.disconnect(websocket, contract_id)