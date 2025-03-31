// Define the TypeScript interface for category structure
export interface ExpenseCategory {
  id: string|number;
  name: string;
  description: string;
  subcategories: string[];
}

// Define the expense categories data
export const ExpenseCatSubCatData: ExpenseCategory[] = [
  {
    id: 1,
    name: "Salaries & Wages",
    description: "Expenses related to staff salaries, bonuses, and overtime payments.",
    subcategories: [
      "Teaching Staff Salaries",
      "Non-Teaching Staff Salaries",
      "Bonuses & Incentives",
      "Overtime Payments",
      "Other"
    ]
  },
  {
    id: 2,
    name: "Utilities & Maintenance",
    description: "Covers bills and maintenance costs for the school's infrastructure.",
    subcategories: [
      "Electricity Bills",
      "Water Bills",
      "Internet & Phone Services",
      "Building Repairs & Maintenance",
      "Security Services",
      "Other"
    ]
  },
  {
    id: 3,
    name: "Academic Expenses",
    description: "Costs related to textbooks, stationery, and learning resources.",
    subcategories: [
      "Textbooks & Study Materials",
      "Stationery & Supplies",
      "Laboratory Equipment",
      "Library Books & Digital Subscriptions",
      "Other"
    ]
  },
  {
    id: 4,
    name: "IT & Software",
    description: "Technology-related expenses for software, hardware, and IT services.",
    subcategories: [
      "School Management Software",
      "Learning Management System (LMS)",
      "Website Hosting & Maintenance",
      "Computer & Network Maintenance",
      "Cybersecurity Solutions",
      "Other"
    ]
  },
  {
    id: 5,
    name: "Transportation",
    description: "Costs associated with student and staff transportation.",
    subcategories: [
      "School Bus Fuel",
      "Driver Salaries",
      "Vehicle Insurance",
      "Bus Maintenance & Repairs",
      "GPS Tracking System",
      "Other"
    ]
  },
  {
    id: 6,
    name: "Extracurricular Activities",
    description: "Expenses for sports, music, arts, and other student activities.",
    subcategories: [
      "Sports Equipment & Uniforms",
      "Music & Art Supplies",
      "School Events & Competitions",
      "Field Trips & Excursions",
      "Guest Lecturers & Workshops",
      "Other"
    ]
  },
  {
    id: 7,
    name: "Administration & Office Expenses",
    description: "General administration costs including office supplies and legal fees.",
    subcategories: [
      "Office Supplies",
      "Printing & Photocopying",
      "Postage & Courier Services",
      "Legal & Compliance Fees",
      "Staff Training & Development",
      "Other"
    ]
  },
  {
    id: 8,
    name: "Student Welfare",
    description: "Funds allocated for student financial aid, health, and well-being.",
    subcategories: [
      "Scholarships & Financial Aid",
      "Medical & Health Services",
      "Counseling Services",
      "Meals & Canteen Expenses",
      "Hygiene & Sanitation",
      "Other"
    ]
  },
  {
    id: 9,
    name: "Infrastructure & Rent",
    description: "Expenses for rent, classroom equipment, and building maintenance.",
    subcategories: [
      "Building Rent/Mortgage Payments",
      "Furniture & Classroom Equipment",
      "Classroom Renovation & Expansion",
      "Fire Safety & Emergency Equipment",
      "Other"
    ]
  },
  {
    id: 10,
    name: "Marketing & Promotion",
    description: "Costs related to advertising, branding, and promotional materials.",
    subcategories: [
      "Advertisements (Online & Print)",
      "Social Media Marketing",
      "School Prospectus & Brochures",
      "Public Relations & Branding",
      "Other"
    ]
  },
  {
    id: 11,
    name: "Inventories & Supplies",
    description: "Procurement of classroom, laboratory, and sports supplies.",
    subcategories: [
      "Classroom Supplies",
      "Laboratory Supplies",
      "Library Books & Digital Resources",
      "Sports Equipment & Uniforms",
      "Canteen & Kitchen Supplies",
      "Cleaning & Sanitation Supplies",
      "Other"
    ]
  }
];
