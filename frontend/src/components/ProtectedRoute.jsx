import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, role, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = role || user?.role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (userRole === "librarian")
      return <Navigate to="/librarian/dashboard" replace />;
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
