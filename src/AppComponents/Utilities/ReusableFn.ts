import moment from "moment";

// Utility — put this in a shared file e.g. src/utils/getSchool.ts
export function getSchoolId(): number | null {
  const school = JSON.parse(localStorage.getItem("school") || "{}");
  return school.id || null;
}

export function formatDateForInput(
  dateValue: string | Date | null | undefined,
): string {
  if (!dateValue) return "";

  const m = moment(dateValue);
  return m.isValid() ? m.format("YYYY/MM/DD") : "";
}

export function getLastFourSessions(): string[] {
  const currentYear = new Date().getFullYear(); // 2026
  const currentSession = `${currentYear - 1}-${currentYear}`; // "2025-2026"

  const sessions: string[] = [];
  for (let i = 0; i < 4; i++) {
    const start = currentYear - 1 - i;
    const end = currentYear - i;
    sessions.push(`${start}-${end}`);
  }

  return sessions; // ["2025-2026", "2024-2025", "2023-2024", "2022-2023"]
}

// Helper function - put this outside your component
export function getAcademicSession(enrollmentDate: string): string {
  try {
    // Parse ISO string (works with or without Z)
    const dt = new Date(enrollmentDate);
    if (isNaN(dt.getTime())) return "Unknown";

    const year = dt.getFullYear();
    const month = dt.getMonth() + 1; // 1–12

    // April = month 4 → new session starts
    if (month >= 4) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  } catch (err) {
    return "Unknown";
  }
}