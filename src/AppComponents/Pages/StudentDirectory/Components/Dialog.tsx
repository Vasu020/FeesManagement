/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  LogOut,
  LogIn,
  Award,
  Tag,
  AlertCircle,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import moment from "moment";
import { T, font } from "../utils/theme";
import { fmtINR, getFeeRules } from "../utils/helpers";
import type {
  Student,
  ClassItem,
  LeaveRejoinMode,
  DiscountMode,
} from "../types";
import { getLastFourSessions } from "@/AppComponents/Utilities/ReusableFn";

// ─── Shared shell — keeps all three dialogs visually consistent ───────────────
const DialogShell = ({
  open,
  onClose,
  headerBg,
  iconBg,
  icon,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  headerBg: string;
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent
      style={{
        background: T.surface,
        borderRadius: 16,
        maxWidth: 460,
        fontFamily: font,
        padding: 0,
        overflow: "hidden",
        boxShadow: T.shadowXl,
      }}
    >
      {/* Coloured header band */}
      <div
        style={{
          background: headerBg,
          padding: "20px 24px 18px",
          borderBottom: `1px solid ${T.line}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: subtitle ? 4 : 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <DialogTitle
            style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: 0 }}
          >
            {title}
          </DialogTitle>
        </div>
        {subtitle && (
          <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{subtitle}</p>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {children}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "14px 24px",
          borderTop: `1px solid ${T.line}`,
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          background: T.subtle,
        }}
      >
        {footer}
      </div>
    </DialogContent>
  </Dialog>
);

// ─── Shared label helper ──────────────────────────────────────────────────────
const FL = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <Label style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>
      {label}
    </Label>
    {children}
  </div>
);

const inp = {
  borderRadius: 9,
  fontSize: 13,
  height: 38,
  border: `1px solid ${T.line}`,
  fontFamily: font,
};

// ─── 1. Promote Dialog ────────────────────────────────────────────────────────
export interface PromoteDialogProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
  classes: ClassItem[];
  onPromote: (id: number, cls: string, session: string) => void;
}

export const PromoteDialog = ({
  open,
  onClose,
  student,
  classes,
  onPromote,
}: PromoteDialogProps) => {
  const sessions = getLastFourSessions();
  const [newClass, setNewClass] = useState("");
  const [newSession, setNewSession] = useState(sessions[0]);

  useEffect(() => {
    if (!student || !classes.length) return;
    const idx = classes.findIndex((c) => c.classname === student.standard);
    setNewClass(
      idx >= 0 && idx < classes.length - 1
        ? classes[idx + 1].classname
        : (student?.standard ?? ""),
    );
  }, [student, classes]);

  if (!student) return null;

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      headerBg={`linear-gradient(135deg, ${T.accentBg}, #E0E7FF)`}
      iconBg={T.accent}
      icon={<TrendingUp style={{ width: 18, color: "#fff" }} />}
      title="Promote Student"
      subtitle="Move student to the next academic class and session"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ borderRadius: 9, fontSize: 13, height: 36 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onPromote(student.student_id, newClass, newSession);
              onClose();
            }}
            style={{
              background: T.accent,
              color: "#fff",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              height: 36,
            }}
          >
            <TrendingUp style={{ width: 14, marginRight: 6 }} /> Confirm
            Promotion
          </Button>
        </>
      }
    >
      {/* Student summary card */}
      <div
        style={{
          background: T.subtle,
          border: `1px solid ${T.line}`,
          borderRadius: 10,
          padding: "12px 15px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: T.accentBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <GraduationCap style={{ width: 18, color: T.accent }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>
            {student.first_name} {student.last_name}
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
            Currently in{" "}
            <span
              style={{
                background: T.accentBg,
                color: T.accent,
                borderRadius: 4,
                padding: "1px 6px",
                fontWeight: 700,
                border: `1px solid ${T.accentLight}`,
              }}
            >
              {student.standard ?? "—"}
            </span>
          </div>
        </div>
      </div>

      <FL label="Promote to Class">
        <Select value={newClass} onValueChange={setNewClass}>
          <SelectTrigger style={{ ...inp, width: "100%" }}>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.classname}>
                {c.classname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FL>

      <FL label="New Academic Session">
        <Select value={newSession} onValueChange={setNewSession}>
          <SelectTrigger style={{ ...inp, width: "100%" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FL>
    </DialogShell>
  );
};

// ─── 2. Leave / Rejoin Dialog ─────────────────────────────────────────────────
export interface LeaveRejoinDialogProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
  mode: LeaveRejoinMode;
  onConfirm: (id: number, date: string, mode: LeaveRejoinMode) => void;
}

export const LeaveRejoinDialog = ({
  open,
  onClose,
  student,
  mode,
  onConfirm,
}: LeaveRejoinDialogProps) => {
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const leave = mode === "leave";

  if (!student) return null;

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      headerBg={
        leave
          ? `linear-gradient(135deg, ${T.dangerBg}, #FFF1F0)`
          : `linear-gradient(135deg, ${T.okBg}, #ECFFF5)`
      }
      iconBg={leave ? T.danger : T.ok}
      icon={
        leave ? (
          <LogOut style={{ width: 18, color: "#fff" }} />
        ) : (
          <LogIn style={{ width: 18, color: "#fff" }} />
        )
      }
      title={leave ? "Mark Student as Left" : "Rejoin School"}
      subtitle={
        leave
          ? "This will set the student's status to inactive."
          : "This will re-activate the student's enrollment."
      }
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ borderRadius: 9, fontSize: 13, height: 36 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(student.student_id, date, mode);
              onClose();
            }}
            style={{
              background: leave ? T.danger : T.ok,
              color: "#fff",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              height: 36,
            }}
          >
            {leave ? (
              <>
                <LogOut style={{ width: 14, marginRight: 6 }} />
                Confirm Leave
              </>
            ) : (
              <>
                <LogIn style={{ width: 14, marginRight: 6 }} />
                Confirm Rejoin
              </>
            )}
          </Button>
        </>
      }
    >
      {/* Student summary card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: T.subtle,
          border: `1px solid ${T.line}`,
          borderRadius: 10,
          padding: "12px 15px",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: leave ? T.dangerBg : T.okBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {leave ? (
            <AlertCircle style={{ width: 18, color: T.danger }} />
          ) : (
            <CheckCircle style={{ width: 18, color: T.ok }} />
          )}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>
            {student.first_name} {student.last_name}
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
            {student.standard} · Roll #{student.roll_no}
          </div>
        </div>
      </div>

      <FL label={leave ? "Leaving Date" : "Rejoining Date"}>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={inp}
        />
      </FL>
    </DialogShell>
  );
};

export interface ConfigureDiscountDialogProps {
  open: boolean;
  onClose: () => void;
  mode: DiscountMode;
  student: Student | null;
  onApply: (id: number, field: DiscountMode, amount: number) => void;
}

// Types
interface FeeRule {
  id: number;
  rule_type: "concession" | "scholarship";
  preset_name: string;
  value_type: "percentage" | "flat";
  value: string;
  applicable_classes: string[];
  is_active: boolean;
}

interface FeeRuleOption {
  label: string;
  value: string; // will use rule id as string
  desc: string;
  kind: "pct" | "fixed";
  amt: number;
}


function useFeeRules(mode: "scholarship" | "concession" | undefined) {
  const [opts, setOpts] = useState<FeeRuleOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mode) return;
    setLoading(true);

    getFeeRules(mode)         // ← uses your apiFetch with absolute URL
      .then((res) => {
        const noneOpt: FeeRuleOption = {
          label: mode === "scholarship" ? "No Scholarship" : "No Concession",
          value: "none",
          desc: "Full fees apply",
          kind: "fixed",
          amt: 0,
        };

        const fetched: FeeRuleOption[] = (res.data as FeeRule[])
          .filter((r) => r.is_active)
          .map((r) => {
            const isPct = r.value_type === "percentage";
            const amt = parseFloat(r.value);
            return {
              label: r.preset_name,
              value: String(r.id),
              desc: isPct ? `${amt}% fee waiver` : `Flat ₹${amt} waiver`,
              kind: isPct ? "pct" : "fixed",
              amt,
            };
          });

        setOpts([noneOpt, ...fetched]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mode]);

  return { opts, loading };
}

export const ConfigureDiscountDialog = ({
  open,
  onClose,
  mode,
  student,
  onApply,
}: ConfigureDiscountDialogProps) => {

  const isSchol = mode === "scholarship";
  const [selected, setSelected] = useState("none");
  const { opts, loading } = useFeeRules(mode);
  
  if (!student) return null;
  const total = Number(student.total_fees ?? 0);
  const opt = opts.find((o) => o.value === selected);

  const disc =
    !opt || opt.value === "none"
      ? 0
      : opt.kind === "pct"
        ? Math.round((total * opt.amt) / 100)
        : opt.amt;

  const after = Math.max(total - disc, 0);

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      headerBg={
        isSchol
          ? `linear-gradient(135deg, ${T.accentBg}, #E0E7FF)`
          : "linear-gradient(135deg, #F5F3FF, #EDE9FE)"
      }
      iconBg={isSchol ? T.accent : "#7C3AED"}
      icon={
        isSchol ? (
          <Award style={{ width: 18, color: "#fff" }} />
        ) : (
          <Tag style={{ width: 18, color: "#fff" }} />
        )
      }
      title={`Configure ${isSchol ? "Scholarship" : "Concession"}`}
      subtitle={`For: ${student.first_name} ${student.last_name} · ${student.standard}`}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ borderRadius: 9, fontSize: 13, height: 36 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onApply(student.student_id, mode, disc);
              onClose();
            }}
            style={{
              background: isSchol ? T.accent : "#7C3AED",
              color: "#fff",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              height: 36,
            }}
          >
            <CheckCircle style={{ width: 14, marginRight: 6 }} />
            Apply {isSchol ? "Scholarship" : "Concession"}
          </Button>
        </>
      }
    >
      <FL label={`Select ${isSchol ? "Scholarship" : "Concession"} Type`}>
        <Select value={selected} onValueChange={setSelected} disabled={loading}>
          <SelectTrigger style={{ ...inp, width: "100%", height: 40 }}>
            {loading ? (
              <span style={{ color: T.faint }}>Loading…</span>
            ) : (
              <SelectValue />
            )}
          </SelectTrigger>
          <SelectContent>
            {opts.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                <div style={{ fontWeight: 600 }}>{o.label}</div>
                <div style={{ fontSize: 11, color: T.faint }}>{o.desc}</div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FL>

      {/* Live fee breakdown */}
      <div
        style={{
          background: T.subtle,
          border: `1px solid ${T.line}`,
          borderRadius: 12,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.muted,
            textTransform: "uppercase",
            letterSpacing: ".06em",
          }}
        >
          Fee Breakdown Preview
        </div>
        {[
          {
            label: "Total Fees",
            val: fmtINR(total),
            color: T.text,
            bold: false,
          },
          {
            label: "Discount Applied",
            val: disc > 0 ? `− ${fmtINR(disc)}` : "—",
            color: disc > 0 ? T.danger : T.faint,
            bold: false,
          },
          {
            label: "Amount After Discount",
            val: fmtINR(after),
            color: T.ok,
            bold: true,
          },
        ].map(({ label, val, color, bold }) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12.5, color: T.secondary }}>{label}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: bold ? 800 : 600,
                color,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {val}
            </span>
          </div>
        ))}
      </div>
    </DialogShell>
  );
};
