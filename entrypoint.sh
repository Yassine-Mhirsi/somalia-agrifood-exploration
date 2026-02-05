#!/bin/bash
set -e

# Run ETL pipeline if the database does not exist yet
if [ ! -f data/processed/agrifood.db ]; then
    echo "==> Running ETL pipeline..."
    uv run python etl/data_preparation.py
    echo "==> ETL complete."
else
    echo "==> Database already exists, skipping ETL."
fi

echo "==> Starting FastAPI server..."
exec uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000
