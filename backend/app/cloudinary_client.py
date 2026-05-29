import os
from pathlib import Path
from typing import BinaryIO

import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

def configure_cloudinary():
    cloud_name = (os.getenv('CLOUDINARY_CLOUD_NAME') or "").strip()
    api_key = (os.getenv('CLOUDINARY_API_KEY') or "").strip()
    api_secret = (os.getenv('CLOUDINARY_API_SECRET') or "").strip()
    if not all([cloud_name, api_key, api_secret]):
        raise RuntimeError('Cloudinary credentials are not set in environment variables')
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )

def upload_module_video(file_obj: BinaryIO, filename: str) -> dict:
    configure_cloudinary()
    return cloudinary.uploader.upload_large(
        file_obj,
        resource_type="video",
        folder="learnflow/module-videos",
        public_id=Path(filename).stem,
        chunk_size=6_000_000,
        overwrite=False,
        use_filename=True,
        unique_filename=True,
    )
