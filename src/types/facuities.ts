import { FieldValue, Timestamp } from "firebase/firestore";

export interface FacultyType {
  id?:string;
  facultyId: string;
  facultyName: string;
  facultyEmail?: string;
  facultyPhone: string;
  facultyAddress?: string;
  facultyGender: string;
  facultyImage?: string;
  facultyImageThumb?: string;
  facultyAadhar?: string;
  facultyPass?: string;
  facultyQualification?: string;
  facultySpecification: string;
  facultyDob: string;
  facultyDoj?: string;
  isFromManagement: boolean;
  isSendingSms?: boolean
  rfidCode?: string
  isActive: boolean
}

export type AttenzyAttendanceType = {
  checkIn?: Timestamp,
  checkOut?: Timestamp,
  date: string,
  id: string,
  name: string,
  phone: string,
  profileImage: string,
  status: string,
  studentId: string,
  timestamp: Timestamp
}


export type FacultyAttendanceShema = {
  isSmartAttendance?: boolean;

  facultyPhone?: number;
  comment?: string;

  facultyImage?: string;
  facultyName: string;
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
