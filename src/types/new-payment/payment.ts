export interface Dues {
    studentId?: string;
    sessionId?: string;
    month?: string;
    totalFee?: string;
    paidAmount?: string;
    dueAmount?: string;
    feeHeads?: FeeHeadsModel;
    status?: string;
    receiptIds?: any[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MiscModel {
    exam?: number;
}

export interface FeeHeadsModel {
    tuition?: number;
    transport?: number;
    misc?: MiscModel;
}

export interface Receipts {
    receiptId?: string;
    studentId?: string;
    sessionId?: string;
    feeHeads?: string;
    months?: string;
    originalAmount?: number;
    paidAmount?: number;
    concession?: number;
    dueAmount?: number;
    paymentMode?: string;
    status?: string;
    cancelledAt?: string;
    cancelledBy?: string;
}

export interface MiscFees {
    studentId?: string;
    type?: string;
    amount?: string;
    attachedMonth?: string;
    isPaid?: string;
    receiptId?: string;
    createdAt?: Date;
}