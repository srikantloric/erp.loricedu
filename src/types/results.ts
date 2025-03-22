import { Timestamp } from "firebase/firestore";
import { StudentDetailsType } from "./student";

export type paperMarksType = {
  paperId: string;
  paperTitle: string;
  paperMarkObtained: number;
  paperMarkPractical: number;
  paperMarkPassing: number;
  paperMarkTheory: number;
};

export type resultType = {
  examId: string;
  examTitle: string;
  publishedOn: Timestamp;
  result: paperMarksType[];
  docId?: string;
};

export type marksheetType = {
  student: StudentDetailsType;
  examTitle:string;
  result: paperMarksType[];
};

export type rankType = {
  studentId: string;
  rankObtained: number;
  marksObtained: number;
};