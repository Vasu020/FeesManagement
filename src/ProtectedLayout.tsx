// src/ProtectedLayout.tsx
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./AppComponents/Sidebar";

export default function ProtectedLayout() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
