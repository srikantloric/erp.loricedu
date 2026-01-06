import { FieldValue, Timestamp } from "firebase/firestore";

export interface ChallanFeeHead {
  headId: string,
  headName: string,       // snapshot of head name
  amount: number,      // original bill amount
  paid: number,        // total paid against this head (all time)
  concession: number,  // concession given
}

export interface Challan {
  challanId: string;  //FEE-2024-04-000012 / MISC-2024-000458
  studentId: string;
  month: string | null;     //2025-05
  session: string
  classId: number
  type: "regular" | "misc",

  totalAmount: number;
  paidAmount: number;
  heads: ChallanFeeHead[]

  concessionTotal: number,
  lateFine: number,

  status: "pending" | "partial" | "paid" | "cancelled",

  createdAt: Timestamp | FieldValue,
  updatedAt: Timestamp | FieldValue
  createdBy: string
}

