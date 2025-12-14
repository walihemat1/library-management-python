from flask import Blueprint, jsonify, request, session
from controllers.checkout_controllers import user_history
from controllers.users_controller import (
    create_user,
    get_user_by_email,
    validate_user,
    get_user_by_id,
    get_all_users,
    set_user_active,
    update_user_role,
    update_my_profile,
    change_my_password,
    admin_dashboard_data,
)
from middleware.auth_middleware import login_required, require_role
from controllers.users_controller import set_user_password
from controllers.checkout_controllers import all_history


users_bp = Blueprint("users", __name__)


@users_bp.route("/me", methods=["GET"])
@login_required
def me():
    user_id = session.get("user_id")
    user = get_user_by_id(user_id)

    # if DB not migrated, is_active might not exist
    try:
        is_active = user["is_active"]
    except Exception:
        is_active = 1

    return (
        jsonify(
            {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "is_active": is_active,
            }
        ),
        200,
    )


@users_bp.route("/users/history/<int:user_id>", methods=["GET"])
@login_required
def show_history(user_id):
    current_user_id = session.get("user_id")
    role = session.get("user_role")

    if role != "admin" and user_id != current_user_id:
        return jsonify({"message": "Forbidden"}), 403

    history = user_history(user_id)
    return jsonify([dict(row) for row in history]), 200


@users_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        if get_user_by_email(email):
            return jsonify({"message": "Email already registered"}), 400

        create_user(name, email, password, role)
        return jsonify({"message": "User registered"}), 201

    except Exception as e:
        return jsonify({"message": "Error", "error": str(e)}), 500


@users_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = validate_user(email, password)

    if user == "deactivated":
        return jsonify({"message": "Account is deactivated. Contact admin."}), 403

    if not user:
        return jsonify({"message": "Invalid email or password"}), 401

    session["user_id"] = user["id"]
    session["user_role"] = user["role"]

    # safe is_active (may not exist pre-migration)
    try:
        is_active = user["is_active"]
    except Exception:
        is_active = 1

    return (
        jsonify(
            {
                "message": "Login successful",
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                    "is_active": is_active,
                },
            }
        ),
        200,
    )


@users_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200


# ===================== ADMIN USER MANAGEMENT =====================


@users_bp.route("/admin/users", methods=["GET"])
@login_required
@require_role("admin")
def admin_list_users():
    users = get_all_users()
    return jsonify([dict(u) for u in users]), 200


@users_bp.route("/admin/users", methods=["POST"])
@login_required
@require_role("admin")
def admin_create_user():
    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role") or "member"

        if not name or not email or not password:
            return jsonify({"message": "Missing required fields"}), 400

        if get_user_by_email(email):
            return jsonify({"message": "Email already registered"}), 400

        create_user(name, email, password, role)
        return jsonify({"message": "User created"}), 201

    except Exception as e:
        return jsonify({"message": "Error", "error": str(e)}), 500


@users_bp.route("/admin/users/<int:user_id>/role", methods=["PUT"])
@login_required
@require_role("admin")
def admin_update_role(user_id):
    try:
        data = request.get_json()
        role = data.get("role")

        if role not in ["admin", "librarian", "member"]:
            return jsonify({"message": "Invalid role"}), 400

        update_user_role(user_id, role)

        if session.get("user_id") == user_id:
            session["user_role"] = role

        return jsonify({"message": "Role updated"}), 200

    except Exception as e:
        return jsonify({"message": "Error", "error": str(e)}), 500


@users_bp.route("/admin/users/<int:user_id>/status", methods=["PUT"])
@login_required
@require_role("admin")
def admin_update_status(user_id):
    try:
        data = request.get_json()
        is_active = bool(data.get("is_active"))

        # NOTE: this requires DB migration (is_active column)
        set_user_active(user_id, is_active)

        if session.get("user_id") == user_id and not is_active:
            session.clear()

        return jsonify({"message": "Status updated"}), 200

    except Exception as e:
        return jsonify({"message": "Error", "error": str(e)}), 500


@users_bp.route("/admin/users/<int:user_id>/password", methods=["PUT"])
@login_required
@require_role("admin")
def admin_reset_password(user_id):
    data = request.get_json()
    password = data.get("password")
    if not password or len(password) < 4:
        return jsonify({"message": "Password too short"}), 400

    set_user_password(user_id, password)
    return jsonify({"message": "Password reset"}), 200


@users_bp.route("/admin/history", methods=["GET"])
@login_required
@require_role("admin")
def admin_all_history():
    rows = all_history()
    return jsonify([dict(r) for r in rows]), 200


# UPDATE PROFILE (self)
@users_bp.route("/me", methods=["PUT"])
@login_required
def update_me():
    user_id = session.get("user_id")
    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()

    if not name or not email:
        return jsonify({"message": "Name and email are required"}), 400

    result = update_my_profile(user_id, name, email)
    if result == "email_taken":
        return jsonify({"message": "Email already in use"}), 400

    user = get_user_by_id(user_id)

    # sqlite3.Row -> no .get()
    try:
        is_active = user["is_active"]
    except Exception:
        is_active = 1

    return (
        jsonify(
            {
                "message": "Profile updated",
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                    "is_active": is_active,
                },
            }
        ),
        200,
    )


# CHANGE PASSWORD (self)
@users_bp.route("/me/password", methods=["PUT"])
@login_required
def update_my_password():
    user_id = session.get("user_id")
    data = request.get_json() or {}

    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""

    if len(new_password) < 4:
        return jsonify({"message": "New password too short"}), 400

    result = change_my_password(user_id, current_password, new_password)
    if result == "wrong_current":
        return jsonify({"message": "Current password is incorrect"}), 400
    if result == "not_found":
        return jsonify({"message": "User not found"}), 404

    return jsonify({"message": "Password updated"}), 200


@users_bp.route("/admin/dashboard", methods=["GET"])
@login_required
@require_role("admin")
def admin_dashboard():
    try:
        return jsonify(admin_dashboard_data()), 200
    except Exception as e:
        return jsonify({"message": "Something went wrong", "error": str(e)}), 500
