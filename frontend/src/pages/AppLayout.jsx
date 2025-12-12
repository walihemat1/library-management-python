import { Fragment } from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import AppSidebar from "../components/AppSidebar";
import { useSelector } from "react-redux";

export default function AppLayout() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <AppSidebar />

      <Header />
      <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
