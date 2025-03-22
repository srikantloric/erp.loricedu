import jsPDF from "jspdf";
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
import { DueRecieptPropsType } from "types/student";
import autoTable from "jspdf-autotable";

const tableHeader = [
  "DATE",
  "1st SITTING",
  "BREAK",
  "2nd SITTING"
];

const tableData=[
  {
    date:"19/06/24 Monday",
    first_sitting:"Hindi",
    luntch_break:"Luntch",
    second_sitting:"Hindi Oral"
  },
  {
    date:"20/06/24 Tuesday",
    first_sitting:"English",
    luntch_break:"Luntch",
    second_sitting:"English Oral"
  },
  {
    date:"21/06/24 Wednesday",
    first_sitting:"Maths",
    luntch_break:"Luntch",
    second_sitting:"Maths Oral"
  },
  {
    date:"22/06/24 Thursday",
    first_sitting:"Science",
    luntch_break:"Luntch",
    second_sitting:"Science Oral"
  },
];

export const AdmitCardGenerator = async (recieptData: DueRecieptPropsType[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      const cardWidth = (doc.internal.pageSize.getWidth() - 15);
      const cardHeight = (doc.internal.pageSize.getHeight() - 20) / 3;
      const margin = 5;

      recieptData.forEach((data, index) => {
        if (index > 0 && index % 3 === 0) {
          doc.addPage();
        }

        const columnIndex = 0;
        const rowIndex = index % 3;

        const x = columnIndex * (cardWidth + margin) + margin;
        const y = rowIndex * (cardHeight + margin) + margin;

        doc.setTextColor("#000");

        // Load fonts
        doc.addFileToVFS("Poppins-Bold", POPPINS_BOLD);
        doc.addFont("Poppins-Bold", "Poppins", "bold");

        doc.addFileToVFS("Poppins-Regular", POPPINS_REGULAR);
        doc.addFont("Poppins-Regular", "Poppins", "normal");

        doc.addFileToVFS("Poppins-Semibold", POPPINS_SEMIBOLD);
        doc.addFont("Poppins-Semibold", "Poppins", "semibold");
        ///Start of PDF Design

        doc.addImage(LOGO_BASE_64, x + 2, y + 6, 18, 16);
        doc.setFontSize(15);
        doc.setFont("Poppins", "bold");

        const schoolHeaderStartX = x + 25;
        const schoolHeaderStartY = y + 10;

        doc.text(SCHOOL_NAME, schoolHeaderStartX + 7, schoolHeaderStartY);

        doc.setFontSize(6);
        doc.setFont("Poppins", "semibold");
        doc.text(
          "An English Medium School Based on CBSE Syllabus",
          schoolHeaderStartX + 7,
          schoolHeaderStartY + 3
        );

        const schoolContactDetailStartY = schoolHeaderStartY + 2;
        // const schoolContactDetailStartX = schoolHeaderStartX - 5;

        const cardXStartPoint = x;
        const cardXEndPoint = cardWidth;

        doc.setFillColor("#cbc9c9");
        doc.rect(
          schoolHeaderStartX + 3.5,
          schoolContactDetailStartY + 3,
          cardXEndPoint - 35,
          4,
          "F"
        );

        doc.setFontSize(6);
        doc.setFont("Poppins", "normal");
        doc.text(
          SCHOOL_ADDRESS,
          schoolHeaderStartX + 6,
          schoolContactDetailStartY + 6
        );

        //school contact
        doc.addImage(
          PHONE_ICON,
          schoolHeaderStartX + 3,
          schoolContactDetailStartY + 9,
          3,
          3
        );

        doc.text(
          SCHOOL_CONTACT,
          schoolHeaderStartX + 7,
          schoolContactDetailStartY + 11
        );

        //school email
        doc.addImage(
          EMAIL_ICON,
          schoolHeaderStartX + 67,
          schoolContactDetailStartY + 9,
          3,
          3
        );

        doc.text(
          SCHOOL_EMAIL,
          schoolHeaderStartX + 69,
          schoolContactDetailStartY + 11
        );

        doc.setFillColor("#939393");

        doc.rect(cardXStartPoint, y + 28, cardXEndPoint, 6, "F");

        doc.setFont("Poppins", "semibold");
        doc.setFontSize(8);
        doc.setTextColor("#fff");
        doc.text("Final Examination 2024-25  -  ADMIT CARD", cardWidth / 2 - 20, y + 32);

        //Admit Card Design
        doc.setFont("Poppins", "semibold");
        doc.setFontSize(7);
        doc.setTextColor("#000");

        let admitX = x + 5;
        let admitY = y + 40;
        doc.text("Name:", admitX, admitY);
        doc.text("Father's Name:", admitX, admitY + 3);
        doc.text("Class:", admitX + cardWidth / 2, admitY);
        doc.text("Roll:", admitX + cardWidth / 2, admitY + 3);

        doc.text(data.student_name, admitX + 20, admitY);
        doc.text(data.father_name, admitX + 20, admitY + 3);
        doc.text(data.class + " " + data.section, admitX + 20 + cardWidth / 2, admitY);
        doc.text((data.roll_number).toString(), admitX + cardWidth / 2 + 20, admitY + 3);

        let tableY=admitY+7;
        let tableX = admitX+3;
        const rows = tableData.map(obj => Object.values(obj));
        autoTable(doc, {
          head: [tableHeader],
          body: rows,
          startY: tableY,
          theme: "grid",
          styles: {
            textColor: "#000",
            fontSize: 8,
          },
          margin: { left: tableX + 20 },
          headStyles: {
            cellWidth: 30,
            fillColor: "#fff",
            textColor: "#000",
            minCellHeight: 4,
          },
        });

        //Adding Signature
        admitY+=50;
        doc.text("Class Teacher's Sign",admitX+10,admitY);
        doc.text("Principal",admitX+60+cardWidth/2,admitY);

        ///End Of PDF DESIGN
        // Draw border around content
        doc.setDrawColor("#949494");
        doc.rect(x, y, cardWidth, cardHeight);

        if (index === recieptData.length - 1) {
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