import { Timestamp } from "firebase/firestore";
import { StudentDetailsType } from "./student";


export type paperMarksTypeNew = {
  paperId: string;
  paperTitle: string;
  practical: string| number;
  theory: string| number;
  grade?: string
}

export type resultTypeNew = {
  examId: string;
  examTitle: string;
  createdAt: Timestamp;
  result: paperMarksTypeNew[];
  docId?: string;
}


export type marksheetTypeNew = {
  student: StudentDetailsType;
  examTitle: string;
  result: paperMarksTypeNew[];
};

export type rankType = {
  studentId: string;
  rankObtained: number;
  marksObtained: number;
};
