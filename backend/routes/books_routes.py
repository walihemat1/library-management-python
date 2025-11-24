from flask import Blueprint, request, jsonify, session
from controllers.book_controllers import get_all_books, add_book, get_book, update_book, delete_book, set_availability
from controllers.checkout_controllers import checkout_book, return_book
from middleware.auth_middleware import login_required

books_bp = Blueprint("books_bp", __name__)

@books_bp.route("/books")
@login_required
def show_books():
    try:
        books = get_all_books()
        return jsonify([dict(row) for row in books]), 200
    
    except Exception as e:
        return jsonify({
            "message": "Something went wrong",
            "error": str(e)
        }), 500

@books_bp.route("/books/<int:book_id>", methods=["GET"])
def get_book_route(book_id):
    try:
        book = get_book(book_id)
        if book:
            book_dict = dict(book)
            return jsonify({"message": "Book retrieved", "data": book_dict}), 200
        else:
            return jsonify({"message": "Book not found"}), 404
    except Exception as e:
        return jsonify({"message": "Something went wrong", "error": str(e)}), 500

@books_bp.route("/books/add", methods=["POST"])
@login_required
def add_book_route():
    try:
        data = request.get_json()
        add_book(data["title"], data["author"], data["year"], data["language"])
        return jsonify({"message": "Book added"}), 201
        
    except KeyError as e:
        return jsonify({
            "message": f"Missing field: {str(e)}"
        }), 400
    
    except Exception as e:
        return jsonify({
            "message": "Something went wrong",
            "error": str(e)
        }), 500
    

@books_bp.route("/books/update/<int:book_id>", methods=["PUT"])
@login_required
def update_book_route(book_id):
    try:
        data = request.get_json()
        update_book(book_id, data["title"], data["author"], data["year"], data["language"])
        return jsonify({"message": "Book updated"}), 200
    
    except KeyError as e:
        return jsonify({
            "message": f"Missing field: {str(e)}"
        }), 401
    
    except Exception as e:
        return jsonify({
            "message": "Something went wrong",
            "error": str(e)
        }), 500
    
@books_bp.route("/books/delete/<int:book_id>", methods=["DELETE"])
@login_required
def delete_book_route(book_id):
    try:
        delete_book(book_id)
        return jsonify({"message": "Book deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@books_bp.route("/books/checkout/<int:book_id>", methods=["DELETE"])
@login_required
def checkout_book(book_id):
    try:
        user_id = session.get("user_id")
        checkout_book(user_id, book_id)
        set_availability(book_id, 0)
        return jsonify({"message": "Book checked out"}), 200
    
    except Exception as e:
        return jsonify({
            "message": "Something went wrong",
            "error": str(e)
        }), 500

@books_bp.route("/books/return/<int:entry_id>/<int:book_id>", methods=["POST"])
@login_required
def return_route(entry_id, book_id):
    try:
        return_book(entry_id, book_id)
        return jsonify({"message": "Book returned"}), 200
    
    except KeyError as e:
        return jsonify({
            "message": f"messing fields {str(e)}"
        }), 400
    
    except Exception as e:
        return jsonify({
            "message": "Something went wrong",
            "error": str(e)
        }), 500

