export interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  father_name: string;
  date_of_birth: string;
  gender: string;
  contact_phone: string;
  email: string;
  total_fees: number;
  fees_paid: number;
  balance: number;
  late_fees_charges: number;
  concession: number;
  scholarship: number;
  last_payment_date: string;
  due_date: string;
  enrollment_date: string;
  status: "active" | "inactive";
  standard: string;
  roll_no: number;
  active_date: string;
  inactive_date: string;
  current_session: string;
}
export interface FeeRule {
  id: number;
  rule_type: string;
  preset_name: string | null;
  value_type: string | null;
  value: string | null;
  applicable_classes: string | null;
  due_day_of_month: number;
  grace_days: number;
  late_fee_amount: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassItem {
  id: number;
  classname: string;
  tutions: string;
  admission: string;
  annual: string;
  others: string;
}


export type LeaveRejoinMode = "leave" | "rejoin";
export type DiscountMode = "scholarship" | "concession";