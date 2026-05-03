import pytest
from app.services.auth_service import hash_password, verify_password, create_access_token, decode_access_token


def test_hash_password():
    hashed = hash_password("testpassword123")
    assert hashed != "testpassword123"
    assert verify_password("testpassword123", hashed)


def test_verify_password_wrong():
    hashed = hash_password("testpassword123")
    assert not verify_password("wrongpassword", hashed)


def test_create_and_decode_token():
    token = create_access_token("test-user-id")
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "test-user-id"


def test_decode_invalid_token():
    payload = decode_access_token("invalid-token")
    assert payload is None


def test_decode_expired_token():
    from app.services.auth_service import jwt, settings
    from datetime import datetime, timedelta, timezone
    expire = datetime.now(timezone.utc) - timedelta(hours=1)
    payload = {"sub": "test-user-id", "exp": expire}
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    result = decode_access_token(token)
    assert result is None