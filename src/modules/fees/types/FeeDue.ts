import { Timestamp } from "firebase/firestore";

export interface FeeDue {
    dueId: string,
    studentId: string,
    sessionId: string,

    headId: string;
    headName: string;
    month: string | null, // null if not tied to a month (e.g. library fine)
    // Amounts
    originalAmount: number;      // amount assigned before concession
    concessionAmount: number;    // concession applied at challan level
    netAmount: number;           // originalAmount - concessionAmount
    paidAmount: number;          // total paid towards this due
    dueAmount: number;     // netAmount - paidAmount (stored for fast querying)

    sourceType: "challan" | "manual" | "adjustment",
    sourceChallanId: string | null,

    status: "pending" | "paid" | "cancelled" | "partial",

    createdAt: Timestamp,
    updatedAt: Timestamp,
    createdBy: string
}