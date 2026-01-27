FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

WORKDIR /app

# Increase timeout for slow connections
ENV UV_HTTP_TIMEOUT=300

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

# Copy only the backend folder
COPY backend ./backend

EXPOSE 8000

# Just start the API
CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
