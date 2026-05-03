from pathlib import Path
import shutil
import uuid

from app.config import settings


async def save_file(file_data: bytes, subdir: str, filename: str | None = None) -> str:
    """Save a file to local storage and return the relative path."""
    if filename is None:
        filename = f"{uuid.uuid4().hex}"

    dest_dir = Path(settings.storage_path) / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / filename
    dest_path.write_bytes(file_data)
    return f"/storage/{subdir}/{filename}"


async def delete_file(relative_path: str) -> bool:
    """Delete a file from local storage. Returns True if deleted."""
    # relative_path looks like /storage/photos/abc.jpg
    full_path = Path(settings.storage_path) / relative_path.replace("/storage/", "")
    if full_path.exists():
        full_path.unlink()
        return True
    return False


def get_file_url(relative_path: str) -> str:
    """Return the full URL path for a stored file."""
    return relative_path