export interface DueReportType {
    dueMonth: string;
    studentName: string;
    studentId: string;
    class: string;
    fatherName: string,
    contact: string,
    dueAmount: number,
    remark: string,
    sl:string,
}


type StudentDetailsDemandSlip = {
    studentName: string;
    class: string;
    fatherName: string;
    dob: string;
    phoneNumber: string;
    rollNumber: string;
    admissionNo: string;
    section: string;
    address: string;
}

export type DemandSlipType = {
    recieptId: string;
    studentDetails: StudentDetailsDemandSlip,
    currentSession: string;
    dueMonths: string[];
    feeHeaders: { header: string; amount: number }[];
}