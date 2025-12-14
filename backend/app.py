from flask import Flask
from flask_cors import CORS
from routes.books_routes import books_bp
from routes.users_routes import users_bp
import database


def create_app():
    app = Flask(__name__)

    app.secret_key = "supersecretkey"

    app.config.update(
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=False,
    )

    CORS(
        app,
        supports_credentials=True,
        origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    )

    database.init_db()

    # Register blueprints
    app.register_blueprint(books_bp)
    app.register_blueprint(users_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
