import { useState, useEffect } from "react";
import moment from "moment";
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
import { User, BookOpen, Wallet, AlertCircle, Save, Plus } from "lucide-react";
import { T } from "../utils/theme";
import { font } from "../utils/theme";
import type {
  Student,
  ClassItem,
  FeeRule,
  LateFeePaymentSummary,
} from "../types";
import { calculateLateFeeCharge } from "../utils/helpers";
import { feeRulesApi } from "@/AppComponents/Utilities/apis/api";
import { Printer } from "lucide-react";
import { printFeesReceipt } from "@/AppComponents/Hooks/printFeesReceipt";
import { calcEffective } from "../utils/helpers";
import { getAcademicSession } from "@/AppComponents/Utilities/ReusableFn";

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

const sectionStyle = {
  border: `1px solid ${T.line}`,
  borderRadius: 12,
  padding: 18,
};

const SectionHeading = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 16,
    }}
  >
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 9,
        background: T.infoBg,
        color: T.accent,
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
    <div>
      <h3 style={{ margin: 0, color: T.text, fontSize: 14, fontWeight: 700 }}>
        {title}
      </h3>
      <p style={{ margin: "3px 0 0", color: T.muted, fontSize: 12 }}>
        {description}
      </p>
    </div>
  </div>
);

const getPresetDueDate = (
  referenceDate: string | null | undefined,
  dueDay: number | undefined,
): string => {
  const dateParts = referenceDate?.slice(0, 10).split("-").map(Number);
  const referenceYear = dateParts?.[0];
  const referenceMonth = dateParts?.[1];
  const referenceDay = dateParts?.[2];
  const hasReferenceDate =
    dateParts?.length === 3 &&
    dateParts.every(Number.isFinite) &&
    referenceYear !== undefined &&
    referenceYear > 0 &&
    referenceMonth !== undefined &&
    referenceMonth >= 1 &&
    referenceMonth <= 12 &&
    referenceDay !== undefined &&
    referenceDay >= 1 &&
    referenceDay <= new Date(referenceYear, referenceMonth, 0).getDate();
  const today = new Date();
  const year = hasReferenceDate ? referenceYear : today.getFullYear();
  const month = hasReferenceDate ? referenceMonth : today.getMonth() + 1;
  const configuredDueDay = Number(dueDay);
  const day =
    Number.isInteger(configuredDueDay) && configuredDueDay > 0
      ? configuredDueDay
      : hasReferenceDate
        ? referenceDay
        : 1;
  const lastDay = new Date(year, month, 0).getDate();

  return `${year}-${String(month).padStart(2, "0")}-${String(
    Math.min(day, lastDay),
  ).padStart(2, "0")}`;
};

