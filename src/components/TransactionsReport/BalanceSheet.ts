
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

import {jsPDF} from "jspdf";
import autoTable from "jspdf-autotable";
import { BalanceSheetType } from "types/student";



export const BalanceSheet = async (
  transData: BalanceSheetType[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: "l",
        unit: "mm",
        format: "a4",

      });
      // const autotable = new autoTable(doc);

      const cardWidth = (doc.internal.pageSize.getWidth() - 15);
      const cardHeight = (doc.internal.pageSize.getHeight() - 15);
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

      doc.addImage(LOGO_BASE_64, x + 8, y+2, 30, 25);

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
      doc.text("BALANCE SHEET", cardWidth / 2, y + 30);



      //Again Start
      let bodyX = x + 10;
      let bodyY = y + 35;
      var i = 0, j = 0;
      let cellx = bodyX
      let celly = bodyY + 5;
      let cellWidth = cardWidth / 3 -7;
      doc.setLineWidth(0.2);
      doc.setDrawColor("#000");

      for (i = 1; i <= 12; i++) {
        doc.line(bodyX, bodyY + 5, cardWidth-4.5, bodyY+5);
        (i % 4 == 0) ? (bodyY += 10) : (bodyY += 5);
      }
      //Vertical Line
      for (i = 1; i <= 3; i++) {
        cellx = bodyX;
        for (j = 1; j <= 4; j++) {
          doc.line(cellx, celly, cellx, celly + 15);
          cellx += cellWidth;
        }
        celly += 25;
      }

      //End Again


      // const columns1 = [['Name', 'Value']];
      const data1 = [
        ['Total Students:', "16(+1)"],
        ['Enrolled Students:', "16(+1)"],
        ['Today Adm:', "1"],
        ['Today Withdrawls:', "0"],
        ['Present Students:', "11"],
        ['Absent Students:', "5"],
        ['Students on Leave:', "2"]
      ];

      // Set up the table parameters
      let tableX = x + 10;
      let tableY = y + 43.5;

      doc.setFont("Poppins", "bold");
      doc.setFontSize(12);
      doc.setTextColor("#c50000");
      doc.text("Students Report:", cardWidth/2, tableY - 6.5);

      doc.setLineWidth(0.5);
      doc.setDrawColor("#000");
      doc.setFillColor("#fff");
      doc.setFontSize(9);
      doc.setTextColor("#000");
      i = 0;


      for (i; i < data1.length; i += 3) {
        var x1 = tableX+5;
        doc.text(data1[i][0], x1, tableY);
        doc.text(data1[i][1], x1 + 60, tableY);
        // doc.rect(x1-2, tableY-5, x1+50, 7);
        if (data1[i + 1]) {
          x1+=cellWidth;
          doc.text(data1[i + 1][0], x1, tableY);
          doc.text(data1[i + 1][1], x1 + 60, tableY);
          // doc.rect(x1+73, tableY-5, x1+55, 7);
        } else {
          console.log("Data ended");
        }
        if (data1[i + 2]) {
          x1+=cellWidth;
          doc.text(data1[i + 2][0], x1 , tableY);
          doc.text(data1[i + 2][1], x1 + 60, tableY);
          // doc.rect(x1+155, tableY-5, x1+55, 7);
        } else {
          console.log("Data ended");
        }
        tableY += 5; // Increase y-coordinate for the next row
      }



      tableY += 10;
      doc.setFont("Poppins", "bold");
      doc.setFontSize(12);
      doc.setTextColor("#c50000");
      doc.text("Faculties Report:", cardWidth/2, tableY - 6.5);

      const data2 = [
        ['Total Teachers:', "16(+1)"],
        ['Active Teachers:', "16(+1)"],
        ['Present Teachers:', "11"],
        ['Absent Teachers:', "5"],
        ['Teachers on Leave:', "2"]
      ];

      doc.setLineWidth(0.5);
      doc.setDrawColor("#000");
      doc.setFillColor("#fff");
      doc.setFontSize(9);
      doc.setTextColor("#000");
      i = 0;

      for (i; i < data2.length; i += 3) {
        var x1 = tableX+5;
        doc.text(data2[i][0], x1, tableY);
        doc.text(data2[i][1], x1 + 60, tableY);
        // doc.rect(x1-2, tableY-5, x1+50, 7);
        if (data2[i + 1]) {
          x1+=cellWidth;
          doc.text(data2[i + 1][0], x1 , tableY);
          doc.text(data2[i + 1][1], x1 +60, tableY);
          // doc.rect(x1+73, tableY-5, x1+55, 7);
        } else {
          console.log("Data ended");
        }
        if (data2[i + 2]) {
          x1+=cellWidth;
          doc.text(data2[i + 2][0], x1 , tableY);
          doc.text(data2[i + 2][1], x1 + 60, tableY);
          // doc.rect(x1+155, tableY-5, x1+55, 7);
        } else {
          console.log("Data ended");
        }
        tableY += 5; // Increase y-coordinate for the next row
      }



      tableY += 15;
      doc.setFont("Poppins", "bold");
      doc.setFontSize(12);
      doc.setTextColor("#c50000");
      doc.text("Fee Report:", cardWidth/2, tableY - 6.5);

      const data3 = [
        ['Total Slips:', "56(+10)"],
        ['Total Fee Count:', "18"],
        ['Paid Slips:', "10(+5)"],
        ['Unpaid Slips:', "16(+10)"],
        ['Today Rec. Count:', "25"],
        ['Today Con. Count:', "2"]
      ];

      doc.setLineWidth(0.5);
      doc.setDrawColor("#000");
      doc.setFillColor("#fff");
      doc.setFontSize(9);
      doc.setTextColor("#000");
      i = 0;

      for (i; i < data3.length; i += 3) {
        var x1 = tableX+5;
        doc.text(data3[i][0], x1, tableY);
        doc.text(data3[i][1], x1 + 60, tableY);
        // doc.rect(x1-2, tableY-5, x1+50, 7);
        if (data3[i + 1]) {
          x1+=cellWidth;
          doc.text(data3[i + 1][0], x1 , tableY);
          doc.text(data3[i + 1][1], x1 + 60, tableY);
          // doc.rect(x1+73, tableY-5, x1+55, 7);
        } else {
          console.log("Data ended");
        }
        if (data3[i + 2]) {
          x1+=cellWidth;
          doc.text(data3[i + 2][0], x1, tableY);
          doc.text(data3[i + 2][1], x1 + 60, tableY);
          // doc.rect(x1+155, tableY-5, x1+55, 7);
        } else {
          console.log("Data ended");
        }
        tableY += 5; // Increase y-coordinate for the next row
      }



      const data4 = [
        ['Total Slips:', "56(+10)"],
        ['Total Fee Count:', "18"],
        ['Paid Slips:', "10(+5)"],
        ['Unpaid Slips:', "16(+10)"],
        ['Today Rec. Count:', "25"],
        ['Today Con. Count:', "2"]
      ];

      const data5Head=[['Date', 'Opening', 'Addition', 'Receiving','Balance']];
      const data5 = [
        ["25-Apr-24","0","+0","-0","0"],
        ["25-Apr-24","0","+0","-0","0"],
        ["25-Apr-24","0","+0","-0","0"],
        ["25-Apr-24","0","+0","-0","0"],
        ["25-Apr-24","0","+181000","-21000","160000"],
        ["25-Apr-24","160000","+87500","-52000","19500"],
        ["25-Apr-24","195500","+106000","-138500","163000"]
      ];

      tableY += 20;
      doc.setLineWidth(0.5);
      doc.setDrawColor("#000");
      doc.setFillColor("#fff");
    
      doc.setTextColor("#c50000");
      doc.text("Fee Balance Report", tableX + 30, tableY);
      doc.setFontSize(9);
      doc.setTextColor("#000");
      doc.rect(tableX, tableY - 5, cardWidth / 2 - 45, 50);
      var i = 0;
      tableY += 10;

      for (i; i < data4.length; i++) {
        var x1 = tableX + 10;
        doc.text(data4[i][0], x1, tableY);
        doc.text(data4[i][1], x1 + 50, tableY);
        tableY += 6; // Increase y-coordinate for the next row
      }


      tableX += cardWidth / 2 - 35;
      tableY -= 45;
      doc.setFontSize(9);
      doc.setTextColor("#000");
      doc.rect(tableX - 5, tableY - 5, tableX+35, 70);
      tableY += 2;
      doc.setFontSize(12);
      doc.setTextColor("#c50000");
      doc.text("Last 7 Days Balance Report", tableX + 45, tableY - 2);

      doc.setFontSize(7);
      doc.setTextColor("#000");
      // tableY+=7;
      autoTable(doc, {
        head: data5Head,
        body: data5,
        startY: tableY,
        margin: {left: tableX},
        theme: 'grid',
        styles: {
          textColor: '#000',
          fontSize: 6,
        },
        headStyles:{
          cellWidth:30,
          fillColor:'#fff',
          textColor:'#000',
          minCellHeight:4,
        },
        columnStyles: {
          0: {cellWidth: 30},
          1: {cellWidth: 30},
          2: {cellWidth: 30},
          3: {cellWidth: 30},
          4: {cellWidth: 30},
          
          // etc
        }
        });



      transData.forEach((data, index) => {

        // Draw border around content
        doc.setDrawColor("#949494");
        doc.rect(x, y, cardWidth, cardHeight);

        if (index === transData.length - 1) {
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
