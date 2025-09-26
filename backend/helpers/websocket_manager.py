# helpers/websocket_manager.py (Slightly Modified)

from fastapi import WebSocket
from typing import List, Dict

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    # This function no longer calls websocket.accept().
    # The endpoint will handle that itself.
    async def connect(self, websocket: WebSocket, contract_id: int):
        if contract_id not in self.active_connections:
            self.active_connections[contract_id] = []
        self.active_connections[contract_id].append(websocket)
        print(f"New connection added to room {contract_id}.")

    def disconnect(self, websocket: WebSocket, contract_id: int):
        if contract_id in self.active_connections:
            # Add a check to prevent errors if the websocket is already gone
            if websocket in self.active_connections[contract_id]:
                self.active_connections[contract_id].remove(websocket)
        print(f"Connection removed from room {contract_id}.")

    async def broadcast(self, message: str, contract_id: int):
        if contract_id in self.active_connections:
            for connection in self.active_connections[contract_id]:
                await connection.send_text(message)

manager = ConnectionManager()