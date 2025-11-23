from flask import Blueprint, jsonify
from models.checkout_model import user_history

users_bp = Blueprint("users", __name__)

@users_bp.route("/users/history/<int:user_id>")
def show_history(user_id):
    history = user_history(user_id)
    return jsonify([dict(row) for row in history])
