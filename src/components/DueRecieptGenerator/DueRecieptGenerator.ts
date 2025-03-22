import jsPDF from "jspdf";
import {
  EMAIL_ICON,
  HOME_ICON,
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

export const generateDueReciept = async (
  recieptData: DueRecieptPropsType[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      const cardWidth = (doc.internal.pageSize.getWidth() - 15) / 2;
      const cardHeight = (doc.internal.pageSize.getHeight() - 15) / 2;
      const margin = 5;

      recieptData.forEach((data, index) => {
        if (index > 0 && index % 4 === 0) {
          doc.addPage();
        }

        const columnIndex = index % 2;
        const rowIndex = Math.floor(index / 2) % 2;

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

        doc.text(SCHOOL_NAME, schoolHeaderStartX, schoolHeaderStartY);

        const schoolContactDetailStartY = schoolHeaderStartY + 2;
        // const schoolContactDetailStartX = schoolHeaderStartX - 5;

        doc.addImage(
          HOME_ICON,
          schoolHeaderStartX,
          schoolContactDetailStartY,
          3,
          3
        );

        doc.setFontSize(6);
        doc.setFont("Poppins", "normal");
        doc.text(
          SCHOOL_ADDRESS,
          schoolHeaderStartX + 4,
          schoolContactDetailStartY + 3
        );

        //school contact
        doc.addImage(
          PHONE_ICON,
          schoolHeaderStartX,
          schoolContactDetailStartY + 5,
          3,
          3
        );

        doc.text(
          SCHOOL_CONTACT,
          schoolHeaderStartX + 4,
          schoolContactDetailStartY + 8
        );

        //school email
        doc.addImage(
          EMAIL_ICON,
          schoolHeaderStartX,
          schoolContactDetailStartY + 10,
          3,
          3
        );

        doc.text(
          SCHOOL_EMAIL,
          schoolHeaderStartX + 4,
          schoolContactDetailStartY + 12.5
        );

        doc.setFillColor("#939393");

        const cardXStartPoint = x;
        const cardXEndPoint = cardWidth;

        doc.rect(cardXStartPoint, y + 32, cardXEndPoint, 6, "F");

        doc.setFont("Poppins", "semibold");
        doc.setFontSize(8);
        doc.setTextColor("#fff");
        doc.text("Due Reciept", x + 3, y + 36);

        doc.text("Session : 2024_25", x + cardWidth - margin, y + 36, {
          align: "right",
        });

        ///rectangle 2
        doc.setFillColor("#cbc9c9");
        doc.rect(cardXStartPoint, y + 38.5, cardXEndPoint, 6, "F");
        doc.setTextColor("#000");

        doc.setFontSize(8);
        doc.text("Reciept No: " + data.reciept_id, x + 3, y + 42);

        doc.text(
          "Due Date : " + data.due_date,
          x + cardWidth - margin,
          y + 42,
          {
            align: "right",
          }
        );

        //students details
        doc.setFontSize(8);
        doc.setFont("Poppins", "normal");

        let studentDetailsStartY = y + 49;

        doc.text("Name: " + data.student_name, x + 3, studentDetailsStartY);

        doc.text(
          "Class : " + data.class,
          x + cardWidth - margin,
          studentDetailsStartY,
          {
            align: "right",
          }
        );

        doc.text(
          "Father Name: " + data.father_name,
          x + 3,
          studentDetailsStartY + 4.5
        );

        doc.text(
          "DOB : " + data.dob,
          x + cardWidth - margin,
          studentDetailsStartY + 4.5,
          {
            align: "right",
          }
        );

        doc.text(
          "Phone No: " + data.phone_number,
          x + 3,
          studentDetailsStartY + 8.5
        );

        doc.text(
          "Roll No: " + data.roll_number,
          x + cardWidth - margin,
          studentDetailsStartY + 8.5,
          {
            align: "right",
          }
        );

        doc.text(
          "Section: " + data.section,
          x + cardWidth - margin,
          studentDetailsStartY + 12.5,
          {
            align: "right",
          }
        );

        doc.text(
          "Reg. No : " + data.admission_no,
          x + 3,
          studentDetailsStartY + 12.5
        );

        doc.text(
          "Address : " + data.address,
          x + 3,
          studentDetailsStartY + 16.5
        );

        //line before fee month details
        const feeSectionStartPointY = studentDetailsStartY + 27;
        doc.setDrawColor("#949494");
        doc.setFont("Poppins", "normal");
        doc.line(
          x,
          feeSectionStartPointY - 8,
          x + cardWidth,
          feeSectionStartPointY - 8
        );
        doc.setFontSize(10);
        doc.text(
          "Due Months : " + data.due_month,
          x + 3,
          feeSectionStartPointY - 4
        );

        ///rectangle after fee month
        doc.setFillColor("#cbc9c9");

        doc.rect(
          cardXStartPoint,
          feeSectionStartPointY - 2,
          cardXEndPoint,
          6,
          "F"
        );
        doc.setFillColor("#000");
        doc.rect(
          cardXStartPoint,
          feeSectionStartPointY - 2,
          cardXEndPoint,
          6,
          "S"
        );
        doc.setFont("Poppins", "semibold");
        doc.setTextColor("#373743");
        doc.setFontSize(9);

        doc.text("SL", x + 3, feeSectionStartPointY + 2.5);
        doc.text("Particular", x + 15, feeSectionStartPointY + 2.5);
        doc.text(
          "Due Amount",
          x + cardWidth - margin,
          feeSectionStartPointY + 2.5,
          { align: "right" }
        );

        ///table layout
        let feeTypeLayoutHeight = 1;

        let calculatedDueTotal = 0;
        data.fee_heads.forEach((head, i) => {
          calculatedDueTotal += head.value;
          feeTypeLayoutHeight = feeSectionStartPointY - 2 + (i + 2) * 6;
          doc.text("" + (i + 1), x + 4, feeTypeLayoutHeight, {
            align: "center",
          });
          doc.text(head.title, x + 15, feeTypeLayoutHeight, {
            align: "left",
          });

          doc.text("" + head.value, x + cardWidth - 5, feeTypeLayoutHeight, {
            align: "right",
          });

          doc.setDrawColor("#cbc9c9");
          doc.line(
            x,
            feeTypeLayoutHeight + 2,
            x + cardWidth,
            feeTypeLayoutHeight + 2
          );
        });

        doc.line(
          x + 10,
          feeSectionStartPointY + 4,
          x + 10,
          feeTypeLayoutHeight + 10
        );

        doc.line(
          x + cardWidth / 2 + 15,
          feeSectionStartPointY + 4,
          x + cardWidth / 2 + 15,
          feeTypeLayoutHeight + 2
        );
        doc.setFont("Poppins", "semibold");
        doc.text(
          "Total Due Amount: Rs." + calculatedDueTotal,
          x + cardWidth - 3,
          feeTypeLayoutHeight + 7,
          { align: "right" }
        );
        doc.line(
          x,
          feeTypeLayoutHeight + 10,
          x + cardWidth,
          feeTypeLayoutHeight + 10
        );

        doc.setFont("Poppins", "semibold");
        doc.setTextColor("#FF0000");
        doc.text("Note:", x + 3, feeTypeLayoutHeight + 15);

        doc.setFont("Poppins", "normal");
        doc.setTextColor("#000");
        doc.setFontSize(7);

        const longText = "" + data.note;
        const maxWidth = cardWidth; //Maximum width of one reciept

        const lines = doc.splitTextToSize(longText, maxWidth - 3);

        lines.forEach((line: any) => {
          doc.text(line, x + 3, feeTypeLayoutHeight + 19);
          feeTypeLayoutHeight += 4;
        });

        doc.setFont("Poppins", "semibold");
        doc.setTextColor("#FF0000");
        doc.setFontSize(9);
        doc.text("!!Thank you very much!!", x + 30, feeTypeLayoutHeight + 22);

        ///End Of PDF DESIGN
        // Draw border around content
        doc.setDrawColor("#949494");
        doc.rect(x, y, cardWidth, cardHeight);

        if (index === recieptData.length - 1) {
          // Save PDF and update state with URL
          const blob = doc.output("blob");
          // doc.save("save.pdf")
          var blobUrl = URL.createObjectURL(blob);

          resolve(blobUrl);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
