import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import booksReducer from "../features/books/booksSlice";
import historyReducer from "../features/history/historySlice";
import adminUsersReducer from "../features/admin/AdminUsersSlice";
import librarianBooksReducer from "../features/librarian/librarianBooksSlice";
import profileReducer from "../features/profile/profileSlice";
import adminDashboardReducer from "../features/admin/adminDashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer,
    history: historyReducer,
    adminUsers: adminUsersReducer,
    librarianBooks: librarianBooksReducer,
    profile: profileReducer,
    adminDashboard: adminDashboardReducer,
  },
});
