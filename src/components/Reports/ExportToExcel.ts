import * as XLSX from "xlsx";
import { StudentDetailsType } from "types/student";
import { SCHOOL_NAME } from "config/schoolConfig";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";

const companyName = "ORIENT PUBLIC SCHOOL";

const ExportToExcel = (students: StudentDetailsType[]) => {

  const headerStyle = {
    fill: { fgColor: { rgb: "000080" } },
    font: { color: { rgb: "FFFFFF" }, bold: true, size: 16 }, // Increase font size and make it bold
  };
  
  const worksheet = XLSX.utils.json_to_sheet([[{v:companyName, s:headerStyle}]]);
  const workbook = XLSX.utils.book_new();

  // Create a style object for the header cell
  // Merge cells in the header row
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 15 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 15 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 15 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 15 } },
  ];
  // Create a worksheet
  XLSX.utils.sheet_add_aoa(worksheet, [
    // Header Title
    [{ v: SCHOOL_NAME, s:{ font: { bold: true } }}],
    // Subtitle
    ["An English Medium School Based on CBSE Syllabus"],
    // Contact details
    ["Address : Patardih, Nawdiha, Jamua, Giridih, Jharkhand - 815312"],
    ["Phone: #91-9973669863,91-9608108499,91-6299820529,91-864007990"],
  ]);

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [
        "SL.",
        "ID",
        "Name",
        "Fathername",
        "Class",
        "Section",
        "Roll",
        "DOB",
        "BloodGroup",
        "Contact",
        "Address",
      ],
    ],
    { origin: { c: 0, r: 5 } }
  );

  for (let i = 0; i < students.length; i++) {
    const currentRow = i + 6;
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [
          i+1,
          students[i].admission_no,
          students[i].student_name,
          students[i].father_name,
          getClassNameByValue(students[i].class!),
          students[i].section,
          students[i].class_roll,
          students[i].dob,
          students[i].blood_group,
          students[i].contact_number,
          students[i].address,
        ],
      ],
      { origin: { c: 0, r: currentRow } }
    );
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Data");
  // Write the workbook to a file
  let currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  let fileName = `export_${currentDate}.xlsx`;

  XLSX.writeFile(workbook, fileName, {
    bookType: "xlsx",
    type: "array",
  });
};

export default ExportToExcel;
