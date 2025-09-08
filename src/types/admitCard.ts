import { ExamData } from "./reports/exam";

export interface admitCardType {
    studentName: string;
    rollNumber: string;
    className: string;
    fatherName: string;
    motherName:string;
    studentDOB: string;
    studentMob: string;
    studentId:string;
    profile_url: string;
    examTitle: string;
    session: string;
    examTimings: string;
    timeTabel:ExamData[]
}