import { ExamData } from "components/Exams/ExamPlannerTable";

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
    startTime: string;
    endTime: string;
    timeTabel:ExamData[]
}