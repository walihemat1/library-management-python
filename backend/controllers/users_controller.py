from database import get_connection
import hashlib
from datetime import datetime, timedelta


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def get_user_by_id(user_id):
    conn = get_connection()
    cur = conn.cursor()

    # If DB is not migrated yet, this SELECT may fail. Fallback safely.
    try:
        cur.execute(
            "SELECT id, name, email, role, is_active FROM users WHERE id = ?",
            (user_id,),
        )
    except Exception:
        cur.execute(
            "SELECT id, name, email, role FROM users WHERE id = ?",
            (user_id,),
        )

    row = cur.fetchone()
    conn.close()
    return row


def create_user(name, email, password, role):
    if not role:
        role = "member"

    conn = get_connection()
    cur = conn.cursor()

    # If DB isn't migrated yet, inserting is_active will fail. Fallback safely.
    try:
        cur.execute(
            """
            INSERT INTO users (name, email, password, role, is_active)
            VALUES (?, ?, ?, ?, 1)
            """,
            (name, email, hash_password(password), role),
        )
    except Exception:
        cur.execute(
            """
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
            """,
            (name, email, hash_password(password), role),
        )

    conn.commit()
    conn.close()


def get_user_by_email(email):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()
    return row


def validate_user(email, password):
    """
    returns:
      - sqlite3.Row user if ok
      - "deactivated" if user exists but inactive
      - None if invalid
    """
    user = get_user_by_email(email)
    if not user:
        return None

    # sqlite3.Row doesn't support .get(). Also handle missing is_active column.
    try:
        is_active = int(user["is_active"])
    except Exception:
        is_active = 1

    if is_active != 1:
        return "deactivated"

    if user["password"] == hash_password(password):
        return user

    return None


# ---------- ADMIN MANAGEMENT ----------


def get_all_users():
    conn = get_connection()
    cur = conn.cursor()

    # fallback if no is_active yet
    try:
        cur.execute(
            "SELECT id, name, email, role, is_active FROM users ORDER BY id DESC"
        )
    except Exception:
        cur.execute("SELECT id, name, email, role FROM users ORDER BY id DESC")

    rows = cur.fetchall()
    conn.close()
    return rows


def set_user_active(user_id, is_active):
    conn = get_connection()
    cur = conn.cursor()

    # if no is_active column, this will fail (requires migration)
    cur.execute(
        "UPDATE users SET is_active = ? WHERE id = ?",
        (1 if is_active else 0, user_id),
    )
    conn.commit()
    conn.close()


def update_user_role(user_id, role):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE users SET role = ? WHERE id = ?", (role, user_id))
    conn.commit()
    conn.close()


def set_user_password(user_id, password):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE users SET password = ? WHERE id = ?", (hash_password(password), user_id)
    )
    conn.commit()
    conn.close()


def update_my_profile(user_id, name, email):
    """
    Update logged-in user's name/email.
    - email must be unique (excluding yourself)
    """
    conn = get_connection()
    cur = conn.cursor()

    # email conflict?
    cur.execute("SELECT id FROM users WHERE email = ? AND id != ?", (email, user_id))
    conflict = cur.fetchone()
    if conflict:
        conn.close()
        return "email_taken"

    cur.execute(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        (name, email, user_id),
    )
    conn.commit()
    conn.close()
    return True


# ===================== CHANGE PASSWORD =====================


def change_my_password(user_id, current_password, new_password):
    """
    Change password only if current_password matches.
    """
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT password FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return "not_found"

    if row["password"] != hash_password(current_password):
        conn.close()
        return "wrong_current"

    cur.execute(
        "UPDATE users SET password = ? WHERE id = ?",
        (hash_password(new_password), user_id),
    )
    conn.commit()
    conn.close()
    return True


def admin_dashboard_data():
    conn = get_connection()
    cur = conn.cursor()

    # totals
    cur.execute("SELECT COUNT(*) as total_books FROM books")
    total_books = cur.fetchone()["total_books"]

    cur.execute("SELECT COUNT(*) as total_users FROM users")
    total_users = cur.fetchone()["total_users"]

    cur.execute(
        "SELECT COUNT(*) as active_loans FROM checkout_history WHERE return_date IS NULL"
    )
    active_loans = cur.fetchone()["active_loans"]

    # borrowing trend last 7 days (including days with 0)
    end = datetime.now().date()
    start = end - timedelta(days=6)

    cur.execute(
        """
        SELECT substr(checkout_date, 1, 10) as day, COUNT(*) as count
        FROM checkout_history
        WHERE date(substr(checkout_date, 1, 10)) BETWEEN date(?) AND date(?)
        GROUP BY day
        ORDER BY day ASC
    """,
        (start.isoformat(), end.isoformat()),
    )
    raw = {r["day"]: r["count"] for r in cur.fetchall()}

    trend = []
    for i in range(7):
        d = (start + timedelta(days=i)).isoformat()
        trend.append({"date": d, "count": int(raw.get(d, 0))})

    # top 5 most borrowed books
    cur.execute(
        """
        SELECT b.id as book_id, b.title as title, COUNT(*) as count
        FROM checkout_history c
        JOIN books b ON b.id = c.book_id
        GROUP BY b.id
        ORDER BY count DESC
        LIMIT 5
    """
    )
    top_books = [dict(r) for r in cur.fetchall()]

    # top active users (most checkouts)
    cur.execute(
        """
        SELECT u.id as user_id, u.name as name, u.email as email, COUNT(*) as count
        FROM checkout_history c
        JOIN users u ON u.id = c.user_id
        GROUP BY u.id
        ORDER BY count DESC
        LIMIT 5
    """
    )
    top_users = [dict(r) for r in cur.fetchall()]

    # average borrow duration (days) for returned books
    # checkout_date / return_date are ISO strings -> use julianday
    cur.execute(
        """
        SELECT AVG(julianday(return_date) - julianday(checkout_date)) as avg_days
        FROM checkout_history
        WHERE return_date IS NOT NULL
    """
    )
    avg_days = cur.fetchone()["avg_days"]
    avg_days = float(avg_days) if avg_days is not None else 0.0

    conn.close()

    return {
        "totals": {
            "total_books": int(total_books),
            "total_users": int(total_users),
            "active_loans": int(active_loans),
        },
        "trend_7d": trend,
        "top_books": top_books,
        "top_users": top_users,
        "avg_borrow_days": round(avg_days, 2),
    }
