import pytest
import asyncio
from pathlib import Path
import tempfile
import os

from app.services.storage_service import save_file, delete_file, get_file_url


@pytest.fixture
def temp_storage(tmp_path):
    storage_dir = tmp_path / "storage"
    storage_dir.mkdir()
    (storage_dir / "photos").mkdir()
    (storage_dir / "voice_notes").mkdir()
    (storage_dir / "documents").mkdir()

    original = os.environ.get("STORAGE_PATH")
    os.environ["STORAGE_PATH"] = str(storage_dir)
    from app.config import Settings
    from app import config
    config.settings = Settings(STORAGE_PATH=str(storage_dir))
    yield str(storage_dir)
    if original:
        os.environ["STORAGE_PATH"] = original
    else:
        os.environ.pop("STORAGE_PATH", None)


@pytest.mark.asyncio
async def test_save_file(temp_storage):
    content = b"test image data"
    url = await save_file(content, "photos", "test.jpg")
    assert "/storage/photos/test.jpg" == url
    file_path = Path(temp_storage) / "photos" / "test.jpg"
    assert file_path.exists()
    assert file_path.read_bytes() == content


@pytest.mark.asyncio
async def test_save_file_auto_name(temp_storage):
    content = b"test data"
    url = await save_file(content, "photos")
    assert "/storage/photos/" in url


@pytest.mark.asyncio
async def test_delete_file(temp_storage):
    content = b"test data"
    url = await save_file(content, "photos", "delete_test.jpg")
    deleted = await delete_file(url)
    assert deleted is True


@pytest.mark.asyncio
async def test_delete_nonexistent_file(temp_storage):
    deleted = await delete_file("/storage/photos/nonexistent.jpg")
    assert deleted is False


def test_get_file_url():
    url = get_file_url("/storage/photos/test.jpg")
    assert url == "/storage/photos/test.jpg"