from fastapi import APIRouter, HTTPException

from backend.app.db.session import get_db_connection

router = APIRouter()


@router.get("/data")
async def get_integrated_data():
    """
    Returns all integrated agrifood data from the SQLite database.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM integrated_data")
        rows = cursor.fetchall()
        data = [dict(row) for row in rows]
        return {"count": len(data), "data": data}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        conn.close()
