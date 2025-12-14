# tests/integration/test_users_routes_integration.py
from controllers.users_controller import get_user_by_email


def test_register_then_login(client):
    # register
    r = client.post(
        "/register",
        json={
            "name": "Ali",
            "email": "ali@test.com",
            "password": "pass123",
            "role": "member",
        },
    )
    assert r.status_code == 201

    # login
    r2 = client.post("/login", json={"email": "ali@test.com", "password": "pass123"})
    assert r2.status_code == 200
    data = r2.get_json()
    assert data["message"] == "Login successful"
    assert data["user"]["email"] == "ali@test.com"


def test_me_requires_login(client):
    r = client.get("/me")
    assert r.status_code == 401


def test_me_after_login(client):
    client.post(
        "/register",
        json={
            "name": "Ali",
            "email": "ali@test.com",
            "password": "pass123",
            "role": "member",
        },
    )
    client.post("/login", json={"email": "ali@test.com", "password": "pass123"})

    r = client.get("/me")
    assert r.status_code == 200
    assert r.get_json()["email"] == "ali@test.com"


def test_admin_forbidden_for_member(client):
    client.post(
        "/register",
        json={
            "name": "M",
            "email": "m@test.com",
            "password": "pass123",
            "role": "member",
        },
    )
    client.post("/login", json={"email": "m@test.com", "password": "pass123"})

    r = client.get("/admin/users")
    assert r.status_code == 403


def test_admin_can_list_users(client):
    # create an admin
    client.post(
        "/register",
        json={
            "name": "Admin",
            "email": "admin@test.com",
            "password": "pass123",
            "role": "admin",
        },
    )
    client.post("/login", json={"email": "admin@test.com", "password": "pass123"})

    r = client.get("/admin/users")
    assert r.status_code == 200
    assert isinstance(r.get_json(), list)
