export interface FeeProfile {
  id: string;           // sessionId_classId
  sessionId: string;
  classId: string;

  headsByMonth: {
    [yearMonth: string]: {
      headId: string;
      defaultAmount: number;
    }[];
  };
}