export type InstallmentChallanType = {
    id: string;
    month: string;
    year:string;
    session:string;
    status: string;
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
    createdAt?: string,
    updatedAt?: string,
}
