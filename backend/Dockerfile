# Step 1: Use an official Python base image
FROM python:3.11-slim

# Step 2: Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Step 3: Set working directory
WORKDIR /app

# Step 4: Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Step 5: Copy dependencies
COPY requirements.txt /app/

# Step 6: Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Step 7: Copy the application code
COPY . /app/

# Step 8: Expose port for FastAPI
EXPOSE 8000

# Step 9: Command to run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
