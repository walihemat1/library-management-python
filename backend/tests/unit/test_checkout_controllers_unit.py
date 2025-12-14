from controllers.users_controller import create_user, get_user_by_email
from controllers.book_controllers import add_book, get_all_books, get_book
from controllers.checkout_controllers import (
    checkout_book,
    return_book,
    get_open_checkout_entry,
    user_history,
    book_history,
    all_history,
)


def test_checkout_and_return_flow(app):
    create_user("U", "u@test.com", "pass", "member")
    user = get_user_by_email("u@test.com")

    add_book("B1", "A1", 2020, "EN")
    book = get_all_books()[0]

    # checkout
    checkout_book(user["id"], book["id"])
    assert get_book(book["id"])["available"] == 0

    entry_id = get_open_checkout_entry(user["id"], book["id"])
    assert entry_id is not None

    # return
    return_book(entry_id, book["id"])
    assert get_book(book["id"])["available"] == 1

    # now no open entry
    assert get_open_checkout_entry(user["id"], book["id"]) is None


def test_user_history_and_all_history(app):
    create_user("U", "u@test.com", "pass", "member")
    user = get_user_by_email("u@test.com")

    add_book("B1", "A1", 2020, "EN")
    book = get_all_books()[0]

    checkout_book(user["id"], book["id"])

    uh = user_history(user["id"])
    assert len(uh) == 1
    assert uh[0]["title"] == "B1"

    ah = all_history()
    assert len(ah) == 1
    assert ah[0]["book_title"] == "B1"
    assert ah[0]["user_name"] == "U"


def test_book_history(app):
    create_user("U", "u@test.com", "pass", "member")
    user = get_user_by_email("u@test.com")

    add_book("B1", "A1", 2020, "EN")
    book = get_all_books()[0]

    checkout_book(user["id"], book["id"])
    bh = book_history(book["id"])

    assert len(bh) == 1
    assert bh[0]["book_id"] == book["id"]
    assert bh[0]["book_title"] == "B1"
    assert bh[0]["user_id"] == user["id"]
