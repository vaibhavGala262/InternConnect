import os
from urllib.parse import quote

import httpx
from dotenv import load_dotenv


load_dotenv()


def _storage_config() -> tuple[str, str, str]:
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    bucket = os.getenv("SUPABASE_STORAGE_BUCKET", "")
    if not url or not key or not bucket:
        raise RuntimeError("Supabase Storage environment variables are not configured.")
    return url, key, bucket


def _object_url(path: str) -> str:
    url, _, bucket = _storage_config()
    return f"{url}/storage/v1/object/{quote(bucket, safe='')}/{quote(path, safe='/')}"


def upload_profile_image(path: str, content: bytes, content_type: str = "image/jpeg") -> None:
    _, key, _ = _storage_config()
    response = httpx.post(
        _object_url(path),
        content=content,
        headers={
            "Authorization": f"Bearer {key}",
            "apikey": key,
            "Content-Type": content_type,
            "x-upsert": "true",
            "cache-control": "3600",
        },
        timeout=60.0,
    )
    response.raise_for_status()


def download_profile_image(path: str) -> tuple[bytes, str]:
    _, key, _ = _storage_config()
    response = httpx.get(
        _object_url(path),
        headers={"Authorization": f"Bearer {key}", "apikey": key},
        timeout=60.0,
    )
    response.raise_for_status()
    return response.content, response.headers.get("content-type", "image/jpeg")
