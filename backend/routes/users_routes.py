from flask import Blueprint, jsonify, request, session
from controllers.checkout_controllers import user_history
from controllers.users_controller import create_user, get_user_by_email, validate_user

users_bp = Blueprint("users", __name__)

@users_bp.route("/users/history/<int:user_id>")
def show_history(user_id):
    history = user_history(user_id)
    return jsonify([dict(row) for row in history])


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
    if not user:
        return jsonify({"message": "Invalid email or password"}), 401

    # Store user info in signed cookie
    session["user_id"] = user["id"]
    session["user_role"] = user["role"]

    return jsonify({"message": "Login successful"}), 200


@users_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200


