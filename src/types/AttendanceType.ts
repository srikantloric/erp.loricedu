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



export type StudentType = {
    id: string;
    student_name: string;
    class_roll: number;
    student_id: string;
    contact_number: string;
    father_name: string;
    admission_no: string;
    profil_url?: string;
};

export type AttendanceType = {
    studentId: string;
    status: "PRESENT" | "ABSENT";
};

export type AttendanceRowType = {
    studentId: string;
    name: string;
    rollNo: number;
    mobileNo: string;
    fatherName: string;
    status: string;
    profilePicUrl: string;
    admissionNo: string;
};