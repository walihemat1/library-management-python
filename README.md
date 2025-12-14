# 📚 Library Management System

A full-stack **Library Management System** built with **React (frontend)** and **Flask + SQLite (backend)**.  
The system supports **admins**, **librarians**, and **members**, enabling efficient book management, user control, and borrowing history tracking.

---

## 🚀 Features

### 🔐 Authentication & Authorization

- Session-based login/logout
- Role-based access control:
  - **Admin**
  - **Librarian**
  - **Member**
- Deactivated users are blocked from logging in

### 📘 Book Management

- Add, edit, delete books (Admin)
- View all books (Admin, Librarian, Member)
- Check out and return books
- Track availability in real time

### 👤 User Management (Admin)

- Create users
- Activate / deactivate accounts
- Change user roles
- Reset user passwords

### 🕘 Checkout History

- View borrowing history per user
- View borrowing history per book (Admin)
- Tracks:
  - Borrower
  - Book
  - Checkout date
  - Return date

### 📊 Dashboards

- **Admin Dashboard**
  - Borrowing trends
  - Top borrowed books
  - Top active users
  - Average borrow duration
- **Librarian Dashboard**
  - Personal borrowing activity
  - Current checkouts

### 👤 Profile

- Update profile (name & email)
- Change password securely

---

## 🛠 Tech Stack

### Frontend

- React
- Redux Toolkit
- React Router
- Tailwind CSS
- Recharts
- Axios

### Backend

- Flask
- SQLite
- Flask Blueprints
- Session-based authentication
- Role-based middleware

## ⚙️ Backend Setup (Flask)

### 1️⃣ Create Virtual Environment

```bash
cd backend
python -m venv venv
```

### 2️⃣ Activate Virtual Environment

# Windows

- venv\Scripts\activate

# macOS / Linux

- source venv/bin/activate

### 3️⃣ Install Dependencies

pip install flask flask-cors

### 4️⃣ Run Backend Server

python app.py

⚙️ Frontend Setup (React)

### 1️⃣ Install Dependencies

cd frontend
npm install

### 2️⃣ Start Development Server

npm run dev
