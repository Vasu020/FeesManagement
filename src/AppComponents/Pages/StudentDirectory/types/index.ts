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
  standard_id: string;
  roll_no: number;
  active_date: string;
  inactive_date: string;
  current_session: string;
}

export interface ClassItem {
  id: number;
  classname: string;
  tutions: string;
  admission: string;
  annual: string;
  others: string;
}

export interface StudentFormData extends Omit<Student, "student_id"> {
  standard_id: string;
}

export type LeaveRejoinMode = "leave" | "rejoin";
export type DiscountMode = "scholarship" | "concession";