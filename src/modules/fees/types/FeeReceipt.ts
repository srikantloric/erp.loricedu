// types/FeeReceipt.ts
import { Timestamp } from "firebase/firestore";

/**
 * FeeReceipt represents the issued receipt document that parents receive.
 * Receipts link to Payment and Challan. Receipts can be cancelled but not deleted.
 */
export type ReceiptStatus = "active" | "cancelled";

export interface FeeReceiptHead {
  headId: string;
  headName?: string;
  originalAmount: number;       // challan head amount
  concessionAmount: number;     // concession applied for this head (from challan or manual)
  netAmount: number;            // original - concession
  paidPreviously: number;       // amount paid for this head prior to this receipt
  paidNow: number;              // amount paid for this head in this receipt
  remainingAfter: number;       // net + previousDue - (paidPreviously + paidNow)
  remarks?: string;
  month?: string | null;
}

export interface FeeReceipt {
  receiptId: string;            // unique id (can be same as paymentId if you prefer)
  receiptNumber: string;        // human readable series e.g. RCPT-2025-000123

  paymentId: string;            // link to the payment event
  challanId: string;            // link to consolidated challan
  studentId: string;
  session: string;

  amountPaid: number;           // total amount in this receipt
  mode: "cash" | "upi" | "card" | "bank" | "cheque" | "other";
  heads: FeeReceiptHead[];      // per-head breakdown (required for detailed receipt)

  status: ReceiptStatus;

  createdAt: Timestamp;
  createdBy: string;

  // cancellation fields (soft-cancel)
  cancelledAt?: Timestamp | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;

  // optional bookkeeping references
  ledgerEntryId?: string | null; // the primary ledger entry for this receipt (credit)
  notes?: string | null;
  metadata?: Record<string, any>;
}
