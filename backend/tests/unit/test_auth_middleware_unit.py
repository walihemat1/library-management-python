# tests/unit/test_auth_middleware_unit.py
from flask import Blueprint, jsonify, session
from middleware.auth_middleware import login_required

bp = Blueprint("t", __name__)


@bp.route("/protected")
@login_required
def protected():
    return jsonify({"ok": True}), 200


def test_login_required_unauthorized(app):
    app.register_blueprint(bp, url_prefix="/t")
    client = app.test_client()

    resp = client.get("/t/protected")
    assert resp.status_code == 401
    assert resp.get_json()["message"] == "Unauthorized"


def test_login_required_authorized(app):
    app.register_blueprint(bp, url_prefix="/t")
    client = app.test_client()

    # create a user in DB through your controller
    from controllers.users_controller import create_user, get_user_by_email

    create_user("X", "x@test.com", "pass", "member")
    user = get_user_by_email("x@test.com")

    with client.session_transaction() as s:
        s["user_id"] = user["id"]
        s["user_role"] = user["role"]

    resp = client.get("/t/protected")
    assert resp.status_code == 200
    assert resp.get_json()["ok"] is True
