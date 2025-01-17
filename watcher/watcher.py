import os
import subprocess
import time
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from database import get_session, Upload
import re

# Constants
UPLOADS_DIR = "/watcher/data/extracted"
OUTPUT_DIR = "/watcher/data/processed"
BFPATH = "/watcher/VSItoPNG/bftools"
HEAP_SIZE = "8G"
LOG_DIR = "/watcher/VSItoPNG/logs"
LOG_FILE = os.path.join(LOG_DIR, "bfconvert.log")


def log_debug(message):
    """Prints debug messages with a timestamp."""
    print(f"[DEBUG] {datetime.utcnow()} - {message}")


def process_vsi(job):
    """Processes a single job with VSI files."""
    job_id = job.id
    job_upload_dir = os.path.join(UPLOADS_DIR, job_id)
    job_output_dir = os.path.join(OUTPUT_DIR, job_id)

    log_debug(f"Ensuring directories exist for job {job_id}")
    os.makedirs(job_output_dir, exist_ok=True)
    os.makedirs(LOG_DIR, exist_ok=True)

    session = get_session()
    try:
        # Attach job to the active session
        job = session.merge(job)

        log_debug(f"Updating status to 'Processing' for job {job_id}")
        job.status = "Processing"
        session.commit()

        vsi_files = [f for f in os.listdir(job_upload_dir) if f.endswith(".vsi")]
        if not vsi_files:
            log_debug(f"No VSI files found for job {job_id} in {job_upload_dir}")
            raise FileNotFoundError(f"No VSI files found for job {job_id} in {job_upload_dir}")

        for vsi_file in vsi_files:
            vsi_path = os.path.join(job_upload_dir, vsi_file)
            log_debug(f"Processing file: {vsi_path}")

            log_debug(f"Attempting to extract relevant series for file: {vsi_path}")
            relevant_series = extract_relevant_series(vsi_path)
            log_debug(f"Relevant series for {vsi_path}: {relevant_series}")

            for series, width, height in relevant_series:
                output_file = os.path.join(
                    job_output_dir, f"{os.path.basename(vsi_file)}_series_{series}.png"
                )
                log_debug(f"Exporting series {series} to {output_file}")
                export_series(vsi_path, series, output_file)

        log_debug(f"Job {job_id} processed successfully. Updating status to 'Completed'")
        job.status = "Completed"
        job.updated_at = datetime.utcnow()
    except Exception as e:
        log_debug(f"Error processing job {job_id}: {str(e)}")
        job.status = "Failed"
        job.error_message = str(e)
    finally:
        session.commit()
        session.close()

def extract_relevant_series(vsi_path):
    """Extracts relevant series metadata from a VSI file."""
    try:
        log_debug(f"Running ImageInfo command for {vsi_path}")
        result = subprocess.run(
            [
                "java",
                "-Djava.awt.headless=true",
                "-Xmx8G",
                "-cp",
                f"{BFPATH}/bioformats_package.jar:{BFPATH}/log4j.jar",
                "loci.formats.tools.ImageInfo",
                "-nopix",
                vsi_path,
            ],
            capture_output=True,
            text=True,
            check=True,
            timeout=20,
        )
        log_debug(f"ImageInfo stderr:\n{result.stderr}")

        series = -1
        relevant_series = []
        width, height = 0, 0

        for line in result.stdout.splitlines():
            if line.startswith("Series #"):
                series += 1
                width, height = 0, 0
                log_debug(f"Started new series: {series}")

            if "Width =" in line:
                try:
                    width = int(line.split("= ")[1].strip())
                    log_debug(f"Parsed width for Series {series}: {width}")
                except (IndexError, ValueError) as e:
                    log_debug(f"Failed to parse width in line: {line} (Error: {e})")

            if "Height =" in line:
                try:
                    height = int(line.split("= ")[1].strip())
                    log_debug(f"Parsed height for Series {series}: {height}")
                except (IndexError, ValueError) as e:
                    log_debug(f"Failed to parse height in line: {line} (Error: {e})")

                if width > 0 and height > 0:
                    log_debug(f"Series {series}: Checking dimensions (Width: {width}, Height: {height})")
                    if width >= 7000 and height >= 5000:
                        relevant_series.append((series, width, height))
                        log_debug(f"Series {series} is relevant and added to the list.")

        if not relevant_series:
            log_debug(f"No relevant series found in {vsi_path}")
        else:
            log_debug(f"Relevant series for {vsi_path}: {relevant_series}")

        return relevant_series
    except Exception as e:
        log_debug(f"Error extracting series for {vsi_path}: {str(e)}")
        raise


def export_series(vsi_path, series, output_file):
    """Exports a single series as a PNG file."""
    try:
        log_debug(f"Running ImageConverter for series {series} of {vsi_path}")
        subprocess.run(
            [
                "xvfb-run", "-a",
                "java",
                "-Xmx8G",
                "-cp",
                f"{BFPATH}/bioformats_package.jar:{BFPATH}/log4j.jar",
                "loci.formats.tools.ImageConverter",
                "-series",
                str(series),
                vsi_path,
                output_file,
            ],
            check=True,
            stdout=open(LOG_FILE, "a"),
            stderr=subprocess.STDOUT,
        )
        log_debug(f"Exported series {series} to {output_file}")
    except subprocess.CalledProcessError as e:
        log_debug(f"Error exporting series {series} for {vsi_path}: {e.stderr}")
        raise


def poll_database():
    """Polls the database for new jobs to process."""
    log_debug("Starting watcher service...")
    while True:
        session = get_session()
        try:
            jobs = session.query(Upload).filter_by(status="Uploaded").all()
            if not jobs:
                log_debug("No jobs with status 'Uploaded' found.")
            for job in jobs:
                log_debug(f"Processing job: {job.id}")
                process_vsi(job)
        except Exception as e:
            log_debug(f"Error querying the database: {str(e)}")
        finally:
            session.close()

        time.sleep(10)  # Poll every 10 seconds


if __name__ == "__main__":
    poll_database()