#!/bin/bash
cd /Users/akshatjiwrajka/programming/OpenOA/dashboard-backend
exec /Users/akshatjiwrajka/programming/OpenOA/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
