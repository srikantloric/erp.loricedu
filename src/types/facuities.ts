import { FieldValue, Timestamp } from "firebase/firestore";


export interface FacultyType {
  id: string;
  faculty_name: string;
  faculty_email: string;
  faculty_phone: string;
  faculty_address: string;
  faculty_gender: string;
  faculty_image: string;
  faculty_image_thumb: string;
  faculty_aadhar: string;
  faculty_pass: string;
  faculty_qualification: string;
  faculty_specification: string;
  faculty_dob:string;
  faculty_doj:string
}


export type FacultyAttendanceShema = {
  isSmartAttendance?: boolean;

  faculty_phone?: number;
  comment?: string;
 
  faculty_image?: string;
  faculty_name: string;
  id: string;
  createdAt:
    | Timestamp
    | FieldValue
    | Date;
  attendanceDate: string;
  attendanceStatus: string;

  
};
export interface facultyAttendanceGlobalSchema {
  totalAbsent?: number;
  totalStudent?: number;
  totalPresent?: number;
  totalLeave?: number;
  isSmartAttendance: boolean;
  id: string;
  createdAt?: Timestamp | Date;
  comment: string;
  attendanceDate?: string;
  attendanceStatus: string;

  faculty_name: string;

  faculty_image: string;
  faculty_phone: number;
}
