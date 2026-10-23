import type {
  LateFeePaymentSummary,
  Student,
} from "@/AppComponents/Pages/StudentDirectory/types";
import axios from "axios";
import type {
  InternalAxiosRequestConfig,
} from "axios";
// ─────────────────────────────────────────
// 1. Types — match your backend response/request shapes
// ─────────────────────────────────────────
export interface School {
  id: number;
  school_name: string;
  short_name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  school_id: number;
  school_name?: string;
  short_name?: string;
  created_at?: string;
}



export interface ClassData {
  id?: number;
  school_id?: number;
  classname: string;
  students: number;
  sections: number;
  tutions?: number;
  admission?: number;
  annual?: number;
  others?: number;
  otherCategories?: string[];
}

export interface FeeRule {
  id?: number;
  rule_type?: string;
  preset_name?: string | null;
  value_type?: string | null;
  value?: number | string | null;
  applicable_classes?: string[] | string | null;
  due_day_of_month?: number;
  grace_days?: number;
  late_fee_amount?: number | string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FeeRulesResponse<T = FeeRule> {
  success: boolean;
  data: T[];
  message?: string;
}

export interface FeeRuleResponse<T = FeeRule> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  status: "success" | "error";
  data: T[];
  message: string;
}

export interface ApiItemResponse<T> {
  status: "success" | "error";
  data: T;
  message: string;
}

export interface LoginResponse<T> {
  message: string;
  token: string;
  user?: T;
  school?: T;
}

// ─────────────────────────────────────────
// 2. Base axios instance
// ─────────────────────────────────────────
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/api`,
});

// ─────────────────────────────────────────
// 3. Attach the JWT to every outgoing request automatically
// ─────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────
// 4. Handle expired/invalid tokens globally
// ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginCall = error.config?.url?.includes("/login");

    if (status === 401 && !isLoginCall) {
      clearToken();
      localStorage.removeItem("user");
      localStorage.removeItem("school");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────
// 5. Generic reusable helpers
//    Every response is unwrapped to res.data automatically,
//    so calling code doesn't need `.data` everywhere.
// ─────────────────────────────────────────
export const get = <T = unknown>(
  url: string,
  params: Record<string, unknown> = {},
): Promise<T> => api.get<T>(url, { params }).then((res) => res.data);

export const post = <T = unknown>(
  url: string,
  body: unknown = {},
): Promise<T> => api.post<T>(url, body).then((res) => res.data);

export const put = <T = unknown>(url: string, body: unknown = {}): Promise<T> =>
  api.put<T>(url, body).then((res) => res.data);

export const del = <T = unknown>(url: string): Promise<T> =>
  api.delete<T>(url).then((res) => res.data);

// ─────────────────────────────────────────
// 6. Auth helpers
// ─────────────────────────────────────────
export function saveToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.removeItem("token");
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("token");
}

export const registerSchool = (data: {
  school_name: string;
  short_name?: string;
  email: string;
  password: string;
}) => post<{ message: string; school: School }>("/schools", data);

export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  const data = await post<LoginResponse<User>>("/users/login", {
    email,
    password,
  });
  saveToken(data.token);
  return data.user as User;
}

export function logout(): void {
  clearToken();
  window.location.href = "/login";
}

// ─────────────────────────────────────────
// 7. Resource-specific shortcuts (optional — use these OR the generic
//    get/post/put/del above, whichever reads cleaner in your components)
// ─────────────────────────────────────────
export const studentsApi = {
  getAll: (schoolId?: number | null) =>
    get<ApiListResponse<Student>>(
      "/students",
      schoolId == null ? {} : { school_id: schoolId },
    ),
  create: (student: Student) =>
    post<ApiItemResponse<Student>>(
      "/students",
      student as unknown as Record<string, unknown>,
    ),
  update: (id: number, student: Partial<Student>) =>
    put<ApiItemResponse<Student>>(
      `/students/${id}`,
      student as Record<string, unknown>,
    ),
  recordLateFeePayment: (
    id: number,
    payment: { amount: number; payment_date: string },
  ) =>
    post<ApiItemResponse<LateFeePaymentSummary>>(
      `/students/${id}/late-fee-payments`,
      payment,
    ),
  remove: (id: number) => del<ApiItemResponse<null>>(`/students/${id}`),
};

export const classesApi = {
  getAll: (schoolId?: number | null) =>
    get<ApiListResponse<ClassData>>(
      "/classes",
      schoolId == null ? {} : { school_id: schoolId },
    ),
  create: (classData: Record<string, unknown>) =>
    post<ApiItemResponse<ClassData>>(
      "/classes",
      classData,
    ),
  update: (id: number, classData: Record<string, unknown>) =>
    put<ApiItemResponse<ClassData>>(
      `/classes/${id}`,
      classData,
    ),
};

export const usersApi = {
  getAll: (schoolId?: number | null) =>
    get<{ message: string; data: User[] }>(
      "/users",
      schoolId == null ? {} : { school_id: schoolId },
    ),
  create: (user: {
    school_id?: number;
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => post<{ message: string; user: User }>("/users", user),
  remove: (id: number) => del<{ message: string }>(`/users/${id}`),
  resetPassword: (email: string, password: string) =>
    post<{ message: string }>("/users/reset-password", { email, password }),
};

export const feeRulesApi = {
  getAll: <T = FeeRule>(type: string) =>
    get<FeeRulesResponse<T>>("/fee-rules", { type }),
  create: <T = FeeRule>(rule: Record<string, unknown>) =>
    post<FeeRuleResponse<T>>("/fee-rules", rule),
  update: <T = FeeRule>(id: number, rule: Record<string, unknown>) =>
    put<FeeRuleResponse<T>>(`/fee-rules/${id}`, rule),
};

export const settingsApi = {
  getAll: () =>
    get<{ success: boolean; data: Record<string, string> }>("/settings"),
  update: (settings: Record<string, string>) =>
    put<{ success: boolean; message: string }>("/settings", settings),
};

// Default export for cases where you want the raw axios instance
export default api;
