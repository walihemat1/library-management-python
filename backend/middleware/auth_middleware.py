from functools import wraps
from flask import jsonify, session
from controllers.users_controller import get_user_by_id


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"message": "Unauthorized"}), 401

        user = get_user_by_id(user_id)
        if not user:
            session.clear()
            return jsonify({"message": "Unauthorized"}), 401

        # Handle missing is_active column safely (until you migrate DB)
        try:
            is_active = int(user["is_active"])
        except Exception:
            is_active = 1

        if is_active != 1:
            session.clear()
            return jsonify({"message": "Account is deactivated"}), 403

        return fn(*args, **kwargs)

    return wrapper


def require_role(role):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if session.get("user_role") != role:
                return jsonify({"message": "Forbidden"}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator
