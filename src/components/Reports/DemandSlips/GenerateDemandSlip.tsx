import { getAppConfig } from "hooks/getAppConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { enqueueSnackbar } from "notistack";
import { DemandSlipType } from "types/reports";


import {  POPPINS_BOLD, POPPINS_REGULAR, POPPINS_SEMIBOLD } from "utilities/Base64Url";

const numberToWords = (num: number): string => {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + " " + a[num % 10];
  if (num < 1000)
    return (
      a[Math.floor(num / 100)] +
      " Hundred " +
      (num % 100 === 0 ? "" : "and " + numberToWords(num % 100))
    );
  return (
    numberToWords(Math.floor(num / 1000)) +
    " Thousand " +
    (num % 1000 !== 0 ? numberToWords(num % 1000) : "")
  );
};

export const GenerateDemandSlip = async (
  recieptData: DemandSlipType[]
): Promise<string> => {
  return new Promise((resolve, reject) => {

    const config = getAppConfig();
    if (!config) {
      console.error("Error: App config not found.");
      enqueueSnackbar("Failed to load school configurations,please contact software vendor!")
      return;
    }

    const {
      schoolName: SCHOOL_NAME,
      schoolAddress: SCHOOL_ADDRESS,
      schoolContact: SCHOOL_CONTACT,
      schoolEmail:SCHOOL_EMAIL,
      schoolLogoBase64: SCHOOL_LOGO_BASE64,
    } = config;


    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const cardWidth = (doc.internal.pageSize.getWidth() - 20) / 2;
      const cardHeight = (doc.internal.pageSize.getHeight() - 20) / 2;
      const margin = 5;
      const currentDate = new Date().toLocaleDateString();

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

        doc.addImage(SCHOOL_LOGO_BASE64, x + 2, y + 3, 16, 15);
        doc.setFontSize(12);
        doc.setFont("Poppins", "bold");

        const schoolHeaderStartX = x + 20;
        const schoolHeaderStartY = y + 5;

        doc.text(
          SCHOOL_NAME.toUpperCase(),
          schoolHeaderStartX,
          schoolHeaderStartY + 2,
          {align:"left"}
        );

        doc.setFontSize(6);
        doc.setFont("Poppins", "semibold");
        doc.text(
          "An English Medium School Based on CBSE curriculum",
          schoolHeaderStartX,
          schoolHeaderStartY + 5,
          {align:"left"}
        );

        const schoolContactDetailStartY = schoolHeaderStartY +3;

        const cardXStartPoint = x;
        const cardXEndPoint = cardWidth;

        doc.setFontSize(6);
        doc.setFont("Poppins", "normal");
        doc.text(
          SCHOOL_ADDRESS,
          schoolHeaderStartX,
          schoolContactDetailStartY + 6,
          { maxWidth: cardWidth - 30 },
          {align:"left"}
        );



        doc.text(
          "Contact :"+SCHOOL_CONTACT,
          schoolHeaderStartX ,
          schoolContactDetailStartY + 9
        );



        doc.text(
          "Email :"+SCHOOL_EMAIL,
          schoolHeaderStartX,
          schoolContactDetailStartY + 12
        );

        doc.setFillColor("#939393");

        doc.rect(cardXStartPoint, y + 28, cardXEndPoint, 6, "F");

        doc.setFont("Poppins", "semibold");
        doc.setFontSize(8);
        doc.setTextColor("#000");
        doc.text("Fee Demand Slip", x + 33, y + 32);

        //Demand Slip Design
        doc.setFont("Poppins", "semibold");
        doc.setFontSize(7);
        doc.setTextColor("#000");

        let slipX = x + 5;
        let slipY = y + 40;
        doc.text("Name:", slipX, slipY);
        doc.text("Father:", slipX, slipY + 4);
        doc.text("Admission:", slipX, slipY + 8);
        doc.text("Date:", slipX, slipY + 12);
        doc.text("Class:", slipX + cardWidth / 2 + 2, slipY);
        doc.text("Roll:", slipX + cardWidth / 2 + 2, slipY + 4);
        doc.text("Phone No:", slipX + cardWidth / 2 + 2, slipY + 8);

        doc.setFont("Poppins", "normal");
        doc.text(data.studentDetails.studentName, slipX + 16, slipY);
        doc.text(data.studentDetails.fatherName, slipX + 16, slipY + 4);
        doc.text(
          data.studentDetails.class + " " + data.studentDetails.section,
          slipX + 20 + cardWidth / 2,
          slipY
        );
        doc.text(
          data.studentDetails.rollNumber.toString(),
          slipX + cardWidth / 2 + 20,
          slipY + 4
        );
        doc.text(data.studentDetails.admissionNo, slipX + 16, slipY + 8);
        doc.text(
          data.studentDetails.phoneNumber.toString(),
          slipX + cardWidth / 2 + 20,
          slipY + 8
        );
        doc.text(currentDate, slipX + 16, slipY + 12);

        doc.setLineWidth(0.5);
        doc.line(slipX, slipY + 15, slipX + cardWidth - 10, slipY + 15); // horizontal line

        doc.setFontSize(8);
        doc.setFont("Poppins", "semibold");
        doc.setTextColor("#ff0000"); // Set text color to red

        // Wrap due months
        const dueMonths = data.dueMonths;


        let dueMonthsText = "Due Month(s): ";
        let dueMonthsY = slipY + 21;

        dueMonths.forEach((month: string, i: number) => {
          const textWidth = doc.getTextWidth(dueMonthsText + month);
          if (textWidth > cardWidth - 10) {
            doc.text(dueMonthsText, slipX, dueMonthsY);
            dueMonthsText = month + ", ";
            dueMonthsY += 4;
          } else {
            dueMonthsText += month + (i < dueMonths.length - 1 ? ", " : "");
          }
        });
        doc.text(dueMonthsText, slipX, dueMonthsY);


        const feeDetails = data.feeHeaders.map(item => {
          // Format the header to make it human-readable
          const label = item.header
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, str => str.toUpperCase());

          return [label, item.amount.toString()];
        });



        // Fee details table
        doc.setTextColor("#000");
        autoTable(doc, {
          startY: dueMonthsY + 6,
          head: [["Fee Header", "Due Amount"]],
          body: feeDetails,
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 2,
            halign: "center",
          },
          headStyles: {
            fillColor: [255, 255, 255], // Header color
            textColor: [0, 0, 0],
          },
          margin: { left: slipX, right: slipX + cardWidth - 10 },
          tableWidth: cardWidth - 10,
        });

        const totalFee = data.feeHeaders.reduce((acc, item) => acc + item.amount, 0);
        const totalFeeInWords = numberToWords(totalFee);

        const tableEndY = (doc as any).lastAutoTable.finalY + 5;
        doc.setFontSize(8);
        doc.setFont("Poppins", "semibold");
        doc.text(`Total Fee: ${totalFeeInWords} Only`, slipX, tableEndY);

        // Message at the bottom
        const boxY = y + cardHeight - 15;
        doc.setDrawColor("#000");
        doc.setFillColor("#f0f0f0");
        doc.rect(slipX, boxY, cardWidth - 10, 10, "FD");

        doc.setFontSize(8);
        doc.setFont("Poppins", "semibold");
        doc.setTextColor("#000");
        doc.text(
          "Kindly pay the fee before 15th of the month",
          slipX + 5,
          boxY + 6
        );

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
