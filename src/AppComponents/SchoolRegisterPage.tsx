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
  Building,
  GraduationCap,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

const BASE_URL = "http://localhost:5000/api/schools";

// ─────────────────────────────────────────
// PASSWORD VALIDATION
// ─────────────────────────────────────────
function getPasswordFeedback(password: any) {
  const errors = [];
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("At least one number");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    errors.push("At least one special character");
  return errors;
}

function getPasswordStrength(password: any) {
  if (!password) return { label: "", color: "", width: "0%" };
  const errors = getPasswordFeedback(password);
  const score = 5 - errors.length;
  if (score <= 1)
    return { label: "Very Weak", color: "bg-red-500", width: "20%" };
  if (score === 2)
    return { label: "Weak", color: "bg-orange-400", width: "40%" };
  if (score === 3)
    return { label: "Fair", color: "bg-yellow-400", width: "60%" };
  if (score === 4)
    return { label: "Strong", color: "bg-blue-500", width: "80%" };
  return { label: "Very Strong", color: "bg-emerald-500", width: "100%" };
}

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
export default function SchoolRegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordFeedback = getPasswordFeedback(formData?.password);
  const isPasswordValid = passwordFeedback.length === 0;
  const strength = getPasswordStrength(formData?.password);

  // ── Handlers ──────────────────────────
  const handleChange = (e: any) => {
    setError("");
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side guards
    if (!isPasswordValid) {
      return setError("Please fix the password issues before submitting.");
    }
    if (formData?.password !== formData?.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_name: formData?.name,
          short_name: formData?.short_name,
          email: formData?.email,
          password: formData?.password,
          // phone: formData?.phone || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle duplicate email from backend
        if (response.status === 409) {
          return setError("This email is already registered. Please sign in.");
        }
        return setError(
          data.message || "Something went wrong. Please try again.",
        );
      }

      setSuccess(
        `School "${data.school_name}" registered successfully! Redirecting...`,
      );
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError("Cannot connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/70 to-blue-50/60 flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-lg shadow-xl border border-slate-200/60 backdrop-blur-md bg-white/95 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-5 pb-2 text-center">
          <div className="mx-auto bg-gradient-to-br from-indigo-100 to-blue-100 p-5 rounded-full shadow-sm">
            <Building className="h-12 w-12 text-indigo-700" strokeWidth={1.8} />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-800">
            Register Your School
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Create your school account to manage fees, students & payments
            online
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-8 px-7 sm:px-9">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-medium">
                School Name
              </Label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="name"
                  value={formData?.name}
                  onChange={handleChange}
                  placeholder="e.g. Delhi Public School"
                  className="pl-11 h-12 rounded-lg border-slate-300 focus:border-indigo-400 focus:ring-indigo-400/20"
                  required
                />
              </div>
            </div>

            {/* Short Name */}
            <div className="space-y-2">
              <Label
                htmlFor="short_name"
                className="text-slate-700 font-medium"
              >
                Short Name / School Code
              </Label>
              <Input
                id="short_name"
                value={formData?.short_name}
                onChange={handleChange}
                placeholder="e.g. DPS-FZL or DPSFAZILKA"
                className="h-12 rounded-lg border-slate-300 focus:border-indigo-400 focus:ring-indigo-400/20"
                required
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData?.email}
                    onChange={handleChange}
                    placeholder="admin@your-school.edu"
                    className="pl-11 h-12 rounded-lg border-slate-300 focus:border-indigo-400 focus:ring-indigo-400/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium">
                  Contact Phone{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData?.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="pl-11 h-12 rounded-lg border-slate-300 focus:border-indigo-400 focus:ring-indigo-400/20"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData?.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={`pl-11 pr-11 h-12 rounded-lg border-slate-300 focus:border-indigo-400 focus:ring-indigo-400/20 ${
                    formData?.password && !isPasswordValid
                      ? "border-amber-400"
                      : ""
                  }`}
                />
                {/* Show/Hide Toggle */}
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
              {formData?.password && (
                <div className="space-y-1.5 mt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Password strength</span>
                    <span
                      className={`font-semibold ${
                        strength.label === "Very Strong" ||
                        strength.label === "Strong"
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
                    {[
                      {
                        label: "At least 8 characters",
                        pass: formData?.password.length >= 8,
                      },
                      {
                        label: "One uppercase letter",
                        pass: /[A-Z]/.test(formData?.password),
                      },
                      {
                        label: "One lowercase letter",
                        pass: /[a-z]/.test(formData?.password),
                      },
                      {
                        label: "One number",
                        pass: /[0-9]/.test(formData?.password),
                      },
                      {
                        label: "One special character",
                        pass: /[!@#$%^&*(),.?":{}|<>]/.test(formData?.password),
                      },
                    ].map((rule, i) => (
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
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData?.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`pl-11 pr-11 h-12 rounded-lg border-slate-300 focus:border-indigo-400 focus:ring-indigo-400/20 ${
                    formData?.confirmPassword &&
                    formData?.password !== formData?.confirmPassword
                      ? "border-red-400"
                      : formData?.confirmPassword &&
                          formData?.password === formData?.confirmPassword
                        ? "border-emerald-400"
                        : ""
                  }`}
                  required
                />
                {/* Show/Hide Toggle */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Match feedback */}
              {formData?.confirmPassword && (
                <p
                  className={`text-xs flex items-center gap-1.5 ${
                    formData?.password === formData?.confirmPassword
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {formData?.password === formData?.confirmPassword ? (
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

            {/* Error / Success Messages */}
            {error && (
              <p className="text-sm text-red-600 text-center font-medium bg-red-50 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-emerald-700 text-center font-medium bg-emerald-50 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md"
              disabled={
                loading ||
                !isPasswordValid ||
                formData?.password !== formData?.confirmPassword
              }
            >
              {loading ? "Creating account..." : "Register School"}
            </Button>
          </form>
         
          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Button
              variant="link"
              className="px-1 text-indigo-700 font-medium hover:text-indigo-800"
              onClick={() => navigate("/")}
            >
              Sign in here
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
