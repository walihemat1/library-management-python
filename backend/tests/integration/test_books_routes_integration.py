from controllers.users_controller import create_user, get_user_by_email
from controllers.book_controllers import add_book, get_all_books


def login_as(client, email, password):
    return client.post("/login", json={"email": email, "password": password})


def test_books_list_requires_login(client):
    r = client.get("/books")
    assert r.status_code == 401


def test_add_book_and_list(client, app):
    # create & login user
    create_user("M", "m@test.com", "pass123", "member")
    login_as(client, "m@test.com", "pass123")

    # add a book
    r = client.post(
        "/books/add",
        json={
            "title": "Clean Architecture",
            "author": "Robert C. Martin",
            "year": 2017,
            "language": "EN",
        },
    )
    assert r.status_code == 201

    # list books
    r2 = client.get("/books")
    assert r2.status_code == 200
    books = r2.get_json()
    assert len(books) == 1
    assert books[0]["title"] == "Clean Architecture"


def test_checkout_and_return_by_book_id(client):
    # setup user + login
    create_user("M", "m@test.com", "pass123", "member")
    client.post("/login", json={"email": "m@test.com", "password": "pass123"})

    # seed a book directly
    add_book("B1", "A1", 2020, "EN")
    book_id = get_all_books()[0]["id"]

    # checkout
    r = client.post(f"/books/checkout/{book_id}")
    assert r.status_code == 200

    # return via /books/return/<book_id>
    r2 = client.post(f"/books/return/{book_id}")
    assert r2.status_code == 200
    assert r2.get_json()["message"] == "Book returned"


def test_return_by_book_id_without_active_checkout(client):
    create_user("M", "m@test.com", "pass123", "member")
    client.post("/login", json={"email": "m@test.com", "password": "pass123"})

    add_book("B1", "A1", 2020, "EN")
    book_id = get_all_books()[0]["id"]

    r = client.post(f"/books/return/{book_id}")
    assert r.status_code == 400
    assert "No active checkout" in r.get_json()["message"]


def test_book_history_requires_admin(client):
    # member
    create_user("M", "m@test.com", "pass123", "member")
    client.post("/login", json={"email": "m@test.com", "password": "pass123"})

    add_book("B1", "A1", 2020, "EN")
    book_id = get_all_books()[0]["id"]

    r = client.get(f"/books/history/{book_id}")
    assert r.status_code == 403


def test_book_history_as_admin(client):
    # admin
    create_user("A", "admin@test.com", "pass123", "admin")
    client.post("/login", json={"email": "admin@test.com", "password": "pass123"})

    add_book("B1", "A1", 2020, "EN")
    book_id = get_all_books()[0]["id"]

    r = client.get(f"/books/history/{book_id}")
    assert r.status_code == 200
    assert isinstance(r.get_json(), list)
