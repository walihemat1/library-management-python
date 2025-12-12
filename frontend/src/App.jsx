// src/App.jsx
import { Routes, Route } from "react-router-dom";

import PublicLayout from "./components/PublicLayout";
import AppLayout from "./pages/AppLayout";

// wrappers
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// public pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth//Signup";

// role-based route groups
import AdminRoutes from "./components/AdminRoutes";
import LibrarianRoutes from "./components/LibrarianRoute";

// other pages
import Unauthorized from "./pages/Unauthorized";
import Home from "./pages/Home";
import ProfilePage from "./pages/Profile";

export default function App() {
  return (
    <Routes>
      {/* ---------- PUBLIC ROUTES (ONLY WHEN LOGGED OUT) ---------- */}
      <Route element={<PublicRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
      </Route>

      {/* ---------- COMMON AUTHENTICATED ROUTES (ANY ROLE) ---------- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* ---------- ADMIN AREA USING AdminRoutes ---------- */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* ---------- ATTENDEE AREA USING AttendeeRoutes ---------- */}
      <Route path="/librarian/*" element={<LibrarianRoutes />} />

      {/* ---------- UNAUTHORIZED & FALLBACK ---------- */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      {/* <Route path="/*" element={<Navigate to="/" replace />} /> */}
    </Routes>
  );
}
