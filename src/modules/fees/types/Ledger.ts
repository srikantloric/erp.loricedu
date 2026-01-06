// types/FeeLedger.ts
import { Timestamp } from "firebase/firestore";

/**
 * Ledger is immutable bookkeeping. Every financial action creates one or more ledger entries.
 * - credit = money received (payments)
 * - debit  = reversal/refund/adjustment
 *
 * Ledger entries are never deleted. Reversals are recorded as separate DEBIT entries
 * that reference the original ledger entry via `linkedLedgerId` or `linkedPaymentId`.
 */
export type LedgerEntryType = "credit" | "debit";

export interface FeeLedgerEntry {
  entryId: string;                // unique id for ledger entry
  type: LedgerEntryType;          // credit (payment) | debit (reversal/refund)
  studentId: string;

  // optional links for traceability
  challanId?: string | null;      // the challan affected (if any)
  paymentId?: string | null;      // original payment that created this entry
  linkedLedgerId?: string | null; // used when this entry reverses another ledger entry

  amount: number;                 // positive amount
  currency?: string;              // "INR" etc.

  account?: string;               // accounting account name/code (optional)
  reason: string;                 // human readable reason e.g. "Fee Payment", "Receipt Cancelled"

  metadata?: Record<string, any>; // optional free-form metadata (PG txn id, bank ref, etc.)

  createdAt: Timestamp;
  createdBy: string;

  // audit fields
  reversed?: boolean;             // true if this entry has been reversed by another entry
  reversedAt?: Timestamp | null;
  reversedBy?: string | null;
}
