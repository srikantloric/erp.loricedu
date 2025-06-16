
export interface ExamSession {
    session: string;
    subjects: { [className: string]: string };
}

export interface ExamData {
    date: string;
    sessions: ExamSession[];
}

export interface ExamDatas {
    examTitle: string;
    examDescription: string;
    examId: string;
    examSchedule: ExamData[];
}