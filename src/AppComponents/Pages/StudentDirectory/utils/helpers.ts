import moment from "moment";
import type { Student } from "../types";
import { API_BASE_URL } from "@/AppComponents/Utilities/Constant";

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

export const calcEffective = (s: Partial<Student>): number =>
  Math.max(
    Number(s.total_fees ?? 0) -
      Number(s.concession ?? 0) -
      Number(s.scholarship ?? 0),
    0,
  );

export const calcFeePct = (s: Partial<Student>): number => {
  const eff = calcEffective(s);
  return eff > 0 ? Math.min((Number(s.fees_paid ?? 0) / eff) * 100, 100) : 0;
};

export const hasPendingFees = (s: Student): boolean => {
  const effective = calcEffective(s);
  return Number(s.balance ?? 0) > 0 || Number(s.fees_paid ?? 0) < effective;
};

export const apiFetch = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};
export const BASE_URL = `${API_BASE_URL}/api/fee-rules`;
export const getFeeRules = (type: string) =>
  apiFetch(`${BASE_URL}?type=${type}`);
