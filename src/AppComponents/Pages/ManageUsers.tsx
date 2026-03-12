import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Trash2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

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

  // Fetch existing users
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

  // Create new user
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

  // Delete user
  const handleDelete = async (id: number, userName: string) => {
    if (!confirm(`Delete user "${userName}"?`)) return;
    try {
      await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u: any) => u.id !== id));
    } catch {
      setError("Failed to delete user.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>

      {/* Create User Form */}
      <Card className="rounded-2xl shadow-md border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" /> Create New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe" className="h-11 rounded-lg" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@school.edu" className="h-11 rounded-lg" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" className="h-11 rounded-lg pr-11" required />
                <button type="button" onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
              </p>
            )}

            <Button type="submit" disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
              {loading ? "Creating..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="rounded-2xl shadow-md border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No users yet. Create one above.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {users.map((u: any) => (
                <li key={u.id} className="flex items-center justify-between py-3 px-1">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      u.role === "admin"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {u.role}
                    </span>
                    {u.role !== "admin" && (
                      <button onClick={() => handleDelete(u.id, u.name)}
                        className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}