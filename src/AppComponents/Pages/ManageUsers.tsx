import { useState, useEffect } from "react";
import { UserPlus, Trash2, AlertCircle, CheckCircle2, Eye, EyeOff, Users, UserRoundX, ShieldCheck, Search } from "lucide-react";

const BASE_URL = "http://localhost:5000/api/users";

export default function ManageUsers() {
  const school   = JSON.parse(localStorage.getItem("school") || "{}");
  const schoolId = school.id;

  const [users, setUsers]       = useState([]);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [search, setSearch]     = useState("");

  const fetchUsers = async () => {
    try {
      const res  = await fetch(`${BASE_URL}?school_id=${schoolId}`);
      const data = await res.json();
      if (res.ok) setUsers(data.data);
    } catch {
      console.error("Failed to fetch users");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!name || !email || !password) return setError("All fields are required.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    try {
      const res  = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school_id: schoolId, name, email, password, role: "user" }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      setSuccess(`User "${name}" created successfully.`);
      setName(""); setEmail(""); setPassword("");
      fetchUsers();
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, userName: string) => {
    if (!confirm(`Delete user "${userName}"?`)) return;
    try {
      await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u: any) => u.id !== id));
    } catch {
      setError("Failed to delete user.");
    }
  };

  const filtered = users.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u: any) => u.role === "admin").length;
  const userCount  = users.filter((u: any) => u.role !== "admin").length;

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage access and permissions for your school</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shadow-md shadow-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            System operational
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Users",  value: users.length, icon: Users,       color: "text-slate-700" },
            { label: "Admins",       value: adminCount,   icon: ShieldCheck,  color: "text-slate-700" },
            { label: "Members",      value: userCount,    icon: Users,        color: "text-slate-700" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-md shadow-gray-400">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Create Form (left, 2/5) ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden h-full shadow-sm shadow-gray-400">
              <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center shadow-md shadow-gray-400">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-800">Add New User</span>
              </div>

              <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Full Name</label>
                  <input
                    value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@school.edu"
                    className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full h-10 px-3.5 pr-10 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                      required
                    />
                    <button
                      type="button" tabIndex={-1}
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Feedback */}
                {error && (
                  <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 px-3.5 py-2.5 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-start gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-gray-900"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      Creating…
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4.5 h-4.5" />
                      Create User
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ── Users Table (right, 3/5) ── */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm shadow-gray-400">
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-800">All Users</span>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or email…"
                    className="w-full h-9 pl-8 pr-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-12 px-6 py-2.5 bg-slate-50 border-b border-slate-100">
                <span className="col-span-5 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</span>
                <span className="col-span-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</span>
                <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Role</span>
                <span className="col-span-1"></span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <div className="py-14 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <UserRoundX className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-400">
                      {search ? "No users match your search." : "No users yet. Create one."}
                    </p>
                  </div>
                ) : (
                  filtered.map((u: any) => (
                    <div
                      key={u.id}
                      className="grid grid-cols-12 items-center px-6 py-3.5 hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Avatar + name */}
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-slate-600">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-800 truncate">{u.name}</span>
                      </div>

                      {/* Email */}
                      <span className="col-span-4 text-xs text-slate-500 truncate pr-2">{u.email}</span>

                      {/* Role badge */}
                      <div className="col-span-2 ">
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-lg shadow-md shadow-gray-400
                          ${u.role === "admin"
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600"
                          }`}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </div>

                      {/* Delete */}
                      <div className="col-span-1 flex justify-end">
                        {u.role !== "admin" && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer count */}
              {filtered.length > 0 && (
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
                  <p className="text-xs text-slate-400">
                    Showing {filtered.length} of {users.length} users
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}