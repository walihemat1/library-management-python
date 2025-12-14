from controllers.book_controllers import (
    add_book,
    get_all_books,
    get_book,
    update_book,
    delete_book,
    set_availability,
)


def test_add_and_get_book(app):
    add_book("Clean Code", "Robert C. Martin", 2008, "EN")
    books = get_all_books()
    assert len(books) == 1
    assert books[0]["title"] == "Clean Code"

    book_id = books[0]["id"]
    b = get_book(book_id)
    assert b["author"] == "Robert C. Martin"
    assert b["available"] == 1


def test_update_book(app):
    add_book("Old", "A", 1999, "EN")
    b = get_all_books()[0]
    book_id = b["id"]

    update_book(book_id, "New", "B", 2000, "FR")
    updated = get_book(book_id)
    assert updated["title"] == "New"
    assert updated["author"] == "B"
    assert updated["year"] == 2000
    assert updated["language"] == "FR"


def test_set_availability(app):
    add_book("Book", "Auth", 2020, "EN")
    book_id = get_all_books()[0]["id"]

    set_availability(book_id, 0)
    assert get_book(book_id)["available"] == 0

    set_availability(book_id, 1)
    assert get_book(book_id)["available"] == 1


def test_delete_book(app):
    add_book("To Delete", "Auth", 2020, "EN")
    book_id = get_all_books()[0]["id"]

    delete_book(book_id)
    assert get_book(book_id) is None
    assert get_all_books() == []
