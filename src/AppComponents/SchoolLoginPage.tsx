// src/AppComponents/SchoolLoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import taxImg from "../assets/TaxImg.jpg";
import { API_BASE_URL } from "./Utilities/Constant";

export default function SchoolLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── Handle Login ───────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic client-side validation
    if (!email.trim()) return setError("Please enter your email.");
    if (!password) return setError("Please enter your password.");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message);

      // Save user + school info
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(data.user));
      // Keep school shape the same so Sidebar still works
      localStorage.setItem(
        "school",
        JSON.stringify({
          id: data.user.school_id,
          school_name: data.user.school_name,
          short_name: data.user.short_name,
        }),
      );
      navigate(data.user.role === "admin" ? "/dashboard" : "/home");

    } catch {
      setError("Cannot connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 -top-40 w-[500px] h-[500px] bg-indigo-300/10 dark:bg-indigo-700/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute right-20 bottom-20 w-[400px] h-[400px] bg-blue-300/10 dark:bg-blue-700/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      <div className="w-full max-w-6xl z-10 space-y-10 md:space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 md:space-y-5">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-indigo-100/80 to-blue-100/80 dark:from-indigo-900/40 dark:to-blue-900/40 rounded-2xl shadow-md">
              <GraduationCap
                className="h-16 w-16 text-indigo-600 dark:text-indigo-400"
                strokeWidth={1.4}
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 dark:from-indigo-400 dark:via-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
            School Fees Portal
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Effortlessly manage school fees, generate instant digital receipts,
            track pending dues, and simplify payments for parents — all in one
            secure platform.
          </p>
        </div>

        {/* Grid: Image + Form */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Image */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/20 backdrop-blur-sm p-4">
              <img
                src={taxImg}
                alt="School fee management illustration"
                className="w-full h-auto object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* Right: Login Card */}
          <Card className="border border-white/15 dark:border-slate-700/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-2xl backdrop-saturate-150 shadow-2xl shadow-indigo-500/20 dark:shadow-indigo-950/50 rounded-3xl overflow-hidden transition-all duration-400">
            <CardHeader className="space-y-4 pb-2 pt-8 text-center">
              <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                Admin Login
              </CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                Sign in to access your school dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-10 pt-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="admin@your-school.edu"
                      className="h-12 pl-11 rounded-xl border-slate-300/70 dark:border-slate-600/60 bg-white/70 dark:bg-slate-950/60 focus:border-indigo-400 focus:ring-indigo-400/30 transition-all"
                      autoComplete="email"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Password
                    </Label>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-sm text-indigo-600 dark:text-indigo-400"
                      onClick={() => navigate("/reset-password")}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      className="h-12 pl-11 pr-11 rounded-xl border-slate-300/70 dark:border-slate-600/60 bg-white/70 dark:bg-slate-950/60 focus:border-indigo-400 focus:ring-indigo-400/30 transition-all"
                      autoComplete="current-password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50/70 dark:bg-red-950/30 py-2.5 rounded-xl border border-red-200/50 dark:border-red-800/40">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl rounded-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V12z"
                        />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Sign In <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Register link */}
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-slate-300/70 dark:border-slate-600/50 hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                  onClick={() => navigate("/register-school")}
                >
                  Register New School
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
