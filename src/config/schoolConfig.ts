
export interface SchoolClass {
  title: string;
  value: number;
  id: number;
}

export const SCHOOL_CLASSES:SchoolClass[] = [
  { title: "Pre-Nursery", value: 14, id: 14 },
  { title: "Nursery", value: 1, id: 1 },
  { title: "LKG", value: 2, id: 2 },
  { title: "UKG", value: 3, id: 3 },
  { title: "STD-1", value: 4, id: 4 },
  { title: "STD-2", value: 5, id: 5 },
  { title: "STD-3", value: 6, id: 6 },
  { title: "STD-4", value: 7, id: 7 },
  { title: "STD-5", value: 8, id: 8 },
  { title: "STD-6", value: 9, id: 9 },
  { title: "STD-7", value: 10, id: 10 },
  { title: "STD-8", value: 11, id: 11 },
  { title: "STD-9", value: 12, id: 12 },
  { title: "STD-10", value: 13, id: 13 },
];

export const SCHOOL_SECTIONS = [
  { title: "SEC-A", value: "A", id: 1 },
  { title: "SEC-B", value: "B", id: 2 },
  { title: "SEC-C", value: "C", id: 3 },
  { title: "SEC-D", value: "D", id: 4 },
];

export const SCHOOL_FEE_MONTHS = [
  {
    title: "January",
    value: 1
  },
  {
    title: "Feburary",
    value: 2
  },
  {
    title: "March",
    value: 3
  },
  {
    title: "April",
    value: 4
  },
  {
    title: "May",
    value: 5
  },
  {
    title: "June",
    value: 6
  },
  {
    title: "July",
    value: 7
  },
  {
    title: "August",
    value: 8
  },
  {
    title: "September",
    value: 9
  },
  {
    title: "October",
    value: 10
  },
  {
    title: "November",
    value: 11
  },
  {
    title: "December",
    value: 12
  },
];

export const SCHOOL_FEE_YEAR = [
  {
    title: "2019",
    value: "2019"
  },
  {
    title: "2020",
    value: "2020"
  },
  {
    title: "2022",
    value: "2022"
  },
  {
    title: "2023",
    value: "2023"
  },
  {
    title: "2024",
    value: "2024"
  },
  {
    title: "2025",
    value: "2025"
  }
]


export const SCHOOL_GENDERS = [
  {

    title: "Male",
    value: "male"

  },
  {

    title: "Female",
    value: "female"

  },
  {

    title: "Other",
    value: "other"

  },

]

export const BLOOD_GROUPS = [
  { title: "N/A", value: "NA" },
  { title: "A+", value: "A+" },
  { title: "A-", value: "A-" },
  { title: "B+", value: "B+" },
  { title: "B-", value: "B-" },
  { title: "O+", value: "O+" },
  { title: "O-", value: "O-" },
  { title: "AB+", value: "AB+" },
  { title: "AB-", value: "AB-" },
];

export const RELIGIONS = [
  { title: "Hinduism", value: "Hinduism" },
  { title: "Islam", value: "Islam" },
  { title: "Christianity", value: "Christianity" },
  { title: "Sikhism", value: "Sikhism" },
  { title: "Buddhism", value: "Buddhism" },
  { title: "Jainism", value: "Jainism" },
  { title: "Other", value: "Other" },
];

export const CASTES = [
  { title: "General", value: "General" },
  { title: "Scheduled Caste (SC)", value: "SC" },
  { title: "Scheduled Tribe (ST)", value: "ST" },
  { title: "Other Backward Class (OBC)", value: "OBC" },
  { title: "Economically Weaker Section (EWS)", value: "EWS" },
  { title: "Other", value: "Other" },
];


export const SCHOOL_SESSIONS = [
  { title: "2025-26", value: "2025-2026" },
  { title: "2024-25", value: "2024-25" },
]