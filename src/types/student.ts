import { FieldValue, Timestamp } from "firebase/firestore";

export type StudentDetailsType = {
  aadhar_number: string;
  address: string;
  admission_no: string;
  alternate_number: string;
  blood_group: string;
  caste: string;
  city: string;
  class: number | null;
  class_roll: string;
  contact_number: string;
  date_of_addmission: string;
  dob: string;
  email: string;
  father_name: string;
  father_occupation: string;
  father_qualification: string;
  gender: string;
  id: string;
  mother_name: string;
  mother_occupation: string;
  motherqualifiation: string;
  postal_code: string;
  profil_url: string;
  religion: string;
  section: string;
  state: string;
  student_id: string;
  student_name: string;
  monthly_fee: number | null;
  computer_fee: number | null;
  admission_fee?: number | null;
  created_at?: Timestamp | FieldValue | null;
  transportation_fee: number | null;
  generatedChallans: string[];
  fee_discount?: number | null;
  updated_at?: FieldValue | null;
  student_pass?:string
};

export interface StudentFeeDetailsType {
  credit_by: string;
  discount_amount: number;
  student_id: string;
  fee_title: string;
  fee_total: number;
  computer_fee: number;
  transportation_fee: number;
  id: string;
  late_fee: number;
  paid_amount: number;
  payment_date:
  | Timestamp
  | FieldValue
  | null;
  payment_mode: string;
  payment_remarks: string;
  created_at?: Timestamp | FieldValue;
  fee_month_year?: string;
  is_payment_done: boolean;
  doc_id: string;
  payment_due_date: string;
  fee_header_type: string;
  monthly_fee?: number;

  //fee headers extra
  annual_fee?: number;
  other_fee?: number;
  admission_fee?: number;
  exam_fee?: number;

  //optional
  total_due?: number
}

type feeHeadType = {
  title: string;
  value: number;
};

export type DueRecieptPropsType = {
  reciept_id: string;
  current_session: string;
  due_date: string;
  due_month: string;
  student_name: string;
  class: string;
  father_name: string;
  dob: string;
  phone_number: number;
  roll_number: number;
  admission_no: string;
  section: string;
  address: string;
  fee_heads: feeHeadType[];
  note: string;
};

export type BalanceSheetType = {
  tran_id: string;
  tran_type: string;
  tran_name: string;
  tran_desc: string;
  tran_amount: string;
};


export interface IStudentFeeChallan {
  docIdExt: string,
  studentId: string,
  challanDocId: string,
  createdAt: FieldValue;
  createdBy?: string,
  paymentId: string,
  challanTitle: string,
  paymentStatus: string,
  paymentDueDate: string,
  monthlyFee: number,
  lateFine: number,
  transportationFee: number,
  computerFee: number,

}

export interface IStudentFeeChallanExtended extends IStudentFeeChallan {
  admissionFee?: number;
  examFee?: number;
  annualFee?: number;
  otherFee?: number;
  totalDue?: number;
  feeConsession?: number;
  paidAmount?: number;
  paymentRecievedDate?: string;
  paymentRecievedBy?: string;
  challanCreationDate?: FieldValue,
  challanCreatedBy?: string,
  paymentRecivedDate?: string,
  sumOfHeaders?: number,
}


