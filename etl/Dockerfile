FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

WORKDIR /app

# Increase timeout for slow connections
ENV UV_HTTP_TIMEOUT=300

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

# Copy only necessary folders
COPY etl ./etl
COPY data/raw ./data/raw

# Run the ETL script
CMD ["uv", "run", "python", "etl/data_preparation.py"]
