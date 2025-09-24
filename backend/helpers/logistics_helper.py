# helpers/logistics_helper.py
import os
from decimal import Decimal
from datetime import datetime, timedelta, timezone

# FIX: Import the SQLAlchemy model to use it as a type hint
from models.all_model import Shipment as ShipmentModel

USE_REAL_LOGISTICS_API = False

class SimulatedLogisticsProvider:
    """
    Returns fake but correctly formatted data without calling a real API.
    This simulates a real logistics provider like Porter or Vahak.
    """
    def get_quote(self, from_address: str, to_address: str, vehicle_type: str) -> dict:
        print(f"--- SIMULATING: Getting quote for {vehicle_type} from {from_address} to {to_address} ---")
        cost = Decimal("4500.00")
        if "tata ace" in vehicle_type.lower():
            cost = Decimal("2500.00")
        return {"quote_id": "sim_quote_12345",
                 "estimated_cost": cost,
                 "logistics_provider": "KrishiConnect Logistics (Simulated)"
                 }

    def book_transport(self, quote_id: str) -> dict:
        print(f"--- SIMULATING: Booking shipment for quote {quote_id} ---")
        booking_id = f"KCB_{quote_id.split('_')[-1]}"
        return {
            "booking_id": booking_id,
            "status": "booked",
            "tracking_url": f"https://krishiconnect.example.com/track/{booking_id}"
        }
        
    # ADDED: New simulated function for tracking
    def track_shipment(self, shipment: ShipmentModel) -> dict:
        """
        Simulates a changing shipment status based on the time elapsed
        since it was booked.
        """
        print(f"--- SIMULATING: Tracking shipment {shipment.booking_id} ---")
        
        # Calculate time since the contract was created (assuming shipment is booked soon after)
        time_since_booking = datetime.now(timezone.utc) - shipment.contract.created_at.replace(tzinfo=timezone.utc)
        
        status = "Booked"
        if time_since_booking > timedelta(minutes=5):
            status = "In Transit"
        if time_since_booking > timedelta(minutes=15):
            status = "Out for Delivery"
        if time_since_booking > timedelta(minutes=30):
            status = "Delivered"

        return {"booking_id": shipment.booking_id, "status": status}
            
    def cancel_shipment(self, shipment: ShipmentModel) -> dict:
        """
        Simulates a cancellation request. Only allows cancellation if the
        shipment has not yet started its journey.
        """
        print(f"--- SIMULATING: Attempting to cancel shipment {shipment.booking_id} ---")
        
        # Get the current (simulated) status
        current_status = self.track_shipment(shipment)['status']
        
        # Business Rule: You can't cancel a shipment that's already moving.
        if current_status not in ["Booked"]:
            return {
                "success": False,
                "message": f"Cannot cancel. Shipment is already {current_status}."
            }

        return {
            "success": True,
            "message": "Booking cancelled successfully."
        }
    
# # This switch allows you to easily swap in a real provider later
# if USE_REAL_LOGISTICS_API == True:
#     # logistics_provider = RealPorterAPI()
#     pass
# else:
logistics_provider = SimulatedLogisticsProvider()