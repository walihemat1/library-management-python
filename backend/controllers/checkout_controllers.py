from database import get_connection
import datetime


def get_open_checkout_entry(user_id, book_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id FROM checkout_history
        WHERE user_id = ? AND book_id = ?
          AND return_date IS NULL
        ORDER BY id DESC
        LIMIT 1
    """,
        (user_id, book_id),
    )
    row = cur.fetchone()
    conn.close()
    return row["id"] if row else None


def checkout_book(user_id, book_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO checkout_history (user_id, book_id, checkout_date)
        VALUES (?, ?, ?)
    """,
        (user_id, book_id, datetime.datetime.now().isoformat()),
    )

    cur.execute("UPDATE books SET available = 0 WHERE id = ?", (book_id,))

    conn.commit()
    conn.close()


def return_book(entry_id, book_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        UPDATE checkout_history
        SET return_date = ?
        WHERE id = ?
    """,
        (datetime.datetime.now().isoformat(), entry_id),
    )

    cur.execute("UPDATE books SET available = 1 WHERE id = ?", (book_id,))

    conn.commit()
    conn.close()


def user_history(user_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT c.*, b.title
        FROM checkout_history c
        JOIN books b ON c.book_id = b.id
        WHERE c.user_id = ?
    """,
        (user_id,),
    )
    rows = cur.fetchall()
    conn.close()
    return rows


def book_history(book_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT
            c.id,
            c.user_id,
            u.name AS user_name,
            u.email AS email,
            c.book_id,
            b.title AS book_title,
            c.checkout_date,
            c.return_date
        FROM checkout_history c
        JOIN users u ON c.user_id = u.id
        JOIN books b ON c.book_id = b.id
        WHERE c.book_id = ?
        ORDER BY c.checkout_date DESC
    """,
        (book_id,),
    )
    rows = cur.fetchall()
    conn.close()
    return rows


def all_history():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT
            c.id,
            c.user_id,
            u.name AS user_name,
            u.email AS email,
            c.book_id,
            b.title AS book_title,
            c.checkout_date,
            c.return_date
        FROM checkout_history c
        JOIN users u ON c.user_id = u.id
        JOIN books b ON c.book_id = b.id
        ORDER BY c.checkout_date DESC
    """
    )
    rows = cur.fetchall()
    conn.close()
    return rows
