# backend/services/onesignal_service.py

import os
import json
import requests
import asyncio

# Get your OneSignal credentials from the .env file
ONE_SIGNAL_APP_ID = os.environ.get("ONE_SIGNAL_APP_ID")
ONE_SIGNAL_API_KEY = os.environ.get("ONE_SIGNAL_REST_API_KEY")

# Ensure credentials are present
if not all([ONE_SIGNAL_APP_ID, ONE_SIGNAL_API_KEY]):
    raise EnvironmentError("OneSignal credentials are not set in environment variables.")

def send_notification_sync(payload: dict):
    """
    This is the synchronous function that actually makes the API call.
    We will run it in a separate thread to avoid blocking our async app.
    """
    headers = {
        "accept": "application/json",
        "Authorization": f"Basic {ONE_SIGNAL_API_KEY}",
        "content-type": "application/json"
    }
    try:
        response = requests.post(
            "https://onesignal.com/api/v1/notifications",
            headers=headers,
            data=json.dumps(payload)
        )
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        print("Successfully sent push notification via OneSignal.")
        print(response.text)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error sending OneSignal notification: {e}")
        return None

async def send_notification_to_all(headings: dict, contents: dict, url: str = None):
    """
    Asynchronously sends a push notification to all subscribed users.
    """
    payload = {
        "app_id": ONE_SIGNAL_APP_ID,
        "included_segments": ["Subscribed Users"],  # This sends to EVERYONE who clicked "Allow"
        "headings": headings,
        "contents": contents
    }
    if url:
        payload["url"] = url

    # Run the blocking 'requests' call in a non-blocking way
    return await asyncio.to_thread(send_notification_sync, payload)