import { Users, UserCheck, UserX, AlertTriangle, Banknote, TrendingDown } from "lucide-react";
import { T } from "../utils/theme";
import { fmtINR, hasPendingFees } from "../utils/helpers";
import type { Student } from "../types";

interface Props { students: Student[] }

const CARDS = [
  { key: "total",       label: "Total Students", Icon: Users,         color: T.accent, bg: T.accentBg },
  { key: "active",      label: "Active",          Icon: UserCheck,     color: T.ok,     bg: T.okBg },
  { key: "inactive",    label: "Inactive",         Icon: UserX,         color: T.muted,  bg: T.subtle },
  { key: "pending",     label: "Fees Pending",     Icon: AlertTriangle, color: T.warn,   bg: T.warnBg },
  { key: "collected",   label: "Collected",        Icon: Banknote,      color: T.ok,     bg: T.okBg },
  { key: "outstanding", label: "Outstanding",      Icon: TrendingDown,  color: T.danger, bg: T.dangerBg },
];

export const KpiStrip = ({ students }: Props) => {
  const n       = students.length;
  const active  = students.filter(s => s.status === "active").length;
  const inactive = students.filter(s => s.status === "inactive").length;
  const pending = students.filter(hasPendingFees).length;
  const paid    = students.reduce((a, s) => a + Number(s.fees_paid ?? 0), 0);
  const bal     = students.reduce((a, s) => a + Number(s.balance  ?? 0), 0);

  const values: Record<string, string | number> = {
    total: n, active, inactive, pending,
    collected: fmtINR(paid), outstanding: fmtINR(bal),
  };
  const notes: Record<string, string> = {
    total:       "enrolled",
    active:      n ? `${((active   / n) * 100).toFixed(0)}% of total` : "—",
    inactive:    n ? `${((inactive / n) * 100).toFixed(0)}% of total` : "—",
    pending:     "need attention",
    collected:   "fees paid",
    outstanding: "balance due",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: 12, marginBottom: 20 }}>
      {CARDS.map(({ key, label, Icon, color, bg }) => (
        <div
          key={key}
          style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: "15px 18px", boxShadow: T.shadowSm, display: "flex", flexDirection: "column", gap: 10, transition: "box-shadow .2s, transform .2s", cursor: "default" }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = T.shadowMd; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = T.shadowSm; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</span>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon style={{ width: 14, height: 14, color }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.text, lineHeight: 1.1, letterSpacing: "-.02em" }}>{values[key]}</div>
            <div style={{ fontSize: 11, color: T.faint, marginTop: 3 }}>{notes[key]}</div>
          </div>
        </div>
      ))}
    </div>
  );
};