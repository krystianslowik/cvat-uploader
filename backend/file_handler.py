import os
import zipfile

BASE_DATA_DIR = "/app/data"


def save_file(upload_dir, file):
    upload_path = os.path.join(BASE_DATA_DIR, "uploads", upload_dir)
    os.makedirs(upload_path, exist_ok=True)
    file_path = os.path.join(upload_path, file.filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    return file_path


def validate_and_extract(zip_path, extract_dir):
    extract_path = os.path.join(BASE_DATA_DIR, "extracted", extract_dir)
    if not zipfile.is_zipfile(zip_path):
        raise ValueError("Uploaded file is not a valid ZIP archive")

    os.makedirs(extract_path, exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(extract_path)

    # Ensure at least one .vsi file exists
    vsi_files = [f for f in os.listdir(extract_path) if f.endswith(".vsi")]
    if not vsi_files:
        raise ValueError("No .vsi files found in the ZIP archive")
