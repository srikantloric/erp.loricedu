export type ExamPaper = {
  paperId: string;
  paperTitle: string;
  maxTheory: number;
  maxPractical: number;
  scoreType?: 'grade' | 'marks'; // assuming only these two for now
  classes: string[]; // list of class IDs (e.g., "1", "2", "10", "14")
  grade?: string[];  // only present if scoreType is 'grade'
};

export type ExamPaperExtended = ExamPaper & {
  newGrade?: string; // temporary field only for UI
};
export type Exam = {
  examId: string;
  examTitle: string;
  examSession: string;
  marksheetDesign: string;
  papers: ExamPaper[];
};
