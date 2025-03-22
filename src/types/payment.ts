import { Timestamp } from "firebase/firestore";

export type IPaymentStatus = "UNPAID" | "PARTIAL" | "PAID";
export interface IChallanHeaderType {
  headerTitle: string;
  amount: number;
  amountPaid: number;
  amountPaidTotal: number;
  amountDue: number;
}
export interface IChallanHeaderTypeForChallan {
  headerTitle: string;
  amount: number;
  amountPaidTotal: number;
  amountDue: number;
}
export interface IPaymentNL {
  challanId: string;
  paymentId: string;
  studentId: string;
  challanTitle: string;
  amountPaid: number;
  breakdown: IChallanHeaderType[];
  recievedOn: Timestamp;
  recievedBy: string;
  status: IPaymentStatus;
  feeConsession: number;
  timestamp: Timestamp;
}
export interface IPaymentNLForChallan {
  challanId: string;
  paymentId: string;
  studentId: string;
  challanTitle: string;
  amountPaid: number;
  breakdown: IChallanHeaderTypeForChallan[];
  recievedOn: Timestamp;
  recievedBy: string;
  status: IPaymentStatus;
  feeConsession: number;
  timestamp: Timestamp;
}

export interface IChallanNL {
  studentId: string;
  challanId: string;
  challanTitle: string;
  feeHeaders: IChallanHeaderTypeForChallan[];
  totalAmount: number;
  amountPaid: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  createdBy: string;
  createdOn: Timestamp;
  feeDiscount: number;
  dueDate: Timestamp;
  feeConsession: number;
  totalDue?: number;
}

