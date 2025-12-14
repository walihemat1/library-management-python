import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../pages/AppLayout";
import Dashboard from "../features/librarian/LibrarianDashboard";
import LibrarianBooksPage from "../features/librarian/LibrarainBooksPage";

export default function LibrarianRoute() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["librarian"]} />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="library" element={<LibrarianBooksPage />} />

          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
