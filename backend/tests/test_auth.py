"""Integration tests for the auth flow (register / login / me)."""

from app.core.config import settings
from app.models.institution import Institution

PREFIX = settings.API_V1_PREFIX
AUTH = f"{PREFIX}/auth"


def register_seeker(client, email="jane@example.com", password="password123", full_name="Jane Doe"):
    return client.post(
        f"{AUTH}/register/seeker",
        json={"email": email, "password": password, "full_name": full_name},
    )


def login(client, email, password):
    # OAuth2 password flow: the email is sent in the `username` form field.
    return client.post(f"{AUTH}/login", data={"username": email, "password": password})


def test_health_endpoint(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_register_seeker_succeeds_unverified_without_institution(client):
    resp = register_seeker(client)
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "jane@example.com"
    assert body["role"] == "seeker"
    assert body["is_active"] is True
    # No matching institution -> not auto-verified.
    assert body["is_verified"] is False


def test_register_seeker_with_known_institution_is_auto_verified(client, db_session):
    db_session.add(
        Institution(name="Makerere University", email_domain="students.mak.ac.ug", is_active=True)
    )
    db_session.commit()

    resp = register_seeker(client, email="amos@students.mak.ac.ug")
    assert resp.status_code == 201
    assert resp.json()["is_verified"] is True


def test_register_employer_is_not_verified_until_admin(client):
    resp = client.post(
        f"{AUTH}/register/employer",
        json={"email": "hr@acme.io", "password": "password123", "company_name": "Acme"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["role"] == "employer"
    assert body["is_verified"] is False


def test_register_duplicate_email_conflicts(client):
    assert register_seeker(client).status_code == 201
    second = register_seeker(client)
    assert second.status_code == 409


def test_register_normalizes_email_case(client):
    assert register_seeker(client, email="MixedCase@Example.com").status_code == 201
    # The same address in different case is treated as already registered.
    assert register_seeker(client, email="mixedcase@example.com").status_code == 409


def test_register_rejects_short_password(client):
    resp = register_seeker(client, password="short")
    assert resp.status_code == 422


def test_login_returns_bearer_token_and_me_resolves_user(client):
    register_seeker(client, email="login@example.com")

    token_resp = login(client, "login@example.com", "password123")
    assert token_resp.status_code == 200
    token = token_resp.json()
    assert token["token_type"] == "bearer"
    assert token["access_token"]

    me = client.get(
        f"{AUTH}/me", headers={"Authorization": f"Bearer {token['access_token']}"}
    )
    assert me.status_code == 200
    assert me.json()["email"] == "login@example.com"


def test_login_with_wrong_password_is_unauthorized(client):
    register_seeker(client, email="wrong@example.com")
    resp = login(client, "wrong@example.com", "not-the-password")
    assert resp.status_code == 401


def test_login_unknown_user_is_unauthorized(client):
    resp = login(client, "ghost@example.com", "password123")
    assert resp.status_code == 401


def test_me_without_token_is_unauthorized(client):
    resp = client.get(f"{AUTH}/me")
    assert resp.status_code == 401
