import { FieldValue, Timestamp } from "firebase/firestore";

export interface StudentAttendanceSchema {
  createdAt:
    | Timestamp
    | FieldValue
    | Date;
  isSmartAttendance?: boolean;
  attendanceStatus: string;
  studentId: string;
  comment?: string;
  attendanceDate: string;
  studentRegId: string;
  studentName?: string;
  studentProfile?: string;
  studentFatherName?: string;
  studentContact?: string;
}

export interface StudentAttendanceGlobalSchema {
  totalAbsent?: number;
  totalStudent?: number;
  totalPresent?: number;
  totalLeave?: number;
  isSmartAttendance: boolean,
  studentId: string,
  createdAt?: Timestamp
  | Date;
  comment: string,
  attendanceDate?: string,
  attendanceStatus: string,
  studentRegId: string,
  studentName:string,
  studentFatherName:string,
  studentProfile:string,
  studentContact:string,

  

}
export interface StudentSatus {
  presentDates:string[],
  absentDates:string[],
  halfDayDates:string[],
  notMarkedDates:string[],
  futureDates:string[],
  onChange?:()=>void,
  onDateChange?:()=>void,

}