/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, AlertCircle, Search, X, SlidersHorizontal } from "lucide-react";
import moment from "moment";

import { formatStudentDates } from "./utils/helpers";

import { KpiStrip } from "./Components/KpiStrip";
import { StudentTable } from "./Components/StudentTable";
import {
  getAcademicSession,
  getLastFourSessions,
  getSchoolId,
} from "@/AppComponents/Utilities/ReusableFn";
import type {
  ClassItem,
  DiscountMode,
  LeaveRejoinMode,
  Student,
} from "./types";
import { font, T } from "./utils/theme";
import {
  ConfigureDiscountDialog,
  LeaveRejoinDialog,
  PromoteDialog,
} from "./Components/Dialog";
import { StudentDialog } from "./Components/Studentdialog";
import { classesApi, studentsApi } from "@/AppComponents/Utilities/apis/api";
// import { useReminderNotify } from "@/AppComponents/Hooks/useReminderNotify";

const Home = () => {
  const sessions = useMemo(() => getLastFourSessions(), []);
  const schoolId = getSchoolId();

  // ── Data ──
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  // ── Filters ──
  const [session, setSession] = useState(sessions[0]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  // ── Dialog state ──
  const [studentDlg, setStudentDlg] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<Student | null>(null);
  const [leaveRejoin, setLeaveRejoin] = useState<{
    student: Student;
    mode: LeaveRejoinMode;
  } | null>(null);
  const [discountTarget, setDiscountTarget] = useState<{
    student: Student;
    mode: DiscountMode;
  } | null>(null);

  // const { loading, success, sendReminder } = useReminderNotify();

  // ── Fetch ──
  useEffect(() => {
    (async () => {
      try {
        const [sr, cr] = await Promise.all([
          studentsApi.getAll(schoolId),
          classesApi.getAll(schoolId),
        ]);
        if (sr.status === "success") setStudents(sr.data);
        if (cr.status === "success")
          setClasses(
            cr.data.map((classData) => ({
              id: classData.id ?? 0,
              classname: classData.classname,
              tutions: String(classData.tutions ?? ""),
              admission: String(classData.admission ?? ""),
              annual: String(classData.annual ?? ""),
              others: String(classData.others ?? ""),
            })),
          );
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    let list = students;
    if (session)
      list = list.filter(
        (s) => getAcademicSession(s.enrollment_date) === session,
      );
    if (statusFilter !== "all")
      list = list.filter((s) => s.status === statusFilter);
    if (search.trim())
      list = list.filter((s) =>
        `${s.first_name} ${s.last_name} ${s.father_name} ${s.standard} ${s.roll_no}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    return list;
  }, [students, session, statusFilter, search]);

  // ── Handlers ──
  const openAdd = () => {
    setEditingStudent(null);
    setStudentDlg(true);
  };
  const openEdit = (s: Student) => {
    setEditingStudent({
      ...formatStudentDates(s),
      active_date: "",
      inactive_date: "",
      current_session: "",
    } as any);
    setStudentDlg(true);
  };

  const handleStudentSubmit = async (data: Student, editingId?: number) => {
    // Validate standard is selected
    if (!data.standard || data.standard === "") {
      setError("Please select a class/standard before saving.");
      return;
    }

    const lateFee = Number(data.late_fees_charges) || 0;
    const totalFees = Number(data.total_fees) || 0;
    const feesPaid = Number(data.fees_paid) || 0;
    const concession = Number(data.concession) || 0;
    const scholarship = Number(data.scholarship) || 0;

    const effectiveTotal = totalFees + lateFee;
    const computedBalance = Math.max(effectiveTotal - feesPaid, 0);

    const payload: any = {
      ...data,
      school_id: schoolId,
      total_fees: totalFees,
      fees_paid: feesPaid,
      balance: computedBalance,
      late_fees_charges: lateFee,
      concession,
      scholarship,
      roll_no: Number(data.roll_no) || 0,
    };

    try {
      const res = editingId
        ? await studentsApi.update(editingId, payload)
        : await studentsApi.create(payload);

      if (res.status === "success") {
        setStudents((p) =>
          editingId
            ? p.map((s) => (s.student_id === editingId ? res.data : s))
            : [...p, res.data],
        );
        setStudentDlg(false);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed. Please try again.");
    }
  };

  const handlePromote = async (
    studentId: number,
    newClass: string,
    newSession: string,
  ) => {
    try {
      const res = await studentsApi.update(studentId, {
        standard: newClass,
        current_session: newSession,
        active_date: moment().format("YYYY-MM-DD"),
      });
      if (res.status === "success")
        setStudents((p) =>
          p.map((s) => (s.student_id === studentId ? res.data : s)),
        );
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeaveRejoin = async (
    studentId: number,
    date: string,
    mode: LeaveRejoinMode,
  ) => {
    const payload: Partial<Student> =
      mode === "leave"
        ? { status: "inactive", inactive_date: date }
        : { status: "active", active_date: date, inactive_date: null };
    try {
      const res = await studentsApi.update(studentId, payload);
      if (res.status === "success")
        setStudents((p) =>
          p.map((s) => (s.student_id === studentId ? res.data : s)),
        );
    } catch (e) {
      console.error(e);
    }
  };

 const handleDiscount = async (
  studentId: number,
  field: DiscountMode,
  amount: number,
) => {
  try {
    const res = await studentsApi.update(studentId, {
      [field]: amount,
    } as Partial<Student>);

    if (res.status === "success") {
      setStudents((prev) =>
        prev.map((s) =>
          s.student_id === studentId ? { ...s, ...res.data } : s,
        ),
      );
    }
  } catch (e: any) {
    console.error(e);
    // show it in whatever way your page reports errors, e.g.:
    // setError(e.response?.data?.message || "Failed to update discount.");
  }
};

  return (
    <div
      style={{
        background: T.bg,
        minHeight: "100vh",
        padding: "24px 28px",
        fontFamily: font,
        color: T.text,
      }}
    >
      {/* ── Page header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 22,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              color: T.accent,
              textTransform: "uppercase",
              letterSpacing: ".09em",
            }}
          >
            School Management
          </p>
          <h1
            style={{
              margin: "3px 0 0",
              fontSize: 22,
              fontWeight: 800,
              color: T.text,
              letterSpacing: "-.02em",
            }}
          >
            Student Directory
          </h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: T.muted }}>
            {students.length} total students · Session {session}
          </p>
        </div>
        <Button
          onClick={openAdd}
          style={{
            background: T.accent,
            color: "#fff",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            padding: "9px 18px",
            height: 40,
            boxShadow: "10px 10px 20px rgba(79,70,229,.3)",
          }}
        >
          <Plus style={{ width: 15 }} /> Add Student
        </Button>
      </div>

      {/* ── KPI strip ── */}
      <KpiStrip students={filtered} />

      {/* ── Toolbar ── */}
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.line}`,
          borderRadius: 12,
          padding: "10px 14px",
          marginBottom: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          boxShadow: T.shadowSm,
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              color: T.faint,
              pointerEvents: "none",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, class, roll no…"
            style={{
              width: "100%",
              border: `1px solid ${T.line}`,
              borderRadius: 9,
              padding: "8px 32px 8px 34px",
              fontSize: 13,
              outline: "none",
              background: T.bg,
              color: T.text,
              fontFamily: font,
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = T.accent)}
            onBlur={(e) => (e.target.style.borderColor = T.line)}
          />
          {search && (
            <X
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 14,
                color: T.faint,
                cursor: "pointer",
              }}
            />
          )}
        </div>

        {/* Session */}
        <Select value={session} onValueChange={setSession}>
          <SelectTrigger
            style={{ width: 158, borderRadius: 9, fontSize: 13, height: 36 }}
          >
            <SlidersHorizontal
              style={{ width: 13, marginRight: 6, color: T.faint }}
            />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s} value={s}>
                Session {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            style={{ width: 130, borderRadius: 9, fontSize: 13, height: 36 }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <span
          style={{
            fontSize: 12,
            color: T.muted,
            marginLeft: "auto",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: T.dangerBg,
            border: `1px solid ${T.dangerBorder}`,
            borderRadius: 10,
            padding: "10px 14px",
            color: T.danger,
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          <AlertCircle style={{ width: 14 }} /> {error}
        </div>
      )}

      {/* ── Table ── */}
      <StudentTable
        students={filtered}
        onEdit={openEdit}
        onPromote={setPromoteTarget}
        onLeave={(s) => setLeaveRejoin({ student: s, mode: "leave" })}
        onRejoin={(s) => setLeaveRejoin({ student: s, mode: "rejoin" })}
        onScholarship={(s) =>
          setDiscountTarget({ student: s, mode: "scholarship" })
        }
        onConcession={(s) =>
          setDiscountTarget({ student: s, mode: "concession" })
        }
      />

      {/* ── Dialogs ── */}
      <StudentDialog
        open={studentDlg}
        onClose={() => setStudentDlg(false)}
        editingStudent={editingStudent}
        classes={classes}
        students={students}
        onSubmit={handleStudentSubmit}
        error={error}
        setError={setError}
      />
      <PromoteDialog
        open={!!promoteTarget}
        onClose={() => setPromoteTarget(null)}
        student={promoteTarget}
        classes={classes}
        onPromote={handlePromote}
      />
      {leaveRejoin && (
        <LeaveRejoinDialog
          open={!!leaveRejoin}
          onClose={() => setLeaveRejoin(null)}
          student={leaveRejoin.student}
          mode={leaveRejoin.mode}
          onConfirm={handleLeaveRejoin}
        />
      )}
      {discountTarget && (
        <ConfigureDiscountDialog
          open={!!discountTarget}
          onClose={() => setDiscountTarget(null)}
          mode={discountTarget.mode}
          student={discountTarget.student}
          onApply={handleDiscount}
        />
      )}
    </div>
  );
};

export default Home;
