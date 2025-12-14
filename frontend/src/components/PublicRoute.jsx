// src/pages/PublicRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute() {
  const { isAuthenticated, isLoading, role } = useSelector(
    (state) => state.auth
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    if (role === "librarian")
      return <Navigate to="/librarian/dashboard" replace />;
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}
