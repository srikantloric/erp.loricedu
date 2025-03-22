import {
  EMAIL_ICON,
  LOGO_BASE_64,
  PHONE_ICON,
  POPPINS_BOLD,
  POPPINS_REGULAR,
  POPPINS_SEMIBOLD,
} from "utilities/Base64Url";
import {
  SCHOOL_ADDRESS,
  SCHOOL_CONTACT,
  SCHOOL_EMAIL,
  SCHOOL_NAME,
} from "config/schoolConfig";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const DailyAttendanceReport = async ():Promise<string> => {
  let DailyAttClassHeader = [
    "Class",
    "Present",
    "P/Late",
    "Half Day",
    "Leave",
    "Absent",
    "Not Marked",
    "Total",
  ];

  let DailyAttClassBody = [
    ["Nursary", "4", "0", "0", "0", "0", "0", "4"],
    ["Class 1", "0", "0", "0", "0", "0", "0", "0"],
    ["Class 2", "0", "0", "0", "0", "0", "0", "0"],
    ["Class 3", "0", "0", "0", "0", "0", "0", "0"],
    ["Class 4", "0", "0", "0", "0", "0", "0", "0"],
    ["Class 5", "0", "0", "0", "0", "0", "0", "0"],
    ["Class 6", "0", "0", "0", "0", "0", "0", "0"],
  ];

  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });
      const cardWidth = doc.internal.pageSize.getWidth() - 15;
      const cardHeight = doc.internal.pageSize.getHeight() - 15;
      const margin = 2;

      const x = 5 + margin;
      const y = 5 + margin;
      // const y=cardHeight+margin;

      doc.setTextColor("#000");

      // Load fonts
      doc.addFileToVFS("Poppins-Bold", POPPINS_BOLD);
      doc.addFont("Poppins-Bold", "Poppins", "bold");

      doc.addFileToVFS("Poppins-Regular", POPPINS_REGULAR);
      doc.addFont("Poppins-Regular", "Poppins", "normal");

      doc.addFileToVFS("Poppins-Semibold", POPPINS_SEMIBOLD);
      doc.addFont("Poppins-Semibold", "Poppins", "semibold");
      ///Start of PDF Design

      doc.addImage(LOGO_BASE_64, x + 8, y + 2, 30, 25);

      const schoolHeaderStartX = x + 50;
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
      // const schoolContactDetailStartX = schoolHeaderStartX - 5;

      const cardXStartPoint = x;
      const cardXEndPoint = cardWidth;

      doc.setFillColor("#cbc9c9");
      doc.rect(
        schoolHeaderStartX + 5,
        schoolContactDetailStartY + 5,
        cardXEndPoint - 140,
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

      //school contact
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

      //school email
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

      doc.setFillColor("#939393");

      doc.rect(cardXStartPoint, y + 26, cardXEndPoint, 6, "F");

      doc.setFont("Poppins", "semibold");
      doc.setFontSize(9);
      doc.setTextColor("#fff");
      doc.text("Daily Attendance Report", cardWidth / 2 - 8, y + 30);

      let tableX = x - 3;
      let tableY = y + 43.5;

      autoTable(doc, {
        head: [DailyAttClassHeader],
        body: DailyAttClassBody,
        startY: tableY,
        theme: "grid",
        styles: {
          textColor: "#000",
          fontSize: 8,
        },
        margin: { left: tableX + 20 },
        headStyles: {
          cellWidth: 20,
          fillColor: "#fff",
          textColor: "#000",
          minCellHeight: 4,
        },
      });

      DailyAttClassBody.forEach((data, index) => {
        // Draw border around content
        doc.setDrawColor("#949494");
        doc.rect(x, y, cardWidth, cardHeight);

        if (index === DailyAttClassBody.length - 1) {
          // Save PDF and update state with URL

          // Convert PDF to Blob
          const blob = doc.output("blob");
          const url = URL.createObjectURL(blob);

          resolve(url);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default DailyAttendanceReport;
