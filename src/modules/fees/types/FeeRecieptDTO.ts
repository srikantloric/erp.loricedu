// types/ReceiptDTO.ts
import { Timestamp } from "firebase/firestore";

/**
 * ReceiptDTO is a view-model / data-transfer-object returned to UI or used for PDF.
 * It aggregates challan, dues, payments and ledger info into a shape optimized for display.
 * Not intended to be stored verbatim in DB (though you may cache it).
 */
export interface ReceiptHeadDetail {
  headId: string;
  headName: string;

  originalAmount: number;
  concessionAmount: number;
  netAmount: number;

  paidPreviously: number;
  paidNow: number;
  totalPaidAfter: number;

  previousDue: number;           // dues that existed before this challan (optional)
  remainingDueAfter: number;     // net + previousDue - totalPaidAfter

  month?: string | null;
  remarks?: string;
}

export interface ReceiptDTO {
  receiptId: string;
  receiptNumber?: string;

  createdAt: Timestamp;
  studentId: string;
  challanId: string;
  session?: string;

  totalOriginal: number;
  totalConcession: number;
  totalNet: number;

  totalPaidNow: number;
  totalPaidBefore: number;
  totalRemaining: number;

  heads: ReceiptHeadDetail[];

  paymentBreakdown?: { mode: string; amount: number }[]; // for multi-mode payments
  rawPayment?: any;   // optional full payment object
  rawChallan?: any;   // optional challan (for debugging)
  rawDues?: any[];    // optional dues

  createdBy?: string;
}
