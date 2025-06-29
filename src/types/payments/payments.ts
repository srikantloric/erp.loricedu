import { Timestamp } from "firebase/firestore";

export type InstallmentChallanType = {
    id: string;
    month: string;
    year: string;
    session: string;
    status: string;
    changedAt?: Timestamp
}

export type MiscellaneousChallanType = {
    id: string;
    month: string;
    status: string;
}

export type FeeHeadType = {
    headerId: string,
    installment: string,
    headName: string,
    amount: number,
    dueAmount: number,
    concessionAmount: number,
    previousDues?: number,
    createdAt?: string,
    updatedAt?: string,
}
