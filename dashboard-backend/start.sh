#!/bin/bash
# Render Start Script for OpenOA Backend

# Set Python path to include the OpenOA package
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Navigate to backend directory
cd dashboard-backend

# Start the server
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
