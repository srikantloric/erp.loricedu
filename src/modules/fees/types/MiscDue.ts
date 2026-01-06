import { Timestamp } from "firebase/firestore";

export interface MiscDue {
  id: string;
  studentId: string,
  sessionId: string,
  headId: string;
  description: string,
  headName: string;
  amount: number;

  month: string | null; // null = general due

  status: "pending" | "paid";
  paidReceiptId?: string;
  paidAmount: number
  originalAmount: number,
  remainingAmount: number,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: string
}

