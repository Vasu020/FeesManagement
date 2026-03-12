// src/AppComponents/Sidebar.tsx
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutDashboard,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  School,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useAppDispatch } from "../AppStore/store";
import { setStudents } from "../AppStore/student";
import { API_BASE_URL } from "./Utilities/Constant";

const navItems = [
  { name: "Home", path: "/home", icon: Home, adminOnly: false },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    adminOnly: true,
  },
  { name: "Manage Users", path: "/manage-users", icon: Users, adminOnly: true },
  { name: "Settings", path: "/settings", icon: Settings, adminOnly: true },
];

const Sidebar = () => {
  const dispatch = useAppDispatch();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const [isCollapsed, setIsCollapsed] = useState(false);

  // AFTER (from localStorage)
  const school = JSON.parse(localStorage.getItem("school") || "{}");
  const schoolName = school.school_name || "School Name";
  const schoolShortName = school.short_name || "SCH";

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/students`);
        if (response.data.status === "success") {
          dispatch(setStudents(response.data.data));
        }
      } catch (err) {
        console.error("Failed to fetch students:", err);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div
      className={cn(
        "group relative h-screen bg-gradient-to-b from-slate-950 to-slate-900",
        "border-r border-slate-800/80 text-slate-200 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72",
      )}
    >
      {/* Background subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/10 to-purple-950/5 pointer-events-none" />

      {/* Main content */}
      <div className="relative flex h-full flex-col">
        {/* Header / Logo */}
        <div className="flex h-16 items-center px-4">
          <div
            className={cn(
              "flex items-center gap-3 transition-all",
              isCollapsed && "justify-center w-full",
            )}
          >
            {/* Logo circle */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  {schoolShortName}
                </h2>
                <p className="text-xs font-medium text-slate-400 truncate max-w-[180px]">
                  {schoolName}
                </p>
              </div>
            )}
          </div>

          {/* Collapse button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white hover:bg-slate-800/60",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              isCollapsed && "right-2 opacity-100",
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "group/nav flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-slate-800/80 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white",
                  )
                }
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t border-slate-800/80 px-4 py-5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <School size={14} />
              <span>Managed by School Admin</span>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              © {new Date().getFullYear()} {schoolName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
