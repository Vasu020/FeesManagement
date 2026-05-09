import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SchoolLoginPage from "./AppComponents/SchoolLoginPage";
import Home from "./AppComponents/Pages/StudentDirectory/Home";
import Dashboard from "./AppComponents/Pages/Dashboard";
import SettingsPage from "./AppComponents/Pages/AppSettings/Settings";
import ProtectedLayout from "./ProtectedLayout";
import SchoolRegisterPage from "./AppComponents/SchoolRegisterPage";
import ResetPassword from "./AppComponents/ResetPassword";
import ManageUsers from "./AppComponents/Pages/ManageUsers";

// Helper: only let admins through
function AdminRoute({ children }:any) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.role === "admin" ? children : <Navigate to="/home" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<SchoolLoginPage />} />
        <Route path="/register-school" element={<SchoolRegisterPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Authenticated (all roles) */}
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />

          {/* Admin only */}
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AdminRoute>
                <SettingsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/manage-users"
            element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
