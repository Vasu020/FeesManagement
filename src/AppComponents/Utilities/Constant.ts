export const API_BASE_URL = "http://localhost:5000";

export interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  father_name: string;
  date_of_birth: Date;
  gender: string;
  contact_phone: string | null;
  email: string;
  enrollment_date: Date;
  status: string;
  total_fees: number;
  fees_paid: number;
  balance: number;
  late_fees_charges: number;
  concession: number;
  scholarship: number;
  last_payment_date: Date | null;
  due_date: Date | null;
  roll_no: number | null;
  standard: string | null;
}