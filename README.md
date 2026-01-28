# Somalia Agrifood Exploration

A small end-to-end prototype that integrates Somalia agrifood datasets (food prices, crop production, and food security indicators), enriches them with a light AI step, and serves the unified data to an interactive dashboard.

## What this project does

- Runs an ETL pipeline that merges multiple HDX-style datasets into a single SQLite database.
- Uses an AI step to help map region names and filter relevant commodities.
- Exposes the integrated dataset through a FastAPI backend.
- Visualizes trends, regional comparisons, and indicators in a Next.js dashboard.

## Project journey

For a detailed write-up of the approach, decisions, and AI usage, see [JOURNEY.md](JOURNEY.md).

## Prerequisites

- Python 3.11+
- Node.js 20+ and pnpm  
  If pnpm is not installed:
  ```
  npm install -g pnpm@latest-10
  ```
- Docker + Docker Compose (for containerized runs)
- **Google API key** for the AI steps  
  Get one here: https://aistudio.google.com/api-keys

## Run with Docker

1. Create a `.env` file in the repo root:
   ```
   GOOGLE_API_KEY=your_actual_key_here
   ```

2. Build and run all services:
   ```
   docker compose up --build
   ```

3. Open the dashboard:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Local Setup (no Docker)

1. Create a `.env` file in the repo root:
   ```
   GOOGLE_API_KEY=your_actual_key_here
   ```
   The `.env.example` file shows the expected format.

2. Install Python dependencies (choose one):
   ```
   pip install uv
   uv sync
   ```
   Or using pip with the provided requirements file:
   ```
   pip install -r requirements.txt
   ```

3. Run the ETL to generate the integrated dataset:
   ```
   uv run python etl/data_preparation.py
   ```
   This creates `data/processed/agrifood.db` and `data/processed/integrated_agrifood_data.csv`.

4. Start the backend API:
   ```
   uv run backend/main.py
   ```

5. Start the frontend:
   ```
   cd frontend
   pnpm i
   pnpm dev
   ```

6. Open the dashboard:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000