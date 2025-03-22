import {
  LOGO_BASE_64,
  POPPINS_BOLD,
  POPPINS_REGULAR,
  POPPINS_SEMIBOLD,

} from "utilities/Base64Url";
import { SCHOOL_NAME } from "config/schoolConfig";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { marksheetType, rankType } from "types/results";
import { getClassNameByValue, getOrdinal } from "utilities/UtilitiesFunctions";
import { db } from "../../firebase";
import { getDoc,doc as docF } from "firebase/firestore";


type paperMarksTypeLocal = {
  paperTitle: string;
  paperMarkObtained: number | string;
  paperMarkPractical: number;
  paperMarkTheory: number;
  paperMarkPassing: number;
};

export const MarksheetReportGenerator = async (
  resultData: marksheetType[],
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });



      //data manupulation
      const pageWidth = doc.internal.pageSize.getWidth();
      const cardWidth = doc.internal.pageSize.getWidth() - 15;
      // const cardHeight = doc.internal.pageSize.getHeight() - 15;
      const margin = 2;
      const x = 5 + margin;
      const y = 5 + margin;

      //get student rank

      let studentRanks: rankDoctype | null = null;
      type rankDoctype = {
        class: number;
        lastUpdated: Date;
        studentRanks: rankType[];
      };

     
        if (!resultData.length) return;
        try {
          const classId = resultData[0]?.student.class?.toString();
          if (!classId) {
            console.error("Class ID is undefined");
            return;
          }
    
          const rankRef = docF(db, "RESULTS", classId);
          const rankSnap = await getDoc(rankRef);
      
          if (rankSnap.exists()) {
            studentRanks = rankSnap.data() as rankDoctype;
          } else {
            console.warn("Rank data not found for class:", classId);
          }
        } catch (error) {
          console.error("Error fetching student rank:", error);
        }
    

      resultData.forEach((data, index) => {

        const header2 = [
          [
            {
              content: data.examTitle,
              colSpan: 5,

              styles: { halign: "center" },
            },
          ],
          ["Subject", "Theory", "Pract.", "Pass Marks", "Marks Obtained"],
        ];


        let resDataTable: paperMarksTypeLocal[] = [];
        data.result.map((item) => {
          const res: paperMarksTypeLocal = {
            paperTitle: item.paperTitle,
            paperMarkTheory: item.paperMarkTheory,
            paperMarkPractical: item.paperMarkPractical,
            paperMarkPassing: 33,
            paperMarkObtained: item.paperMarkObtained === 0 ? "AB" : item.paperMarkObtained,
          };
          resDataTable.push(res);
        });
        // const y=cardHeight+margin;
        let startX = margin + 25;
        let totalPassMarks = 0;
        let fullMarks = 0;
        let marksObtained = 0;
        data.result.map(
          (obj) =>
          (fullMarks +=
            Number(obj.paperMarkTheory) + Number(obj.paperMarkPractical))
        );

        data.result.map((obj) => (totalPassMarks += 33));

        data.result.map(
          (obj) => (marksObtained += Number(obj.paperMarkObtained))
        );

        let percentage = (marksObtained / fullMarks) * 100;

        let calculatedRank = "N/A";

        if (studentRanks && studentRanks.studentRanks.length > 0) {
          const rank = studentRanks.studentRanks
            .filter((student: any) => student.studentId === data.student.id)
            .at(0);

          if (rank && rank.rankObtained !== -1) {
            calculatedRank = getOrdinal(Number(rank.rankObtained));
          }
        }

        const rows2 = [
          [
            { content: "Total", styles: { halign: "center" } },
            {
              content: fullMarks.toString(),
              colSpan: 2,
              styles: { halign: "center" },
            },
            {
              content: totalPassMarks.toString(),
              styles: { halign: "center" },
            },
            { content: marksObtained.toString(), styles: { halign: "center" } },
          ],
          [
            { content: "Percentage(%)" },
            {
              content: percentage.toFixed(1),
              colSpan: 4,
              styles: { halign: "center" },
            },
          ],
          [
            { content: "Rank" },
            {
              content: calculatedRank,
              colSpan: 4,
              styles: { halign: "center" },
            },
          ],
          [
            { content: "Remarks" },
            { content: "", colSpan: 4, styles: { halign: "center" } },
          ],
        ];

        const getTextWidth = (text: string, doc: jsPDF): number => {
          return doc.getStringUnitWidth(text) * doc.internal.scaleFactor;
        };

        const wrapText = (
          doc: jsPDF,
          text: string,
          wrapx: number,
          wrapy: number,
          maxWidth: number
        ): void => {
          const lines: string[] = [];
          const words = text.split(" ");
          let line = "";

          // Wrap text into lines
          for (const word of words) {
            const testLine = line ? `${line} ${word}` : word;
            if (getTextWidth(testLine, doc) < maxWidth) {
              line = testLine;
            } else {
              lines.push(line);
              line = word;
            }
          }
          if (line) {
            lines.push(line);
          }

          lines.forEach((line, index) => {
            doc.text(line, wrapx + index * 2, wrapy + index * 5);
          });
        };

        doc.setTextColor("#000");

        // Load fonts
        doc.addFileToVFS("Poppins-Bold", POPPINS_BOLD);
        doc.addFont("Poppins-Bold", "Poppins", "bold");

        doc.addFileToVFS("Poppins-Regular", POPPINS_REGULAR);
        doc.addFont("Poppins-Regular", "Poppins", "normal");

        doc.addFileToVFS("Poppins-Semibold", POPPINS_SEMIBOLD);
        doc.addFont("Poppins-Semibold", "Poppins", "semibold");
        ///Start of PDF Design

        doc.addImage(LOGO_BASE_64, x + 8, y + 12, 25, 23);
        doc.addImage(LOGO_BASE_64, cardWidth - 30, y + 12, 25, 23);

        const schoolHeaderStartX = x + 40;
        const schoolHeaderStartY = y + 10;

        doc.setFontSize(26);
        doc.setFont("Poppins", "bold");
        doc.text(
          SCHOOL_NAME.toUpperCase(),
          (pageWidth - doc.getTextWidth(SCHOOL_NAME.toUpperCase())) / 2,
          schoolHeaderStartY
        );

        doc.setFontSize(9);
        doc.setFont("Poppins", "semibold");
        const tagline = "An English Medium School Based on CBSE Curriculum";
        doc.text(
          tagline,
          (pageWidth - doc.getTextWidth(tagline)) / 2,
          schoolHeaderStartY + 5
        );

        const schoolContactDetailStartY = schoolHeaderStartY + 5;
        doc.setFontSize(9);
        doc.setFont("Poppins", "normal");
        const address = "Address: At-Golhaiya (Choura), Jamua";
        doc.text(
          address,
          (pageWidth - doc.getTextWidth(address)) / 2,
          schoolContactDetailStartY + 5
        );
        const address2 = "Giridih, Jharkhand – 815312";
        doc.text(
          address2,
          (pageWidth - doc.getTextWidth(address2)) / 2,
          schoolContactDetailStartY + 9
        );
        const contact = "Phone:  +91-7070829020, +91-6204313113, +91-9661009250";
        doc.text(
          contact,
          (pageWidth - doc.getTextWidth(contact)) / 2,
          schoolContactDetailStartY + 13
        );
        const contact2 = "+91-9939557894, +91-7634932030, +91-6205447024";
        doc.text(
          contact2,
          (pageWidth - doc.getTextWidth(contact2)) / 2,
          schoolContactDetailStartY + 17
        );
        const websiteName = "www.apxschool.org";
        doc.text(
          websiteName,
          (pageWidth - doc.getTextWidth(websiteName)) / 2,
          schoolContactDetailStartY + 21
        );

        doc.setDrawColor("#4a6ccc");
        doc.rect(schoolHeaderStartX + 20, y + 45, schoolHeaderStartX + 28, 10);

        doc.setFont("Poppins", "bold");
        doc.setFontSize(16);
        doc.setTextColor("#000");

        const progressReportText = "Progress Report Card";

        doc.text(
          progressReportText,
          (pageWidth - doc.getTextWidth(progressReportText)) / 2,
          y + 52
        );
        doc.setFont("Poppins", "semibold");
        doc.setFontSize(12);
        doc.setTextColor("#000");

        const classText = `Class - ${getClassNameByValue(
          data.student.class!
        )} (${data.student.section})`;
        doc.text(
          classText,
          (pageWidth - doc.getTextWidth(classText)) / 2,
          y + 62
        );
        const sessionText = "Academic Session - 2024-25";
        doc.text(
          sessionText,
          (pageWidth - doc.getTextWidth(sessionText)) / 2,
          y + 68
        );

        //Marksheet Body

        //students details
        doc.setFontSize(13);
        doc.setFont("Poppins", "normal");
        doc.setTextColor("#000");

        let studentDetailsStartY = y + 60 + 20;

        const leftXStart = x + 12;
        const leftXStartContent = x + 55;

        doc.text("Name", leftXStart, studentDetailsStartY);

        doc.text(
          ": " + data.student.student_name,
          leftXStartContent,
          studentDetailsStartY
        );

        doc.text("Student ID", leftXStart, studentDetailsStartY + 8);
        doc.text(
          ": " + data.student.admission_no,
          leftXStartContent,
          studentDetailsStartY + 8
        );

        doc.text("Father's Name", leftXStart, studentDetailsStartY + 15);
        doc.text(
          ": " + data.student.father_name,
          leftXStartContent,
          studentDetailsStartY + 15
        );

        doc.text("Mother's Name", leftXStart, studentDetailsStartY + 22);

        doc.text(
          ": " + data.student.mother_name,
          leftXStartContent,
          studentDetailsStartY + 22
        );
        doc.text("Date Of Birth", leftXStart, studentDetailsStartY + 29);
        doc.text(
          ": " + data.student.dob,
          leftXStartContent,
          studentDetailsStartY + 29
        );
        doc.text("Address", leftXStart, studentDetailsStartY + 36);
        // doc.text(
        //   ": #" + data.student.address,
        //   leftXStartContent,
        //   studentDetailsStartY + 36
        // );
        let text = ": " + data.student.address;
        const wrapx = leftXStartContent;
        const wrapy = studentDetailsStartY + 36;
        const maxWidth = 90;

        // Call the wrapText function
        wrapText(doc, text, wrapx, wrapy, maxWidth);

        //right side

        const rightXStart = cardWidth - 60;
        const rightXStartContent = cardWidth - 24;

        doc.text("Class", rightXStart, studentDetailsStartY);
        const classText2 = `${getClassNameByValue(data.student.class!)}`;
        doc.text(": " + classText2, rightXStartContent, studentDetailsStartY);

        doc.text("Roll No", rightXStart, studentDetailsStartY + 15);

        doc.text(
          ": " + data.student.class_roll,
          rightXStartContent,
          studentDetailsStartY + 15
        );

        doc.text("Admission No", rightXStart, studentDetailsStartY + 8);
        doc.text(
          ": " + data.student.admission_no.slice(-5),
          rightXStartContent,
          studentDetailsStartY + 8
        );

        doc.text("Contact No", rightXStart, studentDetailsStartY + 22);

        doc.text(
          ": " + data.student.contact_number,
          rightXStartContent,
          studentDetailsStartY + 22
        );

        //Marks Body
        let tableY = studentDetailsStartY + 50;
        const combinedData = [...header2, ...resDataTable, ...rows2];

        doc.setFontSize(11);
        doc.setTextColor("#000");

        let lineCount = combinedData.length;
        const rows = combinedData.map((obj) => Object.values(obj));

        autoTable(doc, {
          body: rows,
          startY: tableY,
          theme: "grid",
          styles: {
            textColor: "#000",
            fontSize: 12,
            halign: "center",
          },
          margin: { left: leftXStart },
          bodyStyles: {
            cellWidth: 35,
            fillColor: "#fff",
            textColor: "#000",
            minCellHeight: 6,
            lineColor: "#000",
          },
        });

        //Result and Promotted Class
        let resultY = tableY + 10 + lineCount * 8;
        let resultPF = percentage > 33.0 ? "PASS" : "FAIL";
        // let promotedClass =
        //     percentage > 33.0
        //         ? 1 + Number(data.student.class)
        //         : Number(data.student.class);
        doc.text("Result: " + resultPF, startX + 10, resultY + 5);
        // doc.text(
        //     "Promoted to Class: " + promotedClass,
        //     startX + 10 + cardWidth / 2,
        //     resultY + 5
        // );
        // console.log("promotedClass: " + promotedClass.toString());

        //Signatures

        let startY = tableY + lineCount * 6;
        startY += 50 + 2 * data.result.length;
        doc.setLineWidth(0.3);
        doc.setDrawColor(0, 0, 0);

        doc.line(startX - 3, startY - 5, startX + 35, startY - 5);
        doc.text("Class Teacher's Sign", startX, startY);
        doc.line(
          startX - 3 + cardWidth / 3,
          startY - 5,
          startX + 35 + cardWidth / 3,
          startY - 5
        );
        doc.text("Parents Sign", startX + cardWidth / 3, startY);
        doc.line(
          startX - 3 + 2 * (cardWidth / 3),
          startY - 5,
          startX + 35 + 2 * (cardWidth / 3),
          startY - 5
        );


        // doc.addImage(PRINCIPAL_SIGN, startX + 2 * (cardWidth / 3)-5, startY-22, 40, 15);
        doc.text("Principal Sign", startX + 2 * (cardWidth / 3), startY);

 
        if (index === resultData.length - 1) {
          const blob = doc.output("blob");
          const url = URL.createObjectURL(blob);
          resolve(url);
        }else{
          
          doc.addPage();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
