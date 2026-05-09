import { useState } from "react";
import { Edit, TrendingUp, LogOut, LogIn, Award, Tag } from "lucide-react";
import { T } from "../utils/theme";
import {
  fmtINR,
  calcEffective,
  calcFeePct,
  hasPendingFees,
  formatStudentDates,
} from "../utils/helpers";
import type { Student } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── FeeBar ───────────────────────────────────────────────────────────────────
const FeeBar = ({ student }: { student: Partial<Student> }) => {
  const paid = Number(student.fees_paid ?? 0);
  const eff = calcEffective(student);
  const pct = calcFeePct(student);
  const balance = Math.max(eff - paid, 0);
  const clear = balance === 0 && eff > 0;
  const [showTip, setShowTip] = useState(false);

  const hasConcessions =
    Number(student.concession ?? 0) > 0 || Number(student.scholarship ?? 0) > 0;

  return (
    <div style={{ minWidth: 155 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".05em",
            color: clear ? T.ok : T.warn,
            background: clear ? T.okBg : T.warnBg,
            border: `1px solid ${clear ? T.okBorder : T.warnBorder}`,
            borderRadius: 5,
            padding: "2px 7px",
          }}
        >
          {clear ? "Cleared" : `${fmtINR(balance)} due`}
        </span>
        <span style={{ fontSize: 10, color: T.faint, fontWeight: 600 }}>
          {Math.round(pct)}%
        </span>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: 99,
          background: T.line,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 99,
            width: `${pct}%`,
            transition: "width .4s ease",
            background: clear
              ? `linear-gradient(90deg,${T.okMid},${T.ok})`
              : `linear-gradient(90deg,${T.warnMid},${T.warn})`,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        <span style={{ fontSize: 10, color: T.muted }}>
          {fmtINR(paid)} paid
        </span>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                style={{
                  fontSize: 12,
                  color: T.faint,
                  borderBottom: hasConcessions
                    ? `1px dashed ${T.faint}`
                    : "none",
                  cursor: hasConcessions ? "default" : "auto",
                }}
              >
                of {fmtINR(eff)}
              </span>
            </TooltipTrigger>

            {hasConcessions && (
              <TooltipContent
                side="top"
                align="end"
              >
                <div className="flex justify-between gap-8  pb-2 text-muted-foreground">
                  <span>Total</span>
                  <span>{fmtINR(Number(student.total_fees ?? 0))}</span>
                </div>
                {Number(student.concession ?? 0) > 0 && (
                  <div className="flex justify-between gap-8  pb-2 text-muted-foreground">
                    <span>Concession</span>
                    <span className="text-violet-800">
                      −{fmtINR(Number(student.concession ?? 0))}
                    </span>
                  </div>
                )}
                {Number(student.scholarship ?? 0) > 0 && (
                  <div className="flex justify-between gap-8 pb-2 text-muted-foreground">
                    <span>Scholarship</span>
                    <span className="text-emerald-800">
                      −{fmtINR(Number(student.scholarship ?? 0))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-8 pb-2 border-t border-border font-medium text-muted-foreground-800">
                  <span>Payable</span>
                  <span>{fmtINR(eff)}</span>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

// ─── StatusPill ───────────────────────────────────────────────────────────────
const StatusPill = ({ status }: { status: string }) => {
  const active = status === "active";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        borderRadius: 20,
        padding: "4px 10px",
        whiteSpace: "nowrap",
        color: active ? T.ok : T.muted,
        background: active ? T.okBg : T.subtle,
        border: `1px solid ${active ? T.okBorder : T.line}`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: active ? T.okMid : T.faint,
        }}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
};

// ─── ActionBtn ────────────────────────────────────────────────────────────────
const variants = {
  default: { border: T.line, color: T.secondary, hoverBg: T.subtle },
  accent: { border: T.accentLight, color: T.accent, hoverBg: T.accentBg },
  danger: { border: T.dangerBorder, color: T.danger, hoverBg: T.dangerBg },
  success: { border: T.okBorder, color: T.ok, hoverBg: T.okBg },
};

const ActionBtn = ({
  onClick,
  title,
  icon,
  disabled,
  disabledReason,
  variant = "default",
}: {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  disabled?: boolean;
  disabledReason?: string;
  variant?: keyof typeof variants;
}) => {
  const [tip, setTip] = useState(false);
  const cfg = variants[variant];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          border: `1px solid ${disabled ? T.line : cfg.border}`,
          background: T.surface,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: disabled ? T.faint : cfg.color,
          opacity: disabled ? 0.5 : 1,
          transition: "all .15s",
        }}
        onMouseOver={(e) => {
          if (!disabled)
            (e.currentTarget as HTMLButtonElement).style.background =
              cfg.hoverBg;
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = T.surface;
        }}
      >
        {icon}
      </button>
      {tip && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 7px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: T.text,
            color: "#fff",
            fontSize: 11,
            fontWeight: 500,
            borderRadius: 7,
            padding: "5px 10px",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 14px rgba(0,0,0,.2)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          {disabled && disabledReason ? disabledReason : title}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              borderWidth: "4px 4px 0",
              borderStyle: "solid",
              borderColor: `${T.text} transparent transparent`,
            }}
          />
        </div>
      )}
    </div>
  );
};

