from database import get_connection
import datetime

def checkout_book(user_id, book_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO checkout_history (user_id, book_id, checkout_date)
        VALUES (?, ?, ?)
    """, (user_id, book_id, datetime.datetime.now().isoformat()))

    cur.execute("UPDATE books SET available = 0 WHERE id = ?", (book_id,))

    conn.commit()
    conn.close()

def return_book(entry_id, book_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE checkout_history
        SET return_date = ?
        WHERE id = ?
    """, (datetime.datetime.now().isoformat(), entry_id))

    cur.execute("UPDATE books SET available = 1 WHERE id = ?", (book_id,))

    conn.commit()
    conn.close()

def user_history(user_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT c.*, b.title
        FROM checkout_history c
        JOIN books b ON c.book_id = b.id
        WHERE c.user_id = ?
    """, (user_id,))
    rows = cur.fetchall()
    conn.close()
    return rows