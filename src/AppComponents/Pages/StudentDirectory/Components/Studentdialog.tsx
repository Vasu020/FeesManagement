/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, BookOpen, Wallet, AlertCircle, Save, Plus, X } from "lucide-react";
import { T } from "../utils/theme";
import { font } from "../utils/theme";
import type { Student, ClassItem, StudentFormData } from "../types";

// ─── Shared within this file ──────────────────────────────────────────────────
const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <Label style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>
      {label}{required && <span style={{ color: T.danger, marginLeft: 2 }}>*</span>}
    </Label>
    {children}
  </div>
);

const inp = { borderRadius: 9, fontSize: 13, height: 38, border: `1px solid ${T.line}`, fontFamily: font };

type TabId = "personal" | "academic" | "fees";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "personal", label: "Personal", icon: <User     style={{ width: 13 }} /> },
  { id: "academic", label: "Academic", icon: <BookOpen style={{ width: 13 }} /> },
  { id: "fees",     label: "Fees",     icon: <Wallet   style={{ width: 13 }} /> },
];

const EMPTY: StudentFormData = {
  first_name: "", last_name: "", father_name: "", date_of_birth: "", gender: "",
  contact_phone: "", email: "", total_fees: 0, fees_paid: 0, balance: 0,
  late_fees_charges: 0, concession: 0, scholarship: 0, last_payment_date: "",
  due_date: "", enrollment_date: "", status: "active", standard: "", standard_id: "",
  roll_no: 0, active_date: "", inactive_date: "", current_session: "",
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
  open, onClose, editingStudent, classes, students, onSubmit, error, setError,
}: StudentDialogProps) => {
  const [tab, setTab]         = useState<TabId>("personal");
  const [form, setForm]       = useState<StudentFormData>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(editingStudent ? { ...EMPTY, ...editingStudent, standard_id: "" } : EMPTY);
    setTab("personal");
    setError("");
  }, [editingStudent, open]);

  const set = (name: string, value: any) => {
    setForm(p => ({ ...p, [name]: value }));
    setError("");
  };
  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.name, e.target.value);

  const onClassChange = (classId: string) => {
    const cls = classes.find((c: any) => c.id.toString() === classId);
    if (!cls) return;
    const maxRoll = students
      .filter(s => s.standard === cls.classname)
      .reduce((m, s) => Math.max(m, s.roll_no), 0) + 1;
    const tf =
      parseFloat(cls.tutions) * 12 +
      parseFloat(cls.admission) +
      parseFloat(cls.annual) +
      parseFloat(cls.others);
    setForm(p => ({ ...p, standard: cls.classname, standard_id: cls.id.toString(), roll_no: maxRoll, total_fees: tf, balance: tf }));
  };

  const submit = async () => {
    setLoading(true);
    try { await onSubmit(form, editingStudent?.student_id); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{
        background: T.surface, borderRadius: 18, maxWidth: 560, width: "95vw", fontFamily: font,
        padding: 0, overflow: "hidden", boxShadow: T.shadowXl,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>

        {/* ── Header + Tab nav ── */}
        <div style={{ padding: "18px 24px 0", borderBottom: `1px solid ${T.line}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2 }}>
                {editingStudent ? "Edit record" : "New record"}
              </div>
              <DialogTitle style={{ fontSize: 17, fontWeight: 800, color: T.text, margin: 0 }}>
                {editingStudent ? `${editingStudent.first_name} ${editingStudent.last_name}` : "Add New Student"}
              </DialogTitle>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.line}`, background: T.subtle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.muted }}>
              <X style={{ width: 14 }} />
            </button>
          </div>

          <div style={{ display: "flex" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
                fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? T.accent : T.muted,
                background: "transparent", border: "none",
                borderBottom: tab === t.id ? `2px solid ${T.accent}` : "2px solid transparent",
                cursor: "pointer", transition: "all .15s", marginBottom: -1, fontFamily: font,
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab body ── */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>

          {/* Personal */}
          {tab === "personal" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="First Name" required>
                <Input name="first_name" value={form.first_name} onChange={onInput} placeholder="e.g. Arjun" style={inp} />
              </Field>
              <Field label="Last Name">
                <Input name="last_name" value={form.last_name} onChange={onInput} placeholder="e.g. Sharma" style={inp} />
              </Field>
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Father's Name" required>
                  <Input name="father_name" value={form.father_name} onChange={onInput} placeholder="e.g. Ramesh Sharma" style={inp} />
                </Field>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Email Address" required>
                  <Input name="email" type="email" value={form.email} onChange={onInput} placeholder="e.g. arjun@example.com" style={inp} />
                </Field>
              </div>
              <Field label="Phone">
                <Input name="contact_phone" type="tel" value={form.contact_phone} onChange={onInput} placeholder="10-digit" style={inp} />
              </Field>
              <Field label="Date of Birth">
                <Input name="date_of_birth" type="date" value={form.date_of_birth} onChange={onInput} style={inp} />
              </Field>
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Gender">
                  <Select value={form.gender} onValueChange={v => set("gender", v)}>
                    <SelectTrigger style={{ ...inp, width: "100%" }}><SelectValue placeholder="Select gender" /></SelectTrigger>
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
                <Input name="enrollment_date" type="date" value={form.enrollment_date} onChange={onInput} style={inp} />
              </Field>
              <Field label="Standard / Class" required>
                <Select onValueChange={onClassChange} value={form.standard_id || form.standard}>
                  <SelectTrigger style={{ ...inp, width: "100%" }}><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.classname}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Roll Number">
                <Input name="roll_no" type="number" value={form.roll_no} onChange={onInput} style={inp} />
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger style={{ ...inp, width: "100%" }}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div style={{ background: T.infoBg, border: `1px solid ${T.infoBorder}`, borderRadius: 10, padding: "10px 13px", fontSize: 12, color: T.info, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <AlertCircle style={{ width: 14, flexShrink: 0, marginTop: 1 }} />
                Selecting a class auto-calculates total fees and assigns the next available roll number.
              </div>
            </div>
          )}

          {/* Fees */}
          {tab === "fees" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Total Fees (₹)">
                <Input name="total_fees" type="number" value={form.total_fees} onChange={onInput} style={inp} />
              </Field>
              <Field label="Fees Paid (₹)">
                <Input name="fees_paid" type="number" value={form.fees_paid} onChange={onInput} style={inp} />
              </Field>
              <Field label="Balance (₹)">
                <Input name="balance" type="number" value={form.balance} onChange={onInput} style={inp} />
              </Field>
              <Field label="Late Fees (₹)">
                <Input name="late_fees_charges" type="number" value={form.late_fees_charges} onChange={onInput} style={inp} />
              </Field>

              {/* Concession — read-only, configured via table action */}
              <div style={{ gridColumn: "span 2", background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#5B21B6" }}>Concession</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginTop: 2 }}>
                    ₹{(form.concession || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#7C3AED", fontStyle: "italic" }}>Configure via table action →</div>
              </div>

              {/* Scholarship — read-only, configured via table action */}
              <div style={{ gridColumn: "span 2", background: T.accentBg, border: `1px solid ${T.accentLight}`, borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>Scholarship</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginTop: 2 }}>
                    ₹{(form.scholarship || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: T.accent, fontStyle: "italic" }}>Configure via table action →</div>
              </div>

              <Field label="Last Payment Date">
                <Input name="last_payment_date" type="date" value={form.last_payment_date} onChange={onInput} style={inp} />
              </Field>
              <Field label="Fee Due Date">
                <Input name="due_date" type="date" value={form.due_date} onChange={onInput} style={inp} />
              </Field>
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ margin: "0 24px 4px", display: "flex", gap: 7, alignItems: "center", background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 9, padding: "9px 12px", color: T.danger, fontSize: 12, flexShrink: 0 }}>
            <AlertCircle style={{ width: 13, flexShrink: 0 }} /> {error}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.subtle, flexShrink: 0 }}>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 6 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ width: tab === t.id ? 18 : 6, height: 6, borderRadius: 99, padding: 0, border: "none", background: tab === t.id ? T.accent : T.line, cursor: "pointer", transition: "all .2s" }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="outline" onClick={onClose} style={{ borderRadius: 9, fontSize: 13, height: 36 }}>Cancel</Button>
            <Button onClick={submit} disabled={loading} style={{ background: T.accent, color: "#fff", borderRadius: 9, fontSize: 13, fontWeight: 700, height: 36, opacity: loading ? 0.7 : 1, boxShadow: "0 2px 10px rgba(79,70,229,.3)" }}>
              {editingStudent
                ? <><Save style={{ width: 14, marginRight: 6 }} />{loading ? "Saving…"  : "Save Changes"}</>
                : <><Plus style={{ width: 14, marginRight: 6 }} />{loading ? "Adding…"  : "Add Student"}</>
              }
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};