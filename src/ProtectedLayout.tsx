// src/ProtectedLayout.tsx
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./AppComponents/Sidebar";
import { isLoggedIn } from "./AppComponents/Utilities/apis/api";

export default function ProtectedLayout() {
  if (!isLoggedIn()) return <Navigate to="/" replace />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}