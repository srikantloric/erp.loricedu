// types/FeePayment.ts
import { Timestamp } from "firebase/firestore";

export type PaymentMode = "cash" | "upi" | "card" | "bank_transfer" | "cheque" | "other";

export interface FeePaymentHeadSplit {
    headId: string;
    headName?: string;
    month?: string | null;
    amount: number; // amount paid for this head in THIS payment
}

export interface FeePayment {
    paymentId: string;
    challanId: string;
    studentId: string;
    sessionId: string;

    totalPayable?: number;   // challan total - concessions (optional snapshot)
    totalPaidNow: number;    // amount collected in this transaction
    totalPaidTillNow?: number; // optional cumulative after this payment

    paymentMode: PaymentMode;
    paymentMeta?: Record<string, any>; // UTR/PG txn id/card last4 etc.
    heads: FeePaymentHeadSplit[];      // required for accurate receipts & dues updates

    note?: string | null;

    createdAt: Timestamp;
    createdBy: string;
}
