# tests/unit/test_users_controller_unit.py
import database
from controllers.users_controller import (
    hash_password,
    create_user,
    get_user_by_email,
    validate_user,
    update_my_profile,
    change_my_password,
)


def test_hash_password_is_sha256():
    h1 = hash_password("abc")
    h2 = hash_password("abc")
    assert h1 == h2
    assert len(h1) == 64


def test_validate_user_success(app):
    create_user("A", "a@test.com", "pass123", "member")
    user = validate_user("a@test.com", "pass123")
    assert user is not None
    assert user["email"] == "a@test.com"


def test_validate_user_wrong_password(app):
    create_user("A", "a@test.com", "pass123", "member")
    user = validate_user("a@test.com", "wrong")
    assert user is None


def test_update_my_profile_email_taken(app):
    create_user("U1", "u1@test.com", "p", "member")
    create_user("U2", "u2@test.com", "p", "member")

    # get id for u2
    u2 = get_user_by_email("u2@test.com")
    result = update_my_profile(u2["id"], "U2", "u1@test.com")  # conflict
    assert result == "email_taken"


def test_update_my_profile_success(app):
    create_user("U1", "u1@test.com", "p", "member")
    u1 = get_user_by_email("u1@test.com")

    result = update_my_profile(u1["id"], "New Name", "new@test.com")
    assert result is True

    updated = get_user_by_email("new@test.com")
    assert updated["name"] == "New Name"


def test_change_my_password_wrong_current(app):
    create_user("U1", "u1@test.com", "oldpass", "member")
    u1 = get_user_by_email("u1@test.com")

    result = change_my_password(u1["id"], "bad", "newpass")
    assert result == "wrong_current"


def test_change_my_password_success(app):
    create_user("U1", "u1@test.com", "oldpass", "member")
    u1 = get_user_by_email("u1@test.com")

    result = change_my_password(u1["id"], "oldpass", "newpass")
    assert result is True

    user = validate_user("u1@test.com", "newpass")
    assert user is not None
