// src/components/AttendeeRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../pages/AppLayout";
import Dashboard from "../features/librarian/LibrarianDashboard";

export default function LibrarianRoute() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["librarian"]} />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
