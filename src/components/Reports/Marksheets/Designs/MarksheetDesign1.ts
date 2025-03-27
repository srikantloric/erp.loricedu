import { getFirestoreInstance } from "context/firebaseUtility";
import { doc, getDoc } from "firebase/firestore";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { rankDoctype } from "types/reports/marksheet";
import { marksheetType } from "types/results";
import { POPPINS_BOLD, POPPINS_REGULAR, POPPINS_SEMIBOLD } from "utilities/Base64Url";
import { getClassNameByValue, GetGradeFromMark, getOrdinal } from "utilities/UtilitiesFunctions";

type paperMarksTypeLocal = {
  paperTitle: string;
  paperMarkObtained: number | string;
  paperMarkPractical: number | string;
  paperMarkTheory: number | string;
  paperMarkPassing: number | string;
};


const getStudentRank = async (classId: string | undefined) => {
  //get firebase db instance
  const db = await getFirestoreInstance();
  if (!classId) return null;
  const rankDocRef = doc(db, "RESULTS", classId);
  const rankDocSnap = await getDoc(rankDocRef);
  return rankDocSnap.exists() ? (rankDocSnap.data() as rankDoctype) : null;
};



export const MarksheetDesign1 = {
  generatePDF: async (resultData: marksheetType[], config: any): Promise<string> => {
    const {
      schoolName: SCHOOL_NAME,
      schoolAddress: SCHOOL_ADDRESS,
      schoolContact: SCHOOL_CONTACT,
      schoolWebsite: SCHOOL_WEBSITE,
      schoolLogoBase64: SCHOOL_LOGO_BASE64,
      schoolPrincipalSignBase64: PRINCIPAL_SIGN,
    } = config;

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


    // Usage
    const classId = resultData.at(0)?.student.class?.toString();
    const studentRanks = await getStudentRank(classId);


    ///PDF Blob

    let PDFBlob: string = "";

    resultData.forEach((data, index) => {

      const header2 = [
        [
          {
            content: data.examTitle,
            colSpan: 5,
            fontStyle: "bold",
            styles: { halign: "center", fillColor: [253, 218, 13], fontStyle: "bold", },

          },
        ],
        [
          {
            content: "Subject",
            styles: { halign: "center", fillColor: [195, 240, 255] },
          },
          {
            content: "Theory (80)",
            styles: { halign: "center", fillColor: [195, 240, 255] },
          },
          {
            content: "Pract.(20)",
            styles: { halign: "center", fillColor: [195, 240, 255] },
          },
          {
            content: "Marks Obtained",
            styles: { halign: "center", fillColor: [195, 240, 255] },
          },
          {
            content: "Grade",
            styles: { halign: "center", fillColor: [195, 240, 255] },
          },
        ]
        ,

      ];


      let resDataTable: paperMarksTypeLocal[] = [];
      data.result.forEach((item) => {
        const obtainedMarkCaculated = item.paperId === "DRAWING" ? item.paperMarkTheory : Number(item.paperMarkTheory) + Number(item.paperMarkPractical)

        const res: paperMarksTypeLocal = {
          paperTitle: item.paperTitle,
          paperMarkTheory: item.paperId === "DRAWING" ? "-" : Number(item.paperMarkTheory),
          paperMarkPractical: item.paperId === "DRAWING" ? "-" : Number(item.paperMarkPractical),

          paperMarkObtained: item.paperId === "DRAWING"
            ? item.paperMarkTheory // Assign grade for DRAWING
            : obtainedMarkCaculated === 0
              ? "AB"
              : obtainedMarkCaculated, // Assign numeric value for other subjects
          paperMarkPassing: GetGradeFromMark(obtainedMarkCaculated)
        };

        resDataTable.push(res);
      });
      // const y=cardHeight+margin;
      let startX = margin + 25;

      let totalAllMarks = 0;

      const fullMarks = data.result.reduce((total, item) => {
        const fullMark =
          item.paperId === "DRAWING"
            ? 0
            : Number(item.paperMarkTheory) + Number(item.paperMarkPractical);

        return total + fullMark;
      }, 0);

      data.result.forEach((item) => {
        if (item.paperId === "DRAWING" || item.paperId === "ORAL") {
          //do nothing
        } else {
          totalAllMarks += 100;
        }
      })



      let marksObtained = data.result.reduce((total, item) => {
        const obtainedMarkCalculated =
          item.paperId === "DRAWING"
            ? 0
            : Number(item.paperMarkTheory) + Number(item.paperMarkPractical);

        return total + obtainedMarkCalculated;
      }, 0);


      let percentage = (fullMarks / totalAllMarks) * 100;

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
            content: `${fullMarks}/${totalAllMarks}`,
            colSpan: 2,
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
          { content: "Class Rank" },
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
      // Set default font
      doc.setTextColor("#000");
      // Load fonts
      doc.addFileToVFS("Poppins-Bold", POPPINS_BOLD);
      doc.addFont("Poppins-Bold", "Poppins", "bold");
      doc.addFileToVFS("Poppins-Regular", POPPINS_REGULAR);
      doc.addFont("Poppins-Regular", "Poppins", "normal");
      doc.addFileToVFS("Poppins-Semibold", POPPINS_SEMIBOLD);
      doc.addFont("Poppins-Semibold", "Poppins", "semibold");
     
     
      ///Start of PDF Design

      //right logo
      doc.addImage(SCHOOL_LOGO_BASE64, cardWidth - 25, y + 2, 27, 25);

      const schoolHeaderStartX = x + 10;
      const schoolHeaderStartY = y + 10;

      doc.setFontSize(27);
      doc.setFont("Poppins", "bold");
      doc.setTextColor("#15497c");

      doc.text(
        SCHOOL_NAME.toUpperCase(),
        schoolHeaderStartX,
        schoolHeaderStartY,
        { align: "left" }
      );

      doc.setFontSize(9);
      doc.setFont("Poppins", "semibold");
      const tagline = "An English Medium School Based on CBSE Curriculum";
      doc.text(
        tagline,
        schoolHeaderStartX,
        schoolHeaderStartY + 5,
        { align: "left" }
      );

      const schoolContactDetailStartY = schoolHeaderStartY + 5;
      doc.setFontSize(9);
      doc.setFont("Poppins", "normal");
      const address = "Address: " + SCHOOL_ADDRESS;
      doc.text(
        address,
        schoolHeaderStartX,
        schoolContactDetailStartY + 5,
        { align: "left" }
      );
      //  const address2 = "Giridih, Jharkhand – 815312";
      //   doc.text(
      //     address2,
      //     (pageWidth - doc.getTextWidth(address2)) / 2,
      //     schoolContactDetailStartY + 9
      //   ); 
      const contact = "Phone: " + SCHOOL_CONTACT;
      doc.text(
        contact,
        schoolHeaderStartX,
        schoolContactDetailStartY + 9
      );
      // const contact2 = "+91-6205447024";
      // doc.text(
      //   contact2,
      //   (pageWidth - doc.getTextWidth(contact2)) / 2,
      //   schoolContactDetailStartY + 17
      // );
      const websiteName = "" + SCHOOL_WEBSITE;
      doc.text(
        websiteName,
        schoolHeaderStartX,
        schoolContactDetailStartY + 13
      );

      doc.setDrawColor("#ed0001");
      doc.rect(x + 40 + 20, y + 45, schoolHeaderStartX + 60, 10);

      doc.setFont("Poppins", "bold");
      doc.setFontSize(16);
      doc.setTextColor("#ed0001");

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
      )}`;
      doc.text(
        classText,
        (pageWidth - doc.getTextWidth(classText)) / 2,
        y + 62
      );
      const sessionText = "Academic Session: 2024-25";
      doc.text(
        sessionText,
        (pageWidth - doc.getTextWidth(sessionText)) / 2,
        y + 68
      );

      //Marksheet Body

      //students details
      doc.setFontSize(12);
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

      doc.text("Student ID", leftXStart, studentDetailsStartY + 6);
      doc.text(
        ": " + data.student.admission_no,
        leftXStartContent,
        studentDetailsStartY + 6
      );

      doc.text("Father's Name", leftXStart, studentDetailsStartY + 12);
      doc.text(
        ": " + data.student.father_name,
        leftXStartContent,
        studentDetailsStartY + 12
      );
      doc.text("Mother's Name", leftXStart, studentDetailsStartY + 18);
      doc.text(
        ": " + data.student.mother_name,
        leftXStartContent,
        studentDetailsStartY + 18
      );

      doc.text("Date Of Birth", leftXStart, studentDetailsStartY + 24);
      doc.text(
        ": " + data.student.dob,
        leftXStartContent,
        studentDetailsStartY + 24
      );
      // doc.text("Address", leftXStart, studentDetailsStartY + 36);
      // // doc.text(
      // //   ": #" + data.student.address,
      // //   leftXStartContent,
      // //   studentDetailsStartY + 36
      // // );
      // let text = ": " + data.student.address;
      // const wrapx = leftXStartContent;
      // const wrapy = studentDetailsStartY + 36;
      // const maxWidth = 90;

      // Call the wrapText function
      // wrapText(doc, text, wrapx, wrapy, maxWidth);

      //right side
      const rightXStart = cardWidth - 60;
      const rightXStartContent = cardWidth - 24;

      doc.text("Class", rightXStart, studentDetailsStartY);
      const classText2 = `${getClassNameByValue(data.student.class!)}(${data.student.section})`;
      doc.text(": " + classText2, rightXStartContent, studentDetailsStartY);

      doc.text("Admission No", rightXStart, studentDetailsStartY + 6);
      doc.text(
        ": " + data.student.admission_no.slice(-5),
        rightXStartContent,
        studentDetailsStartY + 6
      );

      doc.text("Roll No", rightXStart, studentDetailsStartY + 12);

      doc.text(
        ": " + data.student.class_roll,
        rightXStartContent,
        studentDetailsStartY + 12
      );



      doc.text("Contact No", rightXStart, studentDetailsStartY + 18);

      doc.text(
        ": " + data.student.contact_number,
        rightXStartContent,
        studentDetailsStartY + 18
      );

      //Marks Body
      let tableY = studentDetailsStartY + 30;
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
          minCellHeight: 4,
          lineColor: "#000",
        },

      });



      //Result and Promotted Class
      let resultY = tableY + 10 + lineCount * 8;

      // Define grade marks range (original vertical format)
      const grades = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];
      const marks = ["91-100", "81-90", "71-80", "61-70", "51-60", "41-50", "33-40", "Below 33"];

      // Transpose data to make it horizontal
      const body = [["Grade", ...grades]]; // Header row
      const head = [["Marks Range", ...marks]]; // Data row


      autoTable(doc, {
        head,
        body,
        startY: resultY,
        margin: { left: doc.internal.pageSize.width - 130, right: 15 }, // Shift to right
        theme: "grid",
        styles: {
          fontSize: 8, // Small font size
          cellPadding: 2,
          lineWidth: 0.1, // Border thickness
          lineColor: "#808080", // Black border,
          halign: "center"
        },
        headStyles: {
          fillColor: [253, 218, 13],
          textColor: "#000",
          fontSize: 8,
          fontStyle: "bold",
          lineWidth: 0.1, // Border thickness
          lineColor: "#808080", // Black border
        },
        bodyStyles: {
          fontSize: 8,
        },
      });


      let resultPF = percentage > 33.0 ? "PASS" : "FAIL";

      doc.text("Passing Mark: " + (0.33 * totalAllMarks).toFixed(0), startX - 3, resultY + 5);
      doc.text("Result: " + resultPF, startX - 3, resultY + 12);
      // Set color for result text
      if (resultPF === "PASS") {
        doc.setTextColor(0, 128, 0); // Green color
      } else {
        doc.setTextColor(255, 0, 0); // Red color
      }

      doc.text("Result: " + resultPF, startX - 3, resultY + 12);
      doc.setTextColor(0, 0, 0); // Reset to default (black)
      //Signatures
      let pageHeight = doc.internal.pageSize.height; // Get total page height

      let marginSign = 10; // Define left and right margins
      let usableWidth = pageWidth - 2 * marginSign; // Calculate usable width after margins

      let signY = pageHeight - 13; // Position signatures 30 units from the bottom
      let sectionWidth = usableWidth / 3; // Divide usable space into 3 equal sections
      let lineOffset = 5; // Space above text for the signature lines

      // Set line width and color
      doc.setLineWidth(0.3);
      doc.setDrawColor(0, 0, 0);

      // Class Teacher's Signature
      doc.line(marginSign + sectionWidth * 0.5 - 25, signY - lineOffset, marginSign + sectionWidth * 0.5 + 25, signY - lineOffset);
      doc.text("Class Teacher's Sign", marginSign + sectionWidth * 0.5 - 20, signY);

      // Parent's Signature
      doc.line(marginSign + sectionWidth * 1.5 - 25, signY - lineOffset, marginSign + sectionWidth * 1.5 + 25, signY - lineOffset);
      doc.text("Parents Sign", marginSign + sectionWidth * 1.5 - 15, signY);

      // Principal's Signature
      doc.line(marginSign + sectionWidth * 2.5 - 25, signY - lineOffset, marginSign + sectionWidth * 2.5 + 25, signY - lineOffset);
      doc.text("Principal Sign", marginSign + sectionWidth * 2.5 - 15, signY);

      // Uncomment to add Principal's digital signature
      doc.addImage(PRINCIPAL_SIGN, marginSign + sectionWidth * 2.5 - 20, signY - 27, 40, 27);

      if (index === resultData.length - 1) {
        const blob = doc.output("blob");
        PDFBlob = URL.createObjectURL(blob);
      } else {
        doc.addPage();
      }
    });

    return PDFBlob;
  },
};