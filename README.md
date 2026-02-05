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

## CI/CD & Cloud Deployment (Render)

This project includes a full CI/CD pipeline:

- **CI** – GitHub Actions runs linting (`ruff`) and Docker build checks on every push and PR to `main`.
- **CD** – Render auto-deploys the backend and frontend from `main` using the [`render.yaml`](render.yaml) blueprint.

### Live URLs (after deployment)

| Service  | URL |
|----------|-----|
| Backend  | `https://somalia-agrifood-backend.onrender.com` |
| Frontend | `https://somalia-agrifood-frontend.onrender.com` |

### Deploy to Render (one-time setup)

1. Push `render.yaml` to the `main` branch.
2. Go to [render.com](https://render.com) and sign in with GitHub.
3. Click **New** > **Blueprint** and connect this repository.
4. Render detects `render.yaml` and creates both services automatically.
5. In the **somalia-agrifood-backend** service settings, add the `GOOGLE_API_KEY` secret.
6. Trigger a manual deploy or push a new commit — both services go live.

> **Note:** Render's free tier spins services down after 15 minutes of inactivity. The first request after idle takes ~30-60 seconds while the ETL runs and the server starts.

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