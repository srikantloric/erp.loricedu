// types/AttendanceTypes.ts

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LEAVE"
  | "HALF_DAY"
  | "HOLIDAY";

export interface StudentAttendance {
  admissionNo: string;
  name: string;
  profilePicUrl?: string;
  studentId: string;
  classId: number;

  // Attendance fields from DAILY_ATTENDANCE
  present?: boolean;
  status?: AttendanceStatus;
  firstIn?: number;
  lastOut?: number;

  // UI-only fields
  selected_option?: string;
  originalStatus?: AttendanceStatus | null;
  hasChanged?: boolean;
  comment?: string;
}

export interface AttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalOnLeave: number;
}
export interface ClassAttendanceSummary {
  classId: number;
  className: string;
  present: number;
  absent: number;
  leave: number;
  half_day: number;
  holiday: number;
  total: number;
}
