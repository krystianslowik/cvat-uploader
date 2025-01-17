from fastapi import FastAPI, UploadFile, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

import logging
from uuid import uuid4
from typing import List, Optional
from database import init_db, get_session, Upload
from file_handler import save_file, validate_and_extract
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - [%(levelname)s] - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to restrict origins if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
# Initialize the database
init_db()

@app.post("/api/upload")
async def upload_file(file: UploadFile):
    """Endpoint to upload a ZIP file."""
    job_id = str(uuid4())
    session = get_session()

    try:
        logging.debug(f"Received file upload request. Job ID: {job_id}, Filename: {file.filename}")

        # Step 1: Save the uploaded file
        try:
            zip_path = save_file(job_id, file)
            logging.debug(f"File saved at {zip_path}")
        except Exception as e:
            logging.debug(f"Error saving file: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

        # Step 2: Validate and extract the ZIP file
        try:
            validate_and_extract(zip_path, job_id)
            logging.debug(f"File validated and extracted successfully for Job ID: {job_id}")
        except Exception as ve:
            logging.debug(f"Validation failed: {str(ve)}")
            # Validation failed, update status to Failed
            upload = Upload(
                id=job_id,
                filename=file.filename,
                status="Failed",
                error_message=f"Validation Error: {str(ve)}"
            )
            session.add(upload)
            session.commit()
            raise HTTPException(status_code=400, detail=f"Validation Error: {str(ve)}")

        # Step 3: Create a database record for the upload with status 'Uploaded'
        upload = Upload(
            id=job_id,
            filename=file.filename,
            status="Uploaded"
        )
        session.add(upload)
        session.commit()

        logging.debug(f"Job {job_id} uploaded successfully")
        return {"job_id": job_id, "message": "Upload successful"}
    except HTTPException as e:
        session.rollback()
        logging.debug(f"HTTP Exception: {str(e.detail)}")
        raise e
    except Exception as e:
        session.rollback()
        logging.debug(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        session.close()

@app.get("/api/upload/{job_id}/status")
async def get_upload_status(job_id: str):
    """Endpoint to retrieve the status of a specific upload."""
    session = get_session()
    try:
        upload = session.query(Upload).filter_by(id=job_id).first()
        if not upload:
            raise HTTPException(status_code=404, detail="Job ID not found")
        return {
            "job_id": upload.id,
            "status": upload.status,
            "error_message": upload.error_message,
            "created_at": upload.created_at,
            "updated_at": upload.updated_at,
        }
    finally:
        session.close()

@app.get("/api/uploads")
async def list_uploads(
    status: Optional[str] = Query(None, description="Filter uploads by status"),
    page: Optional[int] = Query(1, description="Page number"),
    limit: Optional[int] = Query(10, description="Number of items per page")
):
    """Endpoint to list all uploads."""
    session = get_session()
    try:
        query = session.query(Upload)
        if status:
            query = query.filter_by(status=status)

        total_count = query.count()
        uploads = query.offset((page - 1) * limit).limit(limit).all()

        results = [
            {
                "job_id": upload.id,
                "filename": upload.filename,
                "status": upload.status,
                "created_at": upload.created_at,
                "updated_at": upload.updated_at,
            }
            for upload in uploads
        ]

        return {
            "total": total_count,
            "page": page,
            "limit": limit,
            "uploads": results,
        }
    finally:
        session.close()