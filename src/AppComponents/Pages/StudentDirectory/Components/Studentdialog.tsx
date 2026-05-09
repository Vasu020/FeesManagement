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
  User,
  BookOpen,
  Wallet,
  AlertCircle,
  Save,
  Plus,
} from "lucide-react";
import { T } from "../utils/theme";
import { font } from "../utils/theme";
import type { Student, ClassItem, StudentFormData } from "../types";
import { BASE_URL } from "../utils/helpers";

// ─── Shared within this file ──────────────────────────────────────────────────
const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <Label style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>
      {label}
      {required && <span style={{ color: T.danger, marginLeft: 2 }}>*</span>}
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

type TabId = "personal" | "academic" | "fees";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "personal", label: "Personal", icon: <User style={{ width: 13 }} /> },
  {
    id: "academic",
    label: "Academic",
    icon: <BookOpen style={{ width: 13 }} />,
  },
  { id: "fees", label: "Fees", icon: <Wallet style={{ width: 13 }} /> },
];

const EMPTY: StudentFormData = {
  first_name: "",
  last_name: "",
  father_name: "",
  date_of_birth: "",
  gender: "",
  contact_phone: "",
  email: "",
  total_fees: 0,
  fees_paid: 0,
  balance: 0,
  late_fees_charges: 0,
  concession: 0,
  scholarship: 0,
  last_payment_date: "",
  due_date: "",
  enrollment_date: "",
  status: "active",
  standard: "",
  standard_id: "",
  roll_no: 0,
  active_date: "",
  inactive_date: "",
  current_session: "",
};