// ─── StudentTable ─────────────────────────────────────────────────────────────
const HEADERS = [
  "ID",
  "Student",
  "Father",
  "Class · Roll",
  "Enrolled",
  "Fees",
  "Status",
  "Actions",
];
const PENDING_MSG = "Clear pending fees before this action";

export interface StudentTableProps {
  students: Student[];
  onEdit: (s: Student) => void;
  onPromote: (s: Student) => void;
  onLeave: (s: Student) => void;
  onRejoin: (s: Student) => void;
  onScholarship: (s: Student) => void;
  onConcession: (s: Student) => void;
}

export const StudentTable = ({
  students,
  onEdit,
  onPromote,
  onLeave,
  onRejoin,
  onScholarship,
  onConcession,
}: StudentTableProps) => (
  <div
    style={{
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: T.shadowSm,
    }}
  >
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr
            style={{
              borderBottom: `2px solid ${T.line}`,
              background: T.surfaceElevated,
            }}
          >
            {HEADERS.map((h) => (
              <th
                key={h}
                style={{
                  padding: "11px 16px",
                  textAlign: "left",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: T.muted,
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map(formatStudentDates).map((s, i) => {
              const blocked = hasPendingFees(s);
              return (
                <tr
                  key={s.student_id}
                  style={{
                    borderBottom: `1px solid ${T.line}`,
                    background: i % 2 === 0 ? T.surface : T.subtle,
                    transition: "background .12s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "#F5F7FF")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      i % 2 === 0 ? T.surface : T.subtle)
                  }
                >
                  <td
                    style={{
                      padding: "13px 16px",
                      color: T.faint,
                      fontSize: 11.5,
                      fontWeight: 600,
                    }}
                  >
                    #{s.student_id}
                  </td>

                  <td style={{ padding: "13px 16px" }}>
                    <div
                      style={{ fontWeight: 700, color: T.text, fontSize: 13.5 }}
                    >
                      {s.first_name} {s.last_name}
                    </div>
                    <div style={{ fontSize: 11, color: T.faint, marginTop: 2 }}>
                      {s.contact_phone ? `📱 ${s.contact_phone}` : s.email}
                    </div>
                  </td>

                  <td style={{ padding: "13px 16px", color: T.secondary }}>
                    {s.father_name || "—"}
                  </td>

                  <td style={{ padding: "13px 16px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          background: T.accentBg,
                          color: T.accent,
                          borderRadius: 6,
                          padding: "3px 9px",
                          fontWeight: 700,
                          fontSize: 12,
                          border: `1px solid ${T.accentLight}`,
                        }}
                      >
                        {s.standard || "—"}
                      </span>
                      <span style={{ color: T.faint, fontSize: 11.5 }}>
                        #{s.roll_no || "—"}
                      </span>
                    </div>
                  </td>

                  <td
                    style={{
                      padding: "13px 16px",
                      color: T.muted,
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.enrollment_date || "—"}
                  </td>

                  <td style={{ padding: "13px 16px" }}>
                    <FeeBar student={s} />
                  </td>

                  <td style={{ padding: "13px 16px" }}>
                    <StatusPill status={s.status} />
                  </td>

                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      <ActionBtn
                        onClick={() => onEdit(s)}
                        title="Edit"
                        icon={<Edit style={{ width: 13 }} />}
                        variant="accent"
                      />
                      <ActionBtn
                        onClick={() => onPromote(s)}
                        title="Promote"
                        icon={<TrendingUp style={{ width: 13 }} />}
                        disabled={blocked}
                        disabledReason={blocked ? PENDING_MSG : undefined}
                      />
                      <ActionBtn
                        onClick={() => onScholarship(s)}
                        title="Scholarship"
                        icon={<Award style={{ width: 13 }} />}
                        variant="accent"
                      />
                      <ActionBtn
                        onClick={() => onConcession(s)}
                        title="Concession"
                        icon={<Tag style={{ width: 13 }} />}
                      />
                      {s.status === "active" ? (
                        <ActionBtn
                          onClick={() => onLeave(s)}
                          title="Mark as left"
                          icon={<LogOut style={{ width: 13 }} />}
                          variant="danger"
                          disabled={blocked}
                          disabledReason={blocked ? PENDING_MSG : undefined}
                        />
                      ) : (
                        <ActionBtn
                          onClick={() => onRejoin(s)}
                          title="Rejoin"
                          icon={<LogIn style={{ width: 13 }} />}
                          variant="success"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={HEADERS.length}
                style={{ padding: "60px 24px", textAlign: "center" }}
              >
                <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>
                  🎓
                </div>
                <div
                  style={{
                    color: T.muted,
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  No students found
                </div>
                <div style={{ color: T.faint, fontSize: 12 }}>
                  Try adjusting your search or filters
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
