import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../pages/AppLayout";
import Dashboard from "../features/admin/AdminDashboard";
import BooksPage from "../features/books/BooksPage";
import AdminUsersPage from "../features/admin/AdminUsersPage";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="users" element={<AdminUsersPage />} />

          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
