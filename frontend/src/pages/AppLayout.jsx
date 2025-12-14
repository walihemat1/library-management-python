import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import AppSidebar from "../components/AppSidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content area shifted on desktop */}
      <div className="md:pl-72">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
