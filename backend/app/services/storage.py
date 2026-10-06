import boto3
from botocore.config import Config
from app.config import get_settings

settings = get_settings()

def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.r2_endpoint,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )

def download_pdf_bytes(r2_key: str) -> bytes:
    """Download raw PDF bytes from Cloudflare R2 bucket."""
    s3 = get_s3_client()
    response = s3.get_object(Bucket=settings.R2_BUCKET_NAME, Key=r2_key)
    return response["Body"].read()

def delete_r2_object(r2_key: str) -> None:
    """Permanently delete an object from Cloudflare R2 bucket."""
    try:
        s3 = get_s3_client()
        s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=r2_key)
    except Exception as e:
        print(f"[delete_r2_object] Error deleting key {r2_key}: {e}")
