import moment from "moment";
import type { Student } from "../types";
import { feeRulesApi, type FeeRule } from "@/AppComponents/Utilities/apis/api";

export const fmtINR = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const fmtDate = (v: string) => (v ? moment(v).format("YYYY-MM-DD") : "");

export const formatStudentDates = (s: Student): Student => ({
  ...s,
  date_of_birth: fmtDate(s.date_of_birth),
  enrollment_date: fmtDate(s.enrollment_date),
  last_payment_date: fmtDate(s.last_payment_date),
  due_date: fmtDate(s.due_date),
});

export const calcEffective = (student: Partial<Student>) => {
  const total = Number(student.total_fees ?? 0);
  const concession = Number(student.concession ?? 0);
  const scholarship = Number(student.scholarship ?? 0);
  return Math.max(total - concession - scholarship, 0);
};

export const calcBalance = (student: Partial<Student>): number =>
  Math.max(calcEffective(student) - Number(student.fees_paid ?? 0), 0);

export const calcFeePct = (s: Partial<Student>): number => {
  const eff = calcEffective(s);
  return eff > 0
    ? Math.min(Math.max((Number(s.fees_paid ?? 0) / eff) * 100, 0), 100)
    : 0;
};

export const hasPendingFees = (s: Student): boolean => calcBalance(s) > 0;

export const calculateLateFeeCharge = (
  dueDate: string | null | undefined,
  feeRule: Pick<
    FeeRule,
    "due_day_of_month" | "grace_days" | "late_fee_amount" | "is_active"
  > | null,
  today = new Date(),
): number => {
  if (!feeRule?.is_active) return 0;

  const amount = Number(feeRule.late_fee_amount) || 0;
  const dueDay = Math.max(1, Number(feeRule.due_day_of_month) || 1);
  const graceDays = Math.max(0, Number(feeRule.grace_days) || 0);
  if (amount <= 0) return 0;

  const parsedDueDate = dueDate?.split("T")[0].split("-").map(Number);
  const due =
    parsedDueDate?.length === 3 &&
    parsedDueDate.every(Number.isFinite) &&
    parsedDueDate[0] > 0
      ? new Date(parsedDueDate[0], parsedDueDate[1] - 1, parsedDueDate[2])
      : new Date(
          today.getFullYear(),
          today.getMonth(),
          Math.min(
            dueDay,
            new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(),
          ),
        );

  const graceDeadline = new Date(due);
  graceDeadline.setDate(graceDeadline.getDate() + graceDays);
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  if (currentDate <= graceDeadline) return 0;

  let completedMonths =
    (currentDate.getFullYear() - graceDeadline.getFullYear()) * 12 +
    currentDate.getMonth() -
    graceDeadline.getMonth();
  if (currentDate.getDate() < graceDeadline.getDate()) completedMonths -= 1;
  const periods = Math.max(completedMonths + 1, 1);

  return Math.round(periods * amount * 100) / 100;
};

export const withCalculatedLateFee = (
  student: Student,
  feeRule: Pick<
    FeeRule,
    "due_day_of_month" | "grace_days" | "late_fee_amount" | "is_active"
  > | null,
): Student => ({
  ...student,
  late_fees_charges: Math.max(
    Number(student.late_fees_charges ?? 0),
    calculateLateFeeCharge(student.due_date, feeRule),
  ),
});

export const getFeeRules = <T = FeeRule>(type: string) =>
  feeRulesApi.getAll<T>(type);
