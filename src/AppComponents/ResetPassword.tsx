import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { API_BASE_URL } from "./Utilities/Constant";

// ── Password validation rules ─────────────
function getPasswordRules(password: any) {
  return [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "One lowercase letter", pass: /[a-z]/.test(password) },
    { label: "One number", pass: /[0-9]/.test(password) },
    {
      label: "One special character",
      pass: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];
}

function getStrength(password: any) {
  if (!password) return { label: "", color: "", width: "0%" };
  const passed = getPasswordRules(password).filter((r) => r.pass).length;
  if (passed <= 1)
    return { label: "Very Weak", color: "bg-red-500", width: "20%" };
  if (passed === 2)
    return { label: "Weak", color: "bg-orange-400", width: "40%" };
  if (passed === 3)
    return { label: "Fair", color: "bg-yellow-400", width: "60%" };
  if (passed === 4)
    return { label: "Strong", color: "bg-blue-500", width: "80%" };
  return { label: "Very Strong", color: "bg-emerald-500", width: "100%" };
}

export default function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const rules = getPasswordRules(password);
  const isPasswordValid = rules.every((r) => r.pass);
  const passwordsMatch = password === confirmPassword;
  const strength = getStrength(password);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Please enter a valid email address.");
    }
    if (!isPasswordValid) {
      return setError("Please fix the password issues before submitting.");
    }
    if (!passwordsMatch) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) return setError(data.message || "Something went wrong.");

      setSuccess(true);
    } catch {
      setError("Cannot connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/70 to-blue-50/60 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border border-slate-200/60 bg-white/95 rounded-2xl overflow-hidden">
          <CardContent className="py-12 px-9 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-800">
                Password Updated!
              </h2>
              <p className="text-sm text-slate-500">
                Your password has been reset successfully. You can now sign in
                with your new password.
              </p>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main Form ─────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/70 to-blue-50/60 flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-xl border border-slate-200/60 bg-white/95 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-4 pb-2 text-center">
          <div className="mx-auto bg-gradient-to-br from-indigo-100 to-blue-100 p-5 rounded-full shadow-sm">
            <KeyRound className="h-10 w-10 text-indigo-700" strokeWidth={1.8} />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Reset Password
          </CardTitle>
          <CardDescription className="text-slate-600">
            Enter your registered email and choose a new password.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-7 sm:px-9 pb-8 pt-3">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Registered Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="admin@your-school.edu"
                  className="pl-11 h-12 rounded-lg border-slate-300 focus:border-indigo-400 focus:ring-indigo-400/20"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Create a strong password"
                  className={`pl-11 pr-11 h-12 rounded-lg border-slate-300 focus:border-indigo-400 focus:ring-indigo-400/20 ${
                    password && !isPasswordValid ? "border-amber-400" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Strength Bar */}
              {password && (
                <div className="space-y-1.5 mt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Password strength</span>
                    <span
                      className={`font-semibold ${
                        ["Strong", "Very Strong"].includes(strength.label)
                          ? "text-emerald-600"
                          : strength.label === "Fair"
                            ? "text-yellow-600"
                            : "text-red-500"
                      }`}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  {/* Checklist */}
                  <ul className="mt-2 space-y-1">
                    {rules.map((rule, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-1.5 text-xs ${rule.pass ? "text-emerald-600" : "text-amber-700"}`}
                      >
                        {rule.pass ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5" />
                        )}
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-slate-700 font-medium"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Re-enter your new password"
                  className={`pl-11 pr-11 h-12 rounded-lg border-slate-300 focus:border-indigo-400 focus:ring-indigo-400/20 ${
                    confirmPassword
                      ? passwordsMatch
                        ? "border-emerald-400"
                        : "border-red-400"
                      : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmPassword && (
                <p
                  className={`text-xs flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-600" : "text-red-500"}`}
                >
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" /> Passwords do not
                      match
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-600 font-medium bg-red-50 py-2.5 px-4 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md transition-all"
            >
              {loading ? "Updating Password..." : "Reset Password"}
            </Button>

            {/* Back to login */}
            <p className="text-center text-sm text-slate-600">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-indigo-700 font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
// ```

// ---

// **API endpoint added:**
// ```
// POST /api/schools/reset-password
// Body: { email, password }
