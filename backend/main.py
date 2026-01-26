from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os

app = FastAPI(title="Somalia Agrifood Exploration API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For prototype, allow all. In production, restrict this.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "agrifood.db")

@app.get("/")
async def root():
    return {"message": "Somalia Agrifood Exploration API is running"}

@app.get("/api/data")
async def get_integrated_data():
    """
    Returns all integrated agrifood data from the SQLite database.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM integrated_data")
        rows = cursor.fetchall()
        # Convert sqlite3.Row objects to dictionaries
        data = [dict(row) for row in rows]
        return {
            "count": len(data),
            "data": data
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
