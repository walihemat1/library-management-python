// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchMe } from "./features/auth/authSlice";

import PublicLayout from "./components/PublicLayout";
import AppLayout from "./pages/AppLayout";

// wrappers
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// public pages
import Login from "./pages/auth/Login";

// role-based route groups
import AdminRoutes from "./components/AdminRoutes";
import LibrarianRoutes from "./components/LibrarianRoute";

// other pages
import Unauthorized from "./pages/Unauthorized";
import ProfilePage from "./features/profile/ProfilePage";
import HistoryPage from "./features/history/HistoryPage";

export default function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
      </Route>

      <Route index element={<Navigate to="/login" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Route>

      <Route path="/admin/*" element={<AdminRoutes />} />

      <Route path="/librarian/*" element={<LibrarianRoutes />} />

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
