import { Timestamp } from "firebase/firestore";

export interface FeeHead {
  id: string
  headId: string;
  headName: string;
  amount: number;
  month: string | null;

  concessionAmount: number;
  paidAmount: number;
  dueAmount: number;

  createdAt?: Timestamp,
  updatedAt?: Timestamp,

  headType?: "regular" | "misc" | "previous_due";
}

