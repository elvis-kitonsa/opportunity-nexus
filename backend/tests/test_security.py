"""Unit tests for password hashing and JWT creation."""

from datetime import datetime, timedelta, timezone

import pytest
from jose import jwt

from app.core.config import settings
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)


def test_hash_is_not_plaintext_and_verifies():
    hashed = hash_password("s3cret-password")
    assert hashed != "s3cret-password"
    assert verify_password("s3cret-password", hashed) is True


def test_verify_rejects_wrong_password():
    hashed = hash_password("correct-horse")
    assert verify_password("wrong-horse", hashed) is False


def test_hash_is_salted_so_two_hashes_differ():
    assert hash_password("same") != hash_password("same")


def test_access_token_round_trips_subject():
    token = create_access_token(42)
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload["sub"] == "42"


def test_access_token_has_future_expiry():
    token = create_access_token("user", expires_minutes=30)
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
    assert exp > datetime.now(timezone.utc)
    assert exp <= datetime.now(timezone.utc) + timedelta(minutes=31)


def test_token_signed_with_other_secret_is_rejected():
    token = create_access_token(1)
    with pytest.raises(jwt.JWTError):
        jwt.decode(token, "a-different-secret", algorithms=[settings.ALGORITHM])
