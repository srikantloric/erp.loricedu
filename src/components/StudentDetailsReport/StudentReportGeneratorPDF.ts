import {
  EMAIL_ICON,
  LOGO_BASE_64,
  PHONE_ICON,
  POPPINS_BOLD,
  POPPINS_REGULAR,
  POPPINS_SEMIBOLD,
} from "utilities/Base64Url";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { StudentDetailsType } from "types/student";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";
import { getAppConfig } from "hooks/getAppConfig";

interface Column {
  id: string;
  title: string;
  lookup?: { [key: string]: string };
}

export const StudReportPDF = async (
  students: StudentDetailsType[],
  selectedColumns?: Array<{
    field: string;
    title: string;
    lookup?: { [key: string]: string };
  }>
) => {
  return new Promise((resolve, reject) => {
    // Do not sort the students array - use the order provided by the caller

    // Convert selectedColumns to the format expected by the PDF generator
    const columns: Column[] =
      selectedColumns?.map((col) => ({
        id: col.field,
        title: col.title,
        lookup: col.lookup,
      })) || [];

    const config = getAppConfig();
    if (!config) {
      console.error("Error: App config not found.");
      return;
    }
    const {
      schoolName: SCHOOL_NAME,
      schoolAddress: SCHOOL_ADDRESS,
      schoolContact: SCHOOL_CONTACT,
      schoolEmail: SCHOOL_EMAIL,
    } = config;

    try {
      const doc = new jsPDF({
        orientation: "l",
        unit: "mm",
        format: "a4",
      });

      const cardWidth = doc.internal.pageSize.getWidth() - 15;
      const cardHeight = doc.internal.pageSize.getHeight() - 15;
      const margin = 2;

      const x = 5 + margin;
      const y = 5 + margin;

      doc.setTextColor("#000");

      // Load fonts
      doc.addFileToVFS("Poppins-Bold", POPPINS_BOLD);
      doc.addFont("Poppins-Bold", "Poppins", "bold");
      doc.addFileToVFS("Poppins-Regular", POPPINS_REGULAR);
      doc.addFont("Poppins-Regular", "Poppins", "normal");
      doc.addFileToVFS("Poppins-Semibold", POPPINS_SEMIBOLD);
      doc.addFont("Poppins-Semibold", "Poppins", "semibold");

      // PDF Header section
      doc.addImage(LOGO_BASE_64, x + 45, y + 1, 30, 25);

      const schoolHeaderStartX = x + 75;
      const schoolHeaderStartY = y + 5;

      doc.setFontSize(15);
      doc.setFont("Poppins", "bold");
      doc.text(SCHOOL_NAME, schoolHeaderStartX + 10, schoolHeaderStartY);

      doc.setFontSize(8);
      doc.setFont("Poppins", "semibold");
      doc.text(
        "An English Medium School Based on CBSE Syllabus",
        schoolHeaderStartX + 7,
        schoolHeaderStartY + 5
      );

      const schoolContactDetailStartY = schoolHeaderStartY + 2;
      const cardXStartPoint = x;
      const cardXEndPoint = cardWidth;

      // School address section
      doc.setFillColor("#cbc9c9");
      doc.rect(
        schoolHeaderStartX + 5,
        schoolContactDetailStartY + 5,
        cardXEndPoint - 200,
        4,
        "F"
      );

      doc.setFontSize(6);
      doc.setFont("Poppins", "normal");
      doc.text(
        SCHOOL_ADDRESS,
        schoolHeaderStartX + 12,
        schoolContactDetailStartY + 7.5
      );

      // School contact info
      doc.addImage(
        PHONE_ICON,
        schoolHeaderStartX + 9,
        schoolContactDetailStartY + 10,
        3,
        3
      );
      doc.text(
        SCHOOL_CONTACT,
        schoolHeaderStartX + 13,
        schoolContactDetailStartY + 12
      );

      doc.addImage(
        EMAIL_ICON,
        schoolHeaderStartX + 34,
        schoolContactDetailStartY + 10,
        3,
        3
      );
      doc.text(
        SCHOOL_EMAIL,
        schoolHeaderStartX + 38,
        schoolContactDetailStartY + 12
      );

      // Title section
      doc.setFillColor("#939393");
      doc.rect(cardXStartPoint, y + 26, cardXEndPoint, 6, "F");
      doc.setFont("Poppins", "semibold");
      doc.setFontSize(9);
      doc.setTextColor("#fff");

      let headerText = `STUDENT DETAILS Class ${students[0].class}`;

      // Center the text properly
      const textWidth = doc.getTextWidth(headerText);
      const centerX = (cardWidth - textWidth) / 2;
      doc.text(headerText, x + centerX, y + 30);

      let tableX = x + 5;
      let tableY = y + 25;

      // Table generation
      autoTable(doc, {
        head: [columns.map((col) => col.title)],
        body: students.map((item, index) => {
          return columns.map((col) => {
            switch (col.id) {
              case "sl":
                return (index + 1).toString();
              case "class":
                if (item.class !== undefined && item.class !== null) {
                  const classValue = Number(item.class);
                  if (!isNaN(classValue)) {
                    // Try lookup table first, then utility function
                    const className =
                      col.lookup?.[classValue] ||
                      getClassNameByValue(classValue);
                    return className || classValue.toString();
                  }
                  return item.class.toString();
                }
                return "-";
              default:
                const value = item[col.id as keyof StudentDetailsType];
                return value !== undefined && value !== null
                  ? String(value)
                  : "";
            }
          }) as string[]; // Explicitly specify string[] type
        }),
        startY: tableY + 20,
        theme: "grid",
        styles: {
          textColor: "#000",
          fontSize: 8,
          valign: "middle",
        },
        margin: { left: tableX },
        headStyles: {
          fillColor: "#fff",
          textColor: "#000",
          minCellHeight: 4,
        },
      });

      // Border and finalization
      doc.setDrawColor("#949494");
      doc.rect(x, y, cardWidth, cardHeight);

      // Generate URL and resolve
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      resolve(url);
    } catch (error) {
      reject(error);
    }
  });
};
