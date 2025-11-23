from flask import Flask
from routes.books_routes import books_bp
from routes.users_routes import users_bp
from routes.auth_routes import auth_bp
import database

def create_app():
    app = Flask(__name__)
    app.secret_key = "supersecretkey"

    # Initialize the database / create tables if needed
    database.init_db()

    # Register blueprints
    app.register_blueprint(books_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(auth_bp)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
