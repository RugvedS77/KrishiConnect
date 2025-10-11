#!/bin/bash

# This line makes the script exit immediately if a command fails
set -e

# Run the database migrations
echo "--- Running database migrations ---"
python -m alembic upgrade head

# Start the Uvicorn server
echo "--- Starting Uvicorn server ---"
python -m uvicorn main:app --host 0.0.0.0 --port 7860