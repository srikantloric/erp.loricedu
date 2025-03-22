export const FEE_TYPE_MONTHLY = "M01";
export const FEE_HEADERS = [
  {
    title: "Examination Fee",
    titleShort: "EXAM",
    field: "examFee",
  },
  {
    title: "Anual Fee",
    titleShort: "ANUAL",
    field: "annualFee",
  },
  {
    title: "Admission Fee",
    titleShort: "ADD.",
    field: "admissionFee",
  },
  {
    title: "Other Fee",
    titleShort: "OTHER",
    field: "otherFee",
  },
];

///Payment state
export const paymentStatus = {
  DEFAULT: "UNPAID",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
};
export enum SCHOOL_CLASSES {
  PRE_NURSERY = 14,
  NURSERY = 1,
  LKG = 2,
  UKG = 3,
  STD_1 = 4,
  STD_2 = 5,
  STD_3 = 6,
  STD_4 = 7,
  STD_5 = 8,
  STD_6 = 9,
  STD_7 = 10,
  STD_8 = 11,
  STD_9 = 12,
  STD_10 = 12,
} 
