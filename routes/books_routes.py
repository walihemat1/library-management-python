from flask import Blueprint, request, jsonify, session
from models.books_model import get_all_books, add_book, get_book, update_book, set_availability
from models.checkout_model import checkout_book, return_book

books_bp = Blueprint("books", __name__)

@books_bp.route("/books")
def show_books():
    books = get_all_books()
    return jsonify([dict(row) for row in books])

@books_bp.route("/books/add", methods=["POST"])
def add_book_route():
    data = request.form
    add_book(data["title"], data["author"], data["year"], data["language"])
    return jsonify({"message": "Book added"})

@books_bp.route("/books/update/<int:book_id>", methods=["POST"])
def update_book_route(book_id):
    data = request.form
    update_book(book_id, data["title"], data["author"], data["year"], data["language"])
    return jsonify({"message": "Book updated"})

@books_bp.route("/books/checkout/<int:book_id>", methods=["POST"])
def checkout(book_id):
    user_id = session.get("user_id")
    checkout_book(user_id, book_id)
    set_availability(book_id, 0)
    return jsonify({"message": "Book checked out"})

@books_bp.route("/books/return/<int:entry_id>/<int:book_id>", methods=["POST"])
def return_route(entry_id, book_id):
    return_book(entry_id, book_id)
    return jsonify({"message": "Book returned"})
