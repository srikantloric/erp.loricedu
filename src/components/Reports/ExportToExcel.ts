import * as XLSX from "xlsx";
import { StudentDetailsType } from "types/student";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";
import { getAppConfig } from "hooks/getAppConfig";

interface Column {
  field: string;
  title: string;
}

interface ExportToExcelConfig {
  data: StudentDetailsType[];
  columns?: Column[];
  filename?: string;
}

const ExportToExcel = ({ data, columns, filename }: ExportToExcelConfig) => {
  const config = getAppConfig();
  if (!config) {
    console.error("Error: App config not found.");
    return;
  }
  const { schoolName: SCHOOL_NAME } = config;

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  // Add school header information
  XLSX.utils.sheet_add_aoa(worksheet, [
    [SCHOOL_NAME],
    ["An English Medium School Based on CBSE Syllabus"],
    ["Address : Patardih, Nawdiha, Jamua, Giridih, Jharkhand - 815312"],
    ["Phone: #91-9973669863,91-9608108499,91-6299820529,91-864007990"],
    [], // Empty row for spacing
  ]);

  // Merge cells for header
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 15 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 15 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 15 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 15 } },
  ];

  // Get columns configuration
  const tableColumns = columns || [
    { field: "admission_no", title: "ID" },
    { field: "student_name", title: "Name" },
    { field: "father_name", title: "Father Name" },
    { field: "class", title: "Class" },
    { field: "section", title: "Section" },
    { field: "rollNumber", title: "Roll" },
    { field: "contact_number", title: "Contact" },
    { field: "address", title: "Address" }
  ];

  // Add column headers
  const headers = ["SL.", ...tableColumns.map(col => col.title)];
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A5" });

  // Add data rows
  const rows = data.map((student, index) => {
    const row = [index + 1];
    tableColumns.forEach(col => {
      let value = (student as any)[col.field];

      // Format special fields
      if (col.field === "class" && value) {
        value = getClassNameByValue(value);
      } else if (col.field === "contact_number" && value) {
        value = `+91-${value}`;
      } else if (["monthly_fee", "computer_fee", "transportation_fee"].includes(col.field)) {
        value = value ? `₹${value}` : '-';
      }

      row.push(value || '-');
    });
    return row;
  });

  // Add rows to worksheet
  XLSX.utils.sheet_add_aoa(worksheet, rows, { origin: "A6" });

  // Auto-size columns
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let max = 0;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = worksheet[XLSX.utils.encode_cell({ c: C, r: R })];
      if (cell && cell.v) {
        const length = cell.v.toString().length;
        if (length > max) max = length;
      }
    }
    worksheet["!cols"] = worksheet["!cols"] || [];
    worksheet["!cols"][C] = { wch: max + 2 }; // Add some padding
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Data");

  // Generate filename
  const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
  const outputFilename = filename || `students_list_${currentDate}.xlsx`;

  // Write the file
  XLSX.writeFile(workbook, outputFilename);
};

export default ExportToExcel;
