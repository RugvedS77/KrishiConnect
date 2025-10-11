# # backend/services/scheduler.py

# from apscheduler.schedulers.asyncio import AsyncIOScheduler
# # We don't need these for the test, but they are good to keep for later
# # from sqlalchemy.orm import Session
# # from database.postgresConn import get_db
# # from models.all_model import User
# from services import whatsapp_service

# # --- THIS IS THE CORRECTED TEST FUNCTION ---
# async def send_daily_alerts():
#     """
#     The main job function that sends daily alerts to all opted-in farmers.
#     """
#     print("--- SCHEDULER JOB IS FIRING! ---")

    
#     # --- FOR TESTING ONLY: We will not use the database for this test ---
#     print("--- RUNNING IN TEST MODE: Sending to a single number ---")
    
#     # Create a simple object to act like a farmer
#     class MockFarmer:
#         pass
    
#     test_farmer = MockFarmer()
#     test_farmer.name = "Test User"
#     test_farmer.phone = "917620559249" 
    
#     # Put our single test farmer into a list so the loop still works
#     farmers = [test_farmer]
    
#     print(f"Found {len(farmers)} test farmer to notify.")

#     # The loop no longer needs to be in a try...finally block for this test
#     for farmer in farmers:
#         if farmer.phone:
#             # 1. Get market data for this farmer's crop/location
#             mandi_data = {'name': 'Pune', 'crop': 'Onion', 'min_price': '2100', 'avg_price': '2450'}

#             # 2. Send the WhatsApp alert using your service
#             whatsapp_service.send_mandi_price_alert(
#                 recipient_number=farmer.phone,
#                 farmer_name=farmer.name,
#                 mandi_name=mandi_data['name'],
#                 crop_name=mandi_data['crop'],
#                 min_price=mandi_data['min_price'],
#                 avg_price=mandi_data['avg_price']
#             )
#         else:
#             print(f"Skipping farmer {farmer.name} due to no phone number.")

# # --- SCHEDULER INITIALIZATION (This part is correct) ---
# scheduler = AsyncIOScheduler()

# # For testing: run every 5 minutes
# scheduler.add_job(send_daily_alerts, 'interval', seconds=10)

# # For production (keep this commented out for now)
# # scheduler.add_job(send_daily_alerts, 'cron', hour=8, minute=0, timezone='Asia/Kolkata')

# backend/services/scheduler.py

from services import onesignal_service # <-- Import our new service

async def send_daily_alerts():
    """
    The main job function that sends a push notification to all users via OneSignal.
    """
    print("Scheduler Job: Firing 'send_daily_alerts' to OneSignal.")

    # 1. Get market data (your logic here)
    mandi_data = {'name': 'Pune', 'crop': 'Onion', 'min_price': '2100', 'avg_price': '2450'}

    # 2. Create the message content for the notification
    heading = "Mandi Price Alert! (Pune)"
    message_content = (
        f"Today's Onion prices: "
        f"Min ₹{mandi_data['min_price']}, Avg ₹{mandi_data['avg_price']}"
    )

    # 3. Call the OneSignal service to send the notification
    await onesignal_service.send_notification_to_all(
        headings={"en": heading},
        contents={"en": message_content},
        url="https://krishi-connect2.vercel.app"  # This is where users will go when they click the notification
    )