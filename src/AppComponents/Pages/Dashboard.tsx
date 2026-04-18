/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { API_BASE_URL } from "../Utilities/Constant";
import { getSchoolId } from "../Utilities/ReusableFn";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#F7F8FA",
  surface: "#FFFFFF",
  border: "#E8ECF0",
  text: "#0F1923",
  muted: "#6B7A8D",
  accent: "#2563EB",
  accentSoft: "#EEF3FD",
  green: "#16A34A",
  greenSoft: "#DCFCE7",
  red: "#DC2626",
  redSoft: "#FEE2E2",
  amber: "#D97706",
  amberSoft: "#FEF3C7",
  indigo: "#4F46E5",
  indigoSoft: "#EEF2FF",
};

// ─── Status helpers ───────────────────────────────────────────────────────────

/**
 * ACTIVE today:
 *   status === "active"
 *   AND active_date exists AND <= today
 *   AND (inactive_date is null/empty OR inactive_date > today)
 */
const isActiveToday = (s: any): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (s.status !== "active") return false;
  if (!s.active_date) return false;
  if (new Date(s.active_date) > today) return false;
  if (s.inactive_date && new Date(s.inactive_date) <= today) return false;
  return true;
};

/**
 * INACTIVE today:
 *   status === "inactive"
 *   OR inactive_date exists AND <= today
 */
const isInactiveToday = (s: any): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (s.status === "inactive") return true;
  if (s.inactive_date && new Date(s.inactive_date) <= today) return true;
  return false;
};

/**
 * Generate last N academic sessions from current year.
 * currentYear=2026, count=5 → ["2022-23","2023-24","2024-25","2025-26","2026-27"]
 */
const generateSessions = (count = 5): string[] => {
  const y = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => {
    const start = y - (count - 1) + i;
    return `${start}-${String(start + 1).slice(-2)}`;
  });
};

/**
 * Count active/inactive students within a session using
 * current_session field + status + inactive_date.
 */
const countPerSession = (
  students: any[],
  session: string,
): { active: number; inactive: number } => {
  const inSession = students.filter((s) => s.current_session === session);
  const active = inSession.filter(
    (s) => s.status === "active" && s.active_date && !s.inactive_date,
  ).length;
  const inactive = inSession.filter(
    (s) => s.status === "inactive" || !!s.inactive_date,
  ).length;
  return { active, inactive };
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  sub,
  icon,
  accent,
  soft,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  soft: string;
}) => (
  <div
    style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: "22px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,.04)",
      transition: "box-shadow .2s",
    }}
    onMouseEnter={(e) =>
      ((e.currentTarget as HTMLDivElement).style.boxShadow =
        "0 4px 18px rgba(0,0,0,.09)")
    }
    onMouseLeave={(e) =>
      ((e.currentTarget as HTMLDivElement).style.boxShadow =
        "0 1px 4px rgba(0,0,0,.04)")
    }
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.muted,
          letterSpacing: ".04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: soft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
    </div>
    <div>
      <div
        style={{ fontSize: 34, fontWeight: 800, color: C.text, lineHeight: 1 }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{sub}</div>
      )}
    </div>
  </div>
);

const ChartCard = ({
  title,
  subtitle,
  height = 240,
  children,
}: {
  title: string;
  subtitle?: string;
  height?: number;
  children: React.ReactNode;
}) => (
  <div
    style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: "22px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,.04)",
    }}
  >
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 12, color: C.muted, margin: "3px 0 0" }}>
          {subtitle}
        </p>
      )}
    </div>
    <div style={{ height }}>{children}</div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: C.text,
        borderRadius: 10,
        padding: "10px 14px",
        color: "#fff",
        fontSize: 13,
        boxShadow: "0 4px 16px rgba(0,0,0,.25)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
              display: "inline-block",
            }}
          />
          <span style={{ color: "#CBD5E1", fontSize: 12 }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// Inline SVG icons
const IconUsers = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconUserCheck = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);
const IconUserX = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="17" y1="11" x2="23" y2="17" />
    <line x1="23" y1="11" x2="17" y2="17" />
  </svg>
);
const IconSchool = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconMoney = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [admissionsData, setAdmissionsData] = useState<any[]>([]);
  const [activeInactiveData, setActiveInactiveData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const schoolId = getSchoolId();

  const currentYear = new Date().getFullYear();
  const sessions = generateSessions(5);

  // ── Derived KPIs (recalculate whenever students changes) ──
  const totalStudents = students.length;
  const activeStudents = students.filter(isActiveToday).length;
  const inactiveStudents = students.filter(isInactiveToday).length;

  // Revenue = fees_paid for the session just before current year
  // e.g. in 2026 → session "2025-26"
  const currentSession = `${currentYear - 1}-${String(currentYear).slice(-2)}`;
  const revenue = students
    .filter((s) => s.current_session === currentSession)
    .reduce((acc: number, s: any) => acc + Number(s.fees_paid ?? 0), 0);

  const totalClasses = classes.length;
  const totalSections = classes.reduce(
    (a: number, c: any) => a + Number(c.sections ?? 0),
    0,
  );
  const classStrength = classes.map((c: any) => ({
    class: c.classname,
    students: Number(c.students ?? 0),
  }));

  // ── Fetch ──
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/students?school_id=${schoolId}`).then((r) =>
        r.json(),
      ),
      fetch(`${API_BASE_URL}/api/classes?school_id=${schoolId}`).then((r) =>
        r.json(),
      ),
    ])
      .then(([studRes, classRes]) => {
        const s: any[] = studRes.data ?? [];
        const cl: any[] = classRes.data ?? [];
        setStudents(s);
        setClasses(cl);

        // Admissions chart — by enrollment year, last 5 years
        const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
        setAdmissionsData(
          years.map((y) => ({
            year: String(y),
            admissions: s.filter(
              (st) => new Date(st.enrollment_date).getFullYear() === y,
            ).length,
          })),
        );

        // Active/Inactive chart — by current_session, last 5 sessions
        setActiveInactiveData(
          sessions.map((session) => ({
            session,
            ...countPerSession(s, session),
          })),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Render ──
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        color: C.text,
        padding: "28px 24px",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      {/* Page header */}
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.accent,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              margin: 0,
            }}
          >
            School Management
          </p>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              margin: "4px 0 0",
              color: C.text,
            }}
          >
            Dashboard Overview
          </h1>
        </div>
        <div
          style={{
            fontSize: 12,
            color: C.muted,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "6px 14px",
          }}
        >
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 80,
            color: C.muted,
            fontSize: 14,
          }}
        >
          Loading dashboard…
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <StatCard
              label="Total Students"
              value={totalStudents}
              sub={`Session ${currentSession}`}
              icon={<IconUsers />}
              accent={C.accent}
              soft={C.accentSoft}
            />
            <StatCard
              label="Active Students"
              value={activeStudents}
              sub={
                totalStudents
                  ? `${((activeStudents / totalStudents) * 100).toFixed(1)}% of total`
                  : "—"
              }
              icon={<IconUserCheck />}
              accent={C.green}
              soft={C.greenSoft}
            />
            <StatCard
              label="Inactive Students"
              value={inactiveStudents}
              sub={
                totalStudents
                  ? `${((inactiveStudents / totalStudents) * 100).toFixed(1)}% of total`
                  : "—"
              }
              icon={<IconUserX />}
              accent={C.red}
              soft={C.redSoft}
            />
            <StatCard
              label={`Revenue ${currentSession}`}
              value={`₹${(revenue / 1000).toFixed(1)}k`}
              sub="Total fees collected"
              icon={<IconMoney />}
              accent={C.amber}
              soft={C.amberSoft}
            />
            <StatCard
              label="Classes"
              value={totalClasses}
              sub={`${totalSections} total sections`}
              icon={<IconSchool />}
              accent={C.indigo}
              soft={C.indigoSoft}
            />
          </div>

          {/* ── Charts ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            {/* Admissions bar */}
            <ChartCard
              title="Admissions — Last 5 Years"
              subtitle="New enrollments by year"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={admissionsData}
                  barSize={32}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.border}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12, fill: C.muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: C.muted }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: C.accentSoft }}
                  />
                  <Bar
                    dataKey="admissions"
                    fill={C.accent}
                    radius={[6, 6, 0, 0]}
                    name="Admissions"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Active vs Inactive — by current_session */}
            <ChartCard
              title="Active vs Inactive Students"
              subtitle="By session (status + active_date + inactive_date)"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activeInactiveData}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.border}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="session"
                    tick={{ fontSize: 10, fill: C.muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: C.muted }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    name="Active"
                    stroke={C.green}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: C.green }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inactive"
                    name="Inactive"
                    stroke={C.red}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: C.red }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Class-wise strength */}
            <ChartCard
              title="Class-wise Student Strength"
              subtitle="From classes table"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classStrength}
                  barSize={22}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.border}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="class"
                    tick={{ fontSize: 11, fill: C.muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: C.muted }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: C.indigoSoft }}
                  />
                  <Bar
                    dataKey="students"
                    fill={C.indigo}
                    radius={[5, 5, 0, 0]}
                    name="Students"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Class fee table ── */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: "22px 24px",
              boxShadow: "0 1px 4px rgba(0,0,0,.04)",
            }}
          >
            <div style={{ marginBottom: 14 }}>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.text,
                  margin: 0,
                }}
              >
                Class Fee Structure
              </h2>
              <p style={{ fontSize: 12, color: C.muted, margin: "3px 0 0" }}>
                Fee breakdown per class
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Class",
                      "Sections",
                      "Students",
                      "Tuition (₹)",
                      "Admission (₹)",
                      "Annual (₹)",
                      "Others (₹)",
                      "Total (₹)",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          color: C.muted,
                          fontWeight: 600,
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                          borderBottom: `2px solid ${C.border}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c: any, i: number) => {
                    const total =
                      Number(c.tutions ?? 0) +
                      Number(c.admission ?? 0) +
                      Number(c.annual ?? 0) +
                      Number(c.others ?? 0);
                    return (
                      <tr
                        key={c.id}
                        style={{
                          background: i % 2 === 0 ? C.bg : C.surface,
                          transition: "background .15s",
                        }}
                        onMouseEnter={(e) =>
                          ((
                            e.currentTarget as HTMLTableRowElement
                          ).style.background = C.accentSoft)
                        }
                        onMouseLeave={(e) =>
                          ((
                            e.currentTarget as HTMLTableRowElement
                          ).style.background = i % 2 === 0 ? C.bg : C.surface)
                        }
                      >
                        <td
                          style={{
                            padding: "12px 14px",
                            fontWeight: 700,
                            color: C.accent,
                          }}
                        >
                          {c.classname}
                        </td>
                        <td style={{ padding: "12px 14px", color: C.muted }}>
                          {c.sections}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span
                            style={{
                              background: C.indigoSoft,
                              color: C.indigo,
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {c.students}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          ₹{Number(c.tutions).toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          ₹{Number(c.admission).toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          ₹{Number(c.annual).toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          ₹{Number(c.others).toLocaleString("en-IN")}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontWeight: 700,
                            color: C.green,
                          }}
                        >
                          ₹{total.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {classes.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    color: C.muted,
                    fontSize: 13,
                  }}
                >
                  No class data available.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
