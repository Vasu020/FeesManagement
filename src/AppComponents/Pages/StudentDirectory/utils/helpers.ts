import moment from "moment";
import type { Student } from "../types";

export const fmtINR = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const fmtDate = (v: string) =>
  v ? moment(v).format("YYYY-MM-DD") : "";

export const formatStudentDates = (s: Student): Student => ({
  ...s,
  date_of_birth:      fmtDate(s.date_of_birth),
  enrollment_date:    fmtDate(s.enrollment_date),
  last_payment_date:  fmtDate(s.last_payment_date),
  due_date:           fmtDate(s.due_date),
});

export const calcEffective = (s: Partial<Student>): number =>
  Math.max(
    Number(s.total_fees ?? 0) - Number(s.concession ?? 0) - Number(s.scholarship ?? 0),
    0
  );

export const calcFeePct = (s: Partial<Student>): number => {
  const eff = calcEffective(s);
  return eff > 0 ? Math.min((Number(s.fees_paid ?? 0) / eff) * 100, 100) : 0;
};

export const hasPendingFees = (s: Student): boolean => {
  const effective = calcEffective(s);
  return Number(s.balance ?? 0) > 0 || Number(s.fees_paid ?? 0) < effective;
};