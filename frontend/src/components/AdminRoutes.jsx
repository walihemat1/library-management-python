// src/components/AdminRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../pages/AppLayout";
import Dashboard from "../features/admin/AdminDashboard";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />

          {/* default /admin -> /admin/dashboard */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
