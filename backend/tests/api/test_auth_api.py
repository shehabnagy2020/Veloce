import pytest


async def test_register_new_user(client):
    response = await client.post("/api/v1/auth/register", json={
        "email": "newuser@test.com",
        "password": "testpassword123",
        "display_name": "Test User",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data


async def test_register_duplicate_email(client):
    await client.post("/api/v1/auth/register", json={
        "email": "dupuser@test.com",
        "password": "testpassword123",
        "display_name": "First User",
    })
    response = await client.post("/api/v1/auth/register", json={
        "email": "dupuser@test.com",
        "password": "testpassword456",
        "display_name": "Second User",
    })
    assert response.status_code == 400


async def test_login_success(client):
    await client.post("/api/v1/auth/register", json={
        "email": "loginuser@test.com",
        "password": "testpassword123",
        "display_name": "Login User",
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "loginuser@test.com",
        "password": "testpassword123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


async def test_login_invalid_credentials(client):
    response = await client.post("/api/v1/auth/login", json={
        "email": "nonexistent@test.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


async def test_get_me_authenticated(client):
    register_resp = await client.post("/api/v1/auth/register", json={
        "email": "meuser@test.com",
        "password": "testpassword123",
        "display_name": "Me User",
    })
    token = register_resp.json()["access_token"]
    response = await client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {token}",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "meuser@test.com"


async def test_get_me_unauthenticated(client):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code in (401, 403)