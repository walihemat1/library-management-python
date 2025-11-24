from database import get_connection
import datetime

def get_all_books():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM books")
    rows = cur.fetchall()
    conn.close()
    return rows

def add_book(title, author, year, language):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO books (title, author, year, language, available)
        VALUES (?, ?, ?, ?, 1)
    """, (title, author, year, language))
    conn.commit()
    conn.close()

def get_book(book_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    row = cur.fetchone()
    conn.close()
    return row

def update_book(book_id, title, author, year, language):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE books
        SET title = ?, author = ?, year = ?, language = ?
        WHERE id = ?
    """, (title, author, year, language, book_id))
    conn.commit()
    conn.close()

def delete_book(book_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM books WHERE id = ?", (book_id,))
    conn.commit()
    conn.close()


def set_availability(book_id, available):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE books SET available = ? WHERE id = ?", (available, book_id))
    conn.commit()
    conn.close()