// ─── Props ────────────────────────────────────────────────────────────────────
export interface StudentDialogProps {
  open: boolean;
  onClose: () => void;
  editingStudent: Student | null;
  classes: ClassItem[];
  students: Student[];
  onSubmit: (data: StudentFormData, editingId?: number) => Promise<void>;
  error: string;
  setError: (e: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const StudentDialog = ({
  open,
  onClose,
  editingStudent,
  classes,
  students,
  onSubmit,
  error,
  setError,
}: StudentDialogProps) => {
  const [tab, setTab] = useState<TabId>("personal");
  const [form, setForm] = useState<StudentFormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [payingamount, setPayingamount] = useState<string>("0");
  const [feeRule, setFeeRule] = useState(null);

  useEffect(() => {
    setForm(
      editingStudent ? { ...EMPTY, ...editingStudent, standard_id: "" } : EMPTY,
    );
    setTab("personal");
    setError("");
  }, [editingStudent, open]);

  useEffect(() => {
    const fetchFeeRule = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}?type=late_fee`
        );
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setFeeRule(data.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch fee rule:", err);
      }
    };
    fetchFeeRule();
  }, []);

  function calculateLateFee(
    dueDate: string | null, // student's fee due date from DB
    feeRule: {
      due_day_of_month: number; // 10
      grace_days: number; // 5
      late_fee_amount: string; // "299.00"
      is_active: boolean;
    } | null,
  ): number {
    // If no rule or rule is inactive, no late fee
    if (!feeRule || !feeRule.is_active) return 0;

    const today = new Date();
    const lateFeeAmt = parseFloat(feeRule.late_fee_amount) || 0;
    const graceDays = feeRule.grace_days || 0;
    const dueDayOfMonth = feeRule.due_day_of_month || 1;

    // Build the actual due date using due_day_of_month for current month
    const due = dueDate
      ? new Date(dueDate)
      : new Date(today.getFullYear(), today.getMonth(), dueDayOfMonth);

    // Add grace period
    const deadlineWithGrace = new Date(due);
    deadlineWithGrace.setDate(deadlineWithGrace.getDate() + graceDays);

    // If today is still within grace period — no late fee
    if (today <= deadlineWithGrace) return 0;

    // Past grace period — apply late fee
    return lateFeeAmt;
  }

  const set = (name: string, value: any) => {
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  };
  const onInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    set(e.target.name, e.target.value);

  const onClassChange = (classId: string) => {
    const cls = classes.find((c: any) => c.id.toString() === classId);
    if (!cls) return;
    const maxRoll =
      students
        .filter((s) => s.standard === cls.classname)
        .reduce((m, s) => Math.max(m, s.roll_no), 0) + 1;
    const tf =
      parseFloat(cls.tutions) * 12 +
      parseFloat(cls.admission) +
      parseFloat(cls.annual) +
      parseFloat(cls.others);
    setForm((p) => ({
      ...p,
      standard: cls.classname,
      standard_id: cls.id.toString(),
      roll_no: maxRoll,
      total_fees: tf,
      balance: tf,
    }));
  };

  const submit = async () => {
    setLoading(true);
    try {
      await onSubmit(form, editingStudent?.student_id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        style={{
          background: T.surface,
          borderRadius: 18,
          maxWidth: 560,
          width: "95vw",
          fontFamily: font,
          padding: 0,
          overflow: "hidden",
          boxShadow: T.shadowXl,
          maxHeight: "98vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header + Tab nav ── */}
        <div
          style={{
            padding: "18px 24px 0",
            borderBottom: `1px solid ${T.line}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.accent,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  marginBottom: 2,
                }}
              >
                {editingStudent ? "Edit record" : "New record"}
              </div>
              <DialogTitle
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: T.text,
                  margin: 0,
                }}
              >
                {editingStudent
                  ? `${editingStudent.first_name} ${editingStudent.last_name}`
                  : "Add New Student"}
              </DialogTitle>
            </div>
          </div>

          <div style={{ display: "flex" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: tab === t.id ? 700 : 500,
                  color: tab === t.id ? T.accent : T.muted,
                  background: "transparent",
                  border: "none",
                  borderBottom:
                    tab === t.id
                      ? `2px solid ${T.accent}`
                      : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all .15s",
                  marginBottom: -1,
                  fontFamily: font,
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab body ── */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
          {/* Personal */}
          {tab === "personal" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <Field label="First Name" required>
                <Input
                  name="first_name"
                  value={form.first_name}
                  onChange={onInput}
                  placeholder="e.g. Arjun"
                  style={inp}
                />
              </Field>
              <Field label="Last Name">
                <Input
                  name="last_name"
                  value={form.last_name}
                  onChange={onInput}
                  placeholder="e.g. Sharma"
                  style={inp}
                />
              </Field>
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Father's Name" required>
                  <Input
                    name="father_name"
                    value={form.father_name}
                    onChange={onInput}
                    placeholder="e.g. Ramesh Sharma"
                    style={inp}
                  />
                </Field>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Email Address" required>
                  <Input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onInput}
                    placeholder="e.g. arjun@example.com"
                    style={inp}
                  />
                </Field>
              </div>
              <Field label="Phone">
                <Input
                  name="contact_phone"
                  type="tel"
                  value={form.contact_phone}
                  onChange={onInput}
                  placeholder="10-digit"
                  style={inp}
                />
              </Field>
              <Field label="Date of Birth">
                <Input
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={onInput}
                  style={inp}
                />
              </Field>
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Gender">
                  <Select
                    value={form.gender}
                    onValueChange={(v) => set("gender", v)}
                  >
                    <SelectTrigger style={{ ...inp, width: "100%" }}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {/* Academic */}
          {tab === "academic" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Enrollment Date" required>
                <Input
                  name="enrollment_date"
                  type="date"
                  value={form.enrollment_date}
                  onChange={onInput}
                  style={inp}
                />
              </Field>
              <Field label="Standard / Class" required>
                <Select
                  onValueChange={onClassChange}
                  value={form.standard_id || form.standard}
                >
                  <SelectTrigger style={{ ...inp, width: "100%" }}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.classname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Roll Number">
                <Input
                  name="roll_no"
                  type="number"
                  value={form.roll_no}
                  onChange={onInput}
                  style={inp}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onValueChange={(v) => set("status", v)}
                >
                  <SelectTrigger style={{ ...inp, width: "100%" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div
                style={{
                  background: T.infoBg,
                  border: `1px solid ${T.infoBorder}`,
                  borderRadius: 10,
                  padding: "10px 13px",
                  fontSize: 12,
                  color: T.info,
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <AlertCircle
                  style={{ width: 14, flexShrink: 0, marginTop: 1 }}
                />
                Selecting a class auto-calculates total fees and assigns the
                next available roll number.
              </div>
            </div>
          )}

          {/* Fees */}
          {tab === "fees" &&
            (() => {
              const total = parseFloat(`${form.total_fees}`) || 0;
              const paid = parseFloat(`${form.fees_paid}`) || 0;
              const balance = total - paid;
              const pct = total > 0 ? Math.round((paid / total) * 100) : 0;

              const lateFee = calculateLateFee(form.due_date, feeRule);

              const payAmt = parseFloat(payingamount || "0") || 0;
              const previewPaid = Math.min(
                Math.round((paid + payAmt) * 100) / 100,
                total,
              );
              const previewBalance =
                Math.round((total - previewPaid) * 100) / 100;
              const previewPct =
                total > 0 ? Math.round((previewPaid / total) * 100) : 0;
              const hasPreview = payAmt > 0;

              const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
              const fmt2 = (n: number) =>
                `₹${(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

              return (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {/* Summary Stats */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                    }}
                  >
                    {[
                      { label: "Total Fees", value: fmt(total), color: T.text },
                      {
                        label: "Fees Paid",
                        value: fmt(paid),
                        color: "#065F46",
                      },
                      {
                        label: "Balance Due",
                        value: fmt(balance),
                        color: balance > 0 ? "#B91C1C" : "#065F46",
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        style={{
                          borderRadius: 8,
                          padding: "10px 12px",
                          border: `0.5px solid ${T.border}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: T.muted,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: 4,
                          }}
                        >
                          {label}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 11, color: T.muted }}>
                        Payment progress
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: T.accent,
                        }}
                      >
                        {pct}% paid
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: T.border,
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          borderRadius: 99,
                          background: T.accent,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Late Fees */}
                  {/* Late Fees Charges */}
                  <div
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                      lateFee > 0
                        ? "bg-amber-50 border-amber-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-700">
                      Late Fees Charges
                    </span>
                    <span
                      className={`text-sm font-bold ${lateFee > 0 ? "text-amber-600" : "text-slate-400"}`}
                    >
                      {lateFee > 0
                        ? `${fmt(lateFee)} — applied automatically`
                        : `₹0.00 — no late fee`}
                    </span>
                  </div>

                  {/* Concession + Scholarship */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    {[
                      {
                        key: "concession",
                        label: "Concession",
                        bg: "#F5F3FF",
                        border: "#DDD6FE",
                        labelColor: "#6D28D9",
                        badgeBg: "#EDE9FE",
                        badgeColor: "#5B21B6",
                        badgeBorder: "#C4B5FD",
                      },
                      {
                        key: "scholarship",
                        label: "Scholarship",
                        bg: "#ECFDF5",
                        border: "#A7F3D0",
                        labelColor: "#065F46",
                        badgeBg: "#D1FAE5",
                        badgeColor: "#065F46",
                        badgeBorder: "#6EE7B7",
                      },
                    ].map(
                      ({
                        key,
                        label,
                        bg,
                        border,
                        labelColor,
                        badgeBg,
                        badgeColor,
                        badgeBorder,
                      }) => (
                        <div
                          key={key}
                          style={{
                            background: bg,
                            border: `0.5px solid ${border}`,
                            borderRadius: 10,
                            padding: "12px 14px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                color: labelColor,
                                marginBottom: 3,
                              }}
                            >
                              {label}
                            </div>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: T.text,
                              }}
                            >
                              {fmt2(form[key])}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              padding: "3px 9px",
                              borderRadius: 20,
                              fontWeight: 500,
                              background: badgeBg,
                              color: badgeColor,
                              border: `0.5px solid ${badgeBorder}`,
                            }}
                          >
                            External
                          </span>
                        </div>
                      ),
                    )}
                  </div>

                  <div style={{ height: "0.5px", background: T.border }} />

                  {/* Record a Payment */}
                  <div
                    style={{
                      border: `0.5px solid ${T.border}`,
                      borderRadius: 10,
                      padding: "13px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: T.text,
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: T.accent,
                          display: "inline-block",
                        }}
                      />
                      Record a payment
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                        marginBottom: hasPreview ? 10 : 0,
                      }}
                    >
                      <Field label="Amount Paying (₹)">
                        <Input
                          name="_payAmount"
                          type="number"
                          placeholder="e.g. 5000"
                          value={payingamount || "0"}
                          onChange={(e) => setPayingamount(e.target.value)}
                          style={inp}
                        />
                      </Field>
                      <Field label="Payment Date">
                        <Input
                          name="last_payment_date"
                          type="date"
                          value={form.last_payment_date}
                          onChange={onInput}
                          style={inp}
                        />
                      </Field>
                    </div>

                    {/* Live Preview Chips */}
                    {hasPreview && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 8,
                        }}
                      >
                        {[
                          { label: "Fees Paid →", val: fmt(previewPaid) },
                          { label: "Balance →", val: fmt(previewBalance) }, // ← use previewBalance, not total - previewPaid inline
                          { label: "Progress →", val: `${previewPct}%` },
                        ].map(({ label, val }) => (
                          <div
                            key={label}
                            style={{
                              textAlign: "center",
                              padding: "7px 6px",
                              borderRadius: 8,
                              background: "#EDE9FE",
                              border: "0.5px solid #C4B5FD",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 9,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                color: "#6D28D9",
                                marginBottom: 2,
                              }}
                            >
                              {label}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#5B21B6",
                              }}
                            >
                              {val}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <Field label="Last Payment Date">
                      <Input
                        name="last_payment_date"
                        type="date"
                        value={form.last_payment_date}
                        readOnly
                        style={{
                          ...inp,
                          background: T.bg,
                          color: T.muted,
                          cursor: "default",
                        }}
                      />
                    </Field>
                    <Field label="Fee Due Date">
                      <Input
                        name="due_date"
                        type="date"
                        value={form.due_date}
                        onChange={onInput}
                        style={inp}
                      />
                    </Field>
                  </div>
                </div>
              );
            })()}
        </div>

        {/* ── Error ── */}
        {error && (
          <div
            style={{
              margin: "0 24px 4px",
              display: "flex",
              gap: 7,
              alignItems: "center",
              background: T.dangerBg,
              border: `1px solid ${T.dangerBorder}`,
              borderRadius: 9,
              padding: "9px 12px",
              color: T.danger,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            <AlertCircle style={{ width: 13, flexShrink: 0 }} /> {error}
          </div>
        )}

        {/* ── Footer ── */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: `1px solid ${T.line}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: T.subtle,
            flexShrink: 0,
          }}
        >
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 6 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  width: tab === t.id ? 18 : 6,
                  height: 6,
                  borderRadius: 99,
                  padding: 0,
                  border: "none",
                  background: tab === t.id ? T.accent : T.line,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button
              variant="outline"
              onClick={onClose}
              style={{ borderRadius: 9, fontSize: 13, height: 36 }}
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={loading}
              style={{
                background: T.accent,
                color: "#fff",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                height: 36,
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 2px 10px rgba(79,70,229,.3)",
              }}
            >
              {editingStudent ? (
                <>
                  <Save style={{ width: 14, marginRight: 6 }} />
                  {loading ? "Saving…" : "Save Changes"}
                </>
              ) : (
                <>
                  <Plus style={{ width: 14, marginRight: 6 }} />
                  {loading ? "Adding…" : "Add Student"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