const rawStudent: Student = {
  first_name: "",
  last_name: "",
  father_name: "",
  date_of_birth: "",
  gender: "",
  contact_phone: "",
  email: "",
  total_fees: 0,
  student_id: 0,
  fees_paid: 0,
  balance: 0,
  late_fees_charges: 0,
  late_fees_paid: 0,
  late_fees_balance: 0,
  last_late_fee_payment_date: null,
  concession: 0,
  scholarship: 0,
  last_payment_date: "",
  due_date: "",
  enrollment_date: "",
  status: "active",
  standard: "",
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
  onSubmit: (data: Student, editingId?: number) => Promise<void>;
  onRecordLateFeePayment: (
    studentId: number,
    amount: number,
    paymentDate: string,
  ) => Promise<LateFeePaymentSummary | null>;
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
  onRecordLateFeePayment,
  error,
  setError,
}: StudentDialogProps) => {
  const [form, setForm] = useState<Student>(rawStudent);
  const [loading, setLoading] = useState(false);
  const [payingamount, setPayingamount] = useState<string>("0");
  const [paymentDate, setPaymentDate] = useState(moment().format("YYYY-MM-DD"));
  const [lateFeePaymentAmount, setLateFeePaymentAmount] = useState("");
  const [lateFeePaymentDate, setLateFeePaymentDate] = useState(
    moment().format("YYYY-MM-DD"),
  );
  const [lateFeePaymentLoading, setLateFeePaymentLoading] = useState(false);
  const [lateFeePaymentError, setLateFeePaymentError] = useState("");
  const [feeRule, setFeeRule] = useState<FeeRule | null>(null);

  useEffect(() => {
    const fetchFeeRule = async () => {
      try {
        const response = await feeRulesApi.getAll("late_fee");
        if (response.success) {
          const activeRule = response.data.find(
            (rule) => (rule as FeeRule).is_active,
          );
          setFeeRule(activeRule ? (activeRule as FeeRule) : null);
        }
      } catch (err) {
        console.error("Failed to fetch fee rule:", err);
      }
    };
    fetchFeeRule();
  }, []);

  useEffect(() => {
    const todayStr = moment().format("YYYY-MM-DD");

    if (editingStudent) {
      const dueDateStr = getPresetDueDate(
        editingStudent.due_date,
        feeRule?.due_day_of_month,
      );
      const calculatedLateFees = Math.max(
        Number(editingStudent.late_fees_charges ?? 0),
        calculateLateFeeCharge(dueDateStr, feeRule),
      );

      setForm({
        ...rawStudent,
        ...editingStudent,
        active_date: moment(editingStudent.active_date).isValid()
          ? moment(editingStudent.active_date).format("YYYY-MM-DD")
          : editingStudent.status === "active"
            ? editingStudent.enrollment_date || todayStr
            : "",
        due_date: dueDateStr,
        late_fees_charges: calculatedLateFees,
      });
    } else {
      const dueDateStr = getPresetDueDate(
        todayStr,
        feeRule?.due_day_of_month,
      );
      setForm({
        ...rawStudent,
        enrollment_date: todayStr,
        active_date: todayStr,
        current_session: getAcademicSession(todayStr),
        due_date: dueDateStr,
        late_fees_charges: calculateLateFeeCharge(dueDateStr, feeRule),
      });
    }
    setError("");
    setPaymentDate(todayStr);
    setLateFeePaymentAmount("");
    setLateFeePaymentDate(todayStr);
    setLateFeePaymentError("");
  }, [editingStudent, open, feeRule, setError]);

  function calculateLateFee(
    dueDate: string | null, // student's fee due date from DB
    feeRule: {
      due_day_of_month: number; // 10
      grace_days: number; // 5
      late_fee_amount: string; // "299.00"
      is_active: boolean;
    } | null,
  ): number {
    return calculateLateFeeCharge(dueDate, feeRule);
  }

  const set = (name: string, value: any) => {
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  };
  const onInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    set(e.target.name, e.target.value);

  const onClassChange = (selectedClassname: string) => {
    const cls = classes.find((c: any) => c.classname === selectedClassname);
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
      standard: cls.classname, // ← This is enough
      roll_no: maxRoll,
      total_fees: tf,
      balance: Math.max(
        calcEffective({ ...p, total_fees: tf }) - Number(p.fees_paid || 0),
        0,
      ),
    }));
  };

  const submit = async () => {
    if (
      form.status === "active" &&
      !moment(form.active_date, "YYYY-MM-DD", true).isValid()
    ) {
      setError("Enter a valid active date for an active student.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form, editingStudent?.student_id);
    } finally {
      setLoading(false);
    }
  };

  const recordLateFeePayment = async (
    pendingLateFee: number,
  ): Promise<void> => {
    const amount = Number(lateFeePaymentAmount);
    if (!editingStudent?.student_id) {
      setLateFeePaymentError("Save the student before recording a payment.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > pendingLateFee) {
      setLateFeePaymentError(
        `Enter an amount between ₹0.01 and ₹${pendingLateFee.toLocaleString(
          "en-IN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        )}.`,
      );
      return;
    }
    if (!lateFeePaymentDate) {
      setLateFeePaymentError("Select the payment date.");
      return;
    }

    setLateFeePaymentLoading(true);
    setLateFeePaymentError("");
    try {
      const result = await onRecordLateFeePayment(
        editingStudent.student_id,
        amount,
        lateFeePaymentDate,
      );
      if (result) {
        setForm((current) => ({
          ...current,
          late_fees_charges: result.late_fees_charges,
          late_fees_paid: result.late_fees_paid,
          late_fees_balance: result.late_fees_balance,
          last_late_fee_payment_date: result.last_late_fee_payment_date,
        }));
        setLateFeePaymentAmount("");
      }
    } finally {
      setLateFeePaymentLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        style={{
          background: T.surface,
          borderRadius: 18,
          maxWidth: 960,
          width: "96vw",
          fontFamily: font,
          padding: 0,
          overflow: "hidden",
          boxShadow: T.shadowXl,
          maxHeight: "95vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}

        <div
          style={{
            padding: "18px 24px 0",
            borderBottom: `1px solid ${T.line}`,
            flexShrink: 0,
          }}
        >
          {/* Title row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
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
                  padding: 0,
                }}
              >
                {editingStudent
                  ? `${editingStudent.first_name} ${editingStudent.last_name}`
                  : "Add New Student"}
              </DialogTitle>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingRight: 32,
              }}
            >
              {editingStudent && (
                <button
                  title="Print Fees Receipt"
                  onClick={() => printFeesReceipt(editingStudent)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 9px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: "none",
                    border: `1px solid ${T.border}`,
                    color: T.muted,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  <Printer size={12} />
                  Receipt
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ── Full student view ── */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Personal */}
          <section style={sectionStyle}>
            <SectionHeading
              icon={<User size={16} />}
              title="Personal Details"
              description="Student identity and contact information"
            />
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
                  value={form?.first_name}
                  onChange={onInput}
                  placeholder="e.g. Arjun"
                  style={inp}
                />
              </Field>
              <Field label="Last Name">
                <Input
                  name="last_name"
                  value={form?.last_name}
                  onChange={onInput}
                  placeholder="e.g. Sharma"
                  style={inp}
                />
              </Field>
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Father's Name" required>
                  <Input
                    name="father_name"
                    value={form?.father_name}
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
                    value={form?.email}
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
                  value={form?.contact_phone}
                  onChange={onInput}
                  placeholder="10-digit"
                  style={inp}
                />
              </Field>
              <Field label="Date of Birth">
                <Input
                  name="date_of_birth"
                  type="date"
                  value={form?.date_of_birth}
                  onChange={onInput}
                  style={inp}
                />
              </Field>
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Gender">
                  <Select
                    value={form?.gender}
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
          </section>

          {/* Academic */}
          <section style={sectionStyle}>
            <SectionHeading
              icon={<BookOpen size={16} />}
              title="Academics"
              description="Enrollment, class, roll number, and student status"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              <Field label="Enrollment Date" required>
                <Input
                  name="enrollment_date"
                  type="date"
                  value={form?.enrollment_date}
                  onChange={onInput}
                  disabled={!editingStudent}
                  style={inp}
                />
              </Field>
              <Field label="Standard / Class" required>
                <Select
                  onValueChange={onClassChange}
                  value={form?.standard || ""} // ← classname
                >
                  <SelectTrigger style={{ ...inp, width: "100%" }}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c: any) => (
                      <SelectItem key={c.id} value={c.classname}>
                        {" "}
                        {/* ← Use classname here */}
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
                  value={form?.roll_no}
                  onChange={onInput}
                  style={inp}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form?.status}
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
                  gridColumn: "1 / -1",
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
          </section>

          {/* Fees */}
          {(() => {
              const total = parseFloat(`${form?.total_fees}`) || 0;
              const paid = parseFloat(`${form?.fees_paid}`) || 0;
              const concession = parseFloat(`${form?.concession}`) || 0;
              const scholarship = parseFloat(`${form?.scholarship}`) || 0;
              const lateFee = Math.max(
                Number(form?.late_fees_charges ?? 0),
                calculateLateFee(form?.due_date, feeRule),
              );
              const lateFeesPaid = Number(form?.late_fees_paid ?? 0);
              const lateFeeBalance = Math.max(lateFee - lateFeesPaid, 0);
              const effective_total = calcEffective({
                ...form,
                total_fees: total,
                late_fees_charges: lateFee,
              });
              const balance = Math.max(effective_total - paid, 0);
              const pct =
                effective_total > 0
                  ? Math.min(
                      Math.max(Math.round((paid / effective_total) * 100), 0),
                      100,
                    )
                  : 0;

              const payAmt = parseFloat(payingamount || "0") || 0;
              const previewPaid = Math.min(
                Math.round((paid + payAmt) * 100) / 100,
                effective_total,
              );
              const previewBalance = Math.max(
                Math.round((effective_total - previewPaid) * 100) / 100,
                0,
              );
              const previewPct =
                effective_total > 0
                  ? Math.min(
                      Math.max(
                        Math.round((previewPaid / effective_total) * 100),
                        0,
                      ),
                      100,
                    )
                  : 0;
              const hasPreview = payAmt > 0;

              const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
              const fmt2 = (n: number) =>
                `₹${(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

              // ✅ FIX: Apply payment into form state
              const handleApplyPayment = () => {
                if (payAmt <= 0) return;
                const newPaid = Math.min(paid + payAmt, effective_total);
                setForm((current) => ({
                  ...current,
                  fees_paid: newPaid,
                  last_payment_date: paymentDate,
                }));
                setError("");
                setPayingamount("0");
              };

              return (
                <section style={sectionStyle}>
                  <SectionHeading
                    icon={<Wallet size={16} />}
                    title="Fees"
                    description="Fee summary, concessions, and payment tracking"
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                  {/* Summary Stats */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {[
                      { label: "Total Fees", value: fmt2(total), color: T.text },
                      ...(concession > 0
                        ? [
                            {
                              label: "Concession",
                              value: fmt2(concession),
                              color: "#6D28D9",
                            },
                          ]
                        : []),
                      ...(scholarship > 0
                        ? [
                            {
                              label: "Scholarship",
                              value: fmt2(scholarship),
                              color: "#047857",
                            },
                          ]
                        : []),
                      {
                        label: "Fees Paid",
                        value: fmt2(paid),
                        color: "#065F46",
                      },
                      {
                        label: "Balance Due",
                        value: fmt2(balance),
                        color: balance > 0 ? "#B91C1C" : "#065F46",
                      },
                      {
                        label: "Fine",
                        value: fmt2(lateFee),
                        color: "#92400E",
                      },
                      {
                        label: "Fine Paid",
                        value: fmt2(lateFeesPaid),
                        color: "#065F46",
                      },
                      {
                        label: "Fine Balance",
                        value: fmt2(lateFeeBalance),
                        color: lateFeeBalance > 0 ? "#B91C1C" : "#065F46",
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
                  <div style={{ borderRadius: 10, padding: "12px 14px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 11, color: T.muted }}>
                        Net fee payment progress
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

                  {/* Late fees accrue separately and have their own payment ledger. */}
                  {lateFee > 0 && (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        background: "#FFFBEB",
                        border: "0.5px solid #FCD34D",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 600 }}>
                          Accrued late fees
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#92400E",
                          }}
                        >
                          {fmt2(lateFee)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          color: T.muted,
                        }}
                      >
                        <span>Paid: {fmt2(lateFeesPaid)}</span>
                        <span style={{ fontWeight: 700, color: "#92400E" }}>
                          Pending: {fmt2(lateFeeBalance)}
                        </span>
                      </div>
                      {editingStudent && lateFeeBalance > 0 && (
                        <>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 10,
                            }}
                          >
                            <Field label="Late Fee Payment (₹)">
                              <Input
                                type="number"
                                min="0.01"
                                max={lateFeeBalance}
                                step="0.01"
                                value={lateFeePaymentAmount}
                                onChange={(e) =>
                                  setLateFeePaymentAmount(e.target.value)
                                }
                                style={inp}
                              />
                            </Field>
                            <Field label="Payment Date">
                              <Input
                                type="date"
                                value={lateFeePaymentDate}
                                max={moment().format("YYYY-MM-DD")}
                                onChange={(e) =>
                                  setLateFeePaymentDate(e.target.value)
                                }
                                style={inp}
                              />
                            </Field>
                          </div>
                          <Button
                            type="button"
                            disabled={lateFeePaymentLoading}
                            onClick={() =>
                              void recordLateFeePayment(lateFeeBalance)
                            }
                            style={{
                              width: "100%",
                              background: "#B45309",
                              color: "#fff",
                              borderRadius: 8,
                            }}
                          >
                            {lateFeePaymentLoading
                              ? "Recording payment…"
                              : "Record Late Fee Payment"}
                          </Button>
                        </>
                      )}
                      {lateFeeBalance === 0 && (
                        <span style={{ fontSize: 11, color: "#047857" }}>
                          Late fees paid in full
                        </span>
                      )}
                      {!editingStudent && lateFeeBalance > 0 && (
                        <span style={{ fontSize: 11, color: T.muted }}>
                          Save the student before recording a late-fee payment.
                        </span>
                      )}
                      {lateFeePaymentError && (
                        <span style={{ fontSize: 11, color: T.danger }}>
                          {lateFeePaymentError}
                        </span>
                      )}
                    </div>
                  )}

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
                        marginBottom: 10,
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
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          style={inp}
                        />
                      </Field>
                    </div>

                    {/* Live Preview */}
                    {hasPreview && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        {[
                          { label: "Fees Paid →", val: fmt(previewPaid) },
                          { label: "Balance →", val: fmt(previewBalance) },
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

                    {/* ✅ FIX: Apply Payment button commits payingamount → fees_paid */}
                    {hasPreview && (
                      <button
                        onClick={handleApplyPayment}
                        style={{
                          width: "100%",
                          padding: "9px 0",
                          borderRadius: 8,
                          background: T.accent,
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 13,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Apply ₹{payAmt.toLocaleString("en-IN")}
                      </button>
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
                        value={form?.last_payment_date}
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
                        value={form?.due_date}
                        readOnly
                        aria-readonly="true"
                        style={{
                          ...inp,
                          background: T.bg,
                          color: T.muted,
                          cursor: "default",
                        }}
                      />
                    </Field>
                   
                  </div>
                  </div>
                </section>
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
          <span style={{ color: T.muted, fontSize: 12 }}>
            Personal, academic, and fee details
          </span>
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
