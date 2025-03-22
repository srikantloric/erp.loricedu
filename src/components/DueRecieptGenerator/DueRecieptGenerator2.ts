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

let paymentTracArr = [
  { date: "05-05-24", amount: 5000 },
  { date: "20-05-24", amount: 2000 },
  { date: "25-05-24", amount: 2000 },
  { date: "02-06-24", amount: 1000 },
];

export const generateDueReciept2 = async (
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
          schoolHeaderStartX + 28,
          schoolContactDetailStartY + 9,
          3,
          3
        );

        doc.text(
          SCHOOL_EMAIL,
          schoolHeaderStartX + 32,
          schoolContactDetailStartY + 11
        );

        doc.setFillColor("#939393");

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
        // doc.text("!!Thank you very much!!", x + 30, feeTypeLayoutHeight + 22);

        //Draw Circle //Danny

        //Challan circle
        doc.setFontSize(6);
        doc.setDrawColor("#000");
        doc.text("Challan Amount", x + 10, feeTypeLayoutHeight + 19);

        let len = paymentTracArr.length;
        len < 5 && len > 0 ? (len -= 1) : (len = 3);
        console.log("len=" + len);

        let i = 0;

        doc.setFont("Poppins", "normal");

        for (i; i < len + 1; i++) {
          let x_padd = cardWidth / (len + 1);

          if (i <= len) {
            doc.circle(x + x_padd * i + 15, feeTypeLayoutHeight + 25, 2);

            //Circle Amount
            doc.text(
              paymentTracArr[i].amount.toString(),
              x + x_padd * i + 12,
              feeTypeLayoutHeight + 22
            );

            //Circle Date
            doc.text(
              paymentTracArr[i].date,
              x + x_padd * i + 10,
              feeTypeLayoutHeight + 30
            );
          }

          //Circle text inside
          doc.setFont("Poppins", "semibold");
          if (i == len) {
            doc.text(`√`, x + x_padd * i + 14.5, feeTypeLayoutHeight + 25.75);

            break;
          } else {
            doc.text(
              `${i}`,
              x + x_padd * i + 14.5,
              feeTypeLayoutHeight + 25.75
            );
            doc.line(
              x + x_padd * i + 17,
              feeTypeLayoutHeight + 25,
              x + x_padd * (i + 1) + 13,
              feeTypeLayoutHeight + 25
            );
          }
        }

        //Danny

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
