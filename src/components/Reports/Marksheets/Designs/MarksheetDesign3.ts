import { getFirestoreInstance } from "context/firebaseUtility";
import { doc, getDoc } from "firebase/firestore";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { rankDoctype } from "types/reports/marksheet";
import { marksheetTypeNew } from "types/results";
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

const getRemark = (
    percentage: number,
    isFail: boolean,
    rank?: number | null
) => {
    if (isFail) return "Needs Improvement";

    if (rank === 1) return "Outstanding - Class Topper";
    if (rank && rank <= 3) return "Excellent - Top Performer";

    if (percentage >= 90) return "Outstanding Performance";
    if (percentage >= 80) return "Excellent Performance";
    if (percentage >= 70) return "Very Good";
    if (percentage >= 60) return "Good";
    if (percentage >= 50) return "Satisfactory";
    if (percentage >= 40) return "Can Do Better";

    return "Needs Improvement";
};

export const MarksheetDesign3 = {
    generatePDF: async (resultData: marksheetTypeNew[], config: any, selectedSession: string, examPaperWithFullMarks: any[]): Promise<string> => {
        const {
            schoolName: SCHOOL_NAME,
            schoolAddress: SCHOOL_ADDRESS,
            schoolContact: SCHOOL_CONTACT,
            schoolLogoBase64: SCHOOL_LOGO_BASE64,
            schoolPrincipalSignBase64: PRINCIPAL_SIGN,
        } = config;

        const doc = new jsPDF({
            orientation: "p",
            unit: "mm",
            format: "a4",
        });

        console.log("Generating Marksheet Design 2 PDF...");

        const cardWidth = doc.internal.pageSize.getWidth() - 15;
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
                        styles: { halign: "center", fillColor: "#D5DEE5", fontStyle: "bold", },

                    },
                ],
                [
                    {
                        content: "Subjects",
                        styles: { halign: "center", fillColor: [195, 240, 255] },
                    },
                    {
                        content: `Theory (${examPaperWithFullMarks[0].maxTheory ?? 0})`,
                        styles: { halign: "center", fillColor: [195, 240, 255] },
                    },
                    {
                        content: `Pract.(${examPaperWithFullMarks[0].maxPractical ?? 0})`,
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
                const obtainedMarkCaculated = item.grade ? 0 : (Number(item.theory ?? 0) + Number(item.practical ?? 0))
                //get full marks from examPaperWithFullMarks
                const fullMarksItem = examPaperWithFullMarks.find((paper) => paper.paperId === item.paperId);

                const isOptional = fullMarksItem?.optional?.includes(getClassNameByValue(data.student.class!)) ?? false;

                // ✅ Append (OP) if optional
                const paperTitleDisplay = isOptional ? `${item.paperTitle} (OP)` : item.paperTitle;

                const fullMarks = fullMarksItem ? (Number(fullMarksItem.maxTheory ?? 0) + Number(fullMarksItem.maxPractical ?? 0)) : 0;

                const res: paperMarksTypeLocal = {
                    paperTitle: paperTitleDisplay,
                    paperMarkTheory: item.grade ? "-" : Number(item.theory ?? 0),
                    paperMarkPractical: item.grade ? "-" : Number(item.practical ?? 0),

                    paperMarkObtained: item.grade
                        ? item.grade! // Assign grade for DRAWING
                        : obtainedMarkCaculated === 0
                            ? "AB"
                            : obtainedMarkCaculated, // Assign numeric value for other subjects

                    paperMarkPassing: item.grade ? item.grade! : GetGradeFromMark(obtainedMarkCaculated, fullMarks),
                };

                resDataTable.push(res);
            });
            // const y=cardHeight+margin;
            let startX = margin + 25;

            let totalAllMarks = 0;


            examPaperWithFullMarks.forEach((item) => {
                const isOptional = item?.optional?.includes(getClassNameByValue(resultData.at(0)?.student.class!)) ?? false;
                if (!isOptional) {
                    totalAllMarks += item.fullMarks;
                }
            })


            let marksObtained = data.result.reduce((total, item) => {
                const fullMarksItem = examPaperWithFullMarks.find((paper) => paper.paperId === item.paperId);
                const isOptional = fullMarksItem?.optional?.includes(getClassNameByValue(data.student.class!)) ?? false;
                if (isOptional) return total; // ✅ skip optional subjects from total

                const hasGrade = item.grade && item.grade.trim() !== "";

                const theory = Number(item.theory) || 0;
                const practical = Number(item.practical) || 0;

                const obtainedMarkCalculated = hasGrade ? 0 : theory + practical;

                return total + obtainedMarkCalculated;
            }, 0);

            let percentage = (marksObtained / totalAllMarks) * 100;

            let calculatedRank = "N/A";

            if (studentRanks && studentRanks.studentRanks.length > 0) {
                const rank = studentRanks.studentRanks
                    .filter((student: any) => student.studentId === data.student.id)
                    .at(0);

                if (rank && rank.rankObtained !== -1) {
                    calculatedRank = getOrdinal(Number(rank.rankObtained));
                }
            }
            let resultPF = percentage > 33.0 ? "PASS" : "FAIL";


            const numericRank =
                studentRanks?.studentRanks
                    ?.find((s: any) => s.studentId === data.student.id)
                    ?.rankObtained ?? null;

            const remarkText = getRemark(
                percentage,
                resultPF === "FAIL",
                numericRank
            );

            const rows2 = [
                [
                    { content: "Total", styles: { halign: "center" } },
                    {
                        content: `${marksObtained}/${totalAllMarks}`,
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
                    {
                        content: remarkText,
                        colSpan: 4,
                        styles: { halign: "center", fontStyle: "bold" },
                    },
                ],
            ];


            doc.setTextColor("#000");

            // Load fonts
            doc.addFileToVFS("Poppins-Bold", POPPINS_BOLD);
            doc.addFont("Poppins-Bold", "Poppins", "bold");

            doc.addFileToVFS("Poppins-Regular", POPPINS_REGULAR);
            doc.addFont("Poppins-Regular", "Poppins", "normal");

            doc.addFileToVFS("Poppins-Semibold", POPPINS_SEMIBOLD);
            doc.addFont("Poppins-Semibold", "Poppins", "semibold");
            ///Start of PDF Design

            // Add watermark background (full page)
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight1 = doc.internal.pageSize.getHeight();

            // Reduce opacity (important for watermark effect)
            
            doc.setGState(new (doc as any).GState({ opacity: 0.08 }));

            doc.addImage(
                SCHOOL_LOGO_BASE64,
                "PNG",
                pageWidth / 2 - 60,   // center horizontally
                pageHeight1 / 2 - 60,  // center vertically
                120,                  // width
                120                   // height
            );

            // Reset opacity back to normal
           doc.setGState(new (doc as any).GState({ opacity: 1 }));

            //right logo
            doc.addImage(SCHOOL_LOGO_BASE64, x + 10, y + 2, 20, 18);

            const schoolHeaderStartX = x + 40;
            const schoolHeaderStartY = y + 10;

            doc.setFontSize(24);
            doc.setFont("Poppins", "bold");
            doc.setTextColor("#15497c");

            doc.text(
                SCHOOL_NAME.toUpperCase(),
                schoolHeaderStartX,
                schoolHeaderStartY,
                { align: "left" }
            );

            doc.setFontSize(7);
            doc.setFont("Poppins", "semibold");
            const tagline = "An English Medium School Based on CBSE Curriculum";
            doc.text(
                tagline,
                schoolHeaderStartX,
                schoolHeaderStartY + 5,
                { align: "left" }
            );

            const schoolContactDetailStartY = schoolHeaderStartY + 5;
            doc.setFontSize(7);
            doc.setFont("Poppins", "normal");
            const address = "Address: " + SCHOOL_ADDRESS;
            doc.text(
                address,
                schoolHeaderStartX,
                schoolContactDetailStartY + 5,
                { align: "left" }
            );
            const contact = "Phone: " + SCHOOL_CONTACT;
            doc.text(
                contact,
                schoolHeaderStartX,
                schoolContactDetailStartY + 9
            );



            doc.setFont("Poppins", "bold");
            doc.setFontSize(22);
            doc.setTextColor("#cc4b0f");

            const progressReportText = "PROGRESS REPORT CARD";


            doc.text(
                progressReportText,
                (pageWidth - doc.getTextWidth(progressReportText)) / 2,
                y + 48
            );

            doc.setFont("Poppins", "normal");
            doc.setFontSize(11);
            doc.setTextColor("#15497c");

            const sessionText = "Academic Session - " + selectedSession;
            doc.text(
                sessionText,
                (pageWidth - doc.getTextWidth(sessionText)) / 2,
                y + 55
            );

            doc.setDrawColor("#000");


            //students details
            doc.setFontSize(10);
            doc.setFont("Poppins", "normal");
            doc.setTextColor("#000");


            //draw rectangle around student details with header row
            doc.setFillColor("#D5DEE5");
            doc.setFont("Poppins", "semibold");
            doc.rect(x + 10, y + 60, cardWidth - 20, 8, "F");
            doc.rect(x + 10, y + 60, cardWidth - 20, 8, "S");
            doc.rect(x + 10, y + 60, cardWidth - 20, 40);

            doc.text("Student Details", x + 12, y + 65, { align: "left" });


            let studentDetailsStartY = y + 73;

            const leftXStart = x + 12;
            const leftXStartContent = x + 55;

            doc.text("Name", leftXStart, studentDetailsStartY);
            doc.setFont("Poppins", "normal");
            doc.text(
                ": " + data.student.student_name,
                leftXStartContent,
                studentDetailsStartY
            );
            doc.setFont("Poppins", "semibold");
            doc.text("Student ID", leftXStart, studentDetailsStartY + 6);
            doc.setFont("Poppins", "normal");
            doc.text(
                ": " + data.student.admission_no,
                leftXStartContent,
                studentDetailsStartY + 6
            );
            doc.setFont("Poppins", "semibold");
            doc.text("Father's Name", leftXStart, studentDetailsStartY + 12);
            doc.setFont("Poppins", "normal");
            doc.text(
                ": " + data.student.father_name,
                leftXStartContent,
                studentDetailsStartY + 12
            );
            doc.setFont("Poppins", "semibold");
            doc.text("Mother's Name", leftXStart, studentDetailsStartY + 18);
            doc.setFont("Poppins", "normal");
            doc.text(
                ": " + data.student.mother_name,
                leftXStartContent,
                studentDetailsStartY + 18
            );
            doc.setFont("Poppins", "semibold");
            doc.text("Date Of Birth", leftXStart, studentDetailsStartY + 24);
            doc.setFont("Poppins", "normal");
            doc.text(
                ": " + data.student.dob,
                leftXStartContent,
                studentDetailsStartY + 24
            );

            const rightXStart = cardWidth - 60;
            const rightXStartContent = cardWidth - 35;
            doc.setFont("Poppins", "semibold");
            doc.text("Class", rightXStart, studentDetailsStartY + 12);
            doc.setFont("Poppins", "normal");
            const classText2 = `${getClassNameByValue(data.student.class!)}(${data.student.section})`;
            doc.text(": " + classText2, rightXStartContent, studentDetailsStartY + 12);

            doc.setFont("Poppins", "semibold");
            doc.text("Roll No", rightXStart, studentDetailsStartY + 18);
            doc.setFont("Poppins", "normal");
            doc.text(
                ": " + data.student.class_roll,
                rightXStartContent,
                studentDetailsStartY + 18
            );


            doc.setFont("Poppins", "semibold");
            doc.text("Contact No", rightXStart, studentDetailsStartY + 24);
            doc.setFont("Poppins", "normal");
            doc.text(
                ": " + data.student.contact_number,
                rightXStartContent,
                studentDetailsStartY + 24
            );


            //Marks Body
            let tableY = studentDetailsStartY + 35;
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
                    fillColor: false,

                },
                headStyles: {
                    fillColor: false, // ✅ remove header background
                    textColor: "#000",
                },
                margin: { left: x + 10 },
                bodyStyles: {
                    cellWidth: 35,
                    fillColor: false,
                    textColor: "#000",
                    minCellHeight: 4,
                    lineColor: "#000",

                },
                alternateRowStyles: {
                    fillColor: false, // ✅ remove zebra stripes
                },

            });

            //Result and Promotted Class
            let resultY = tableY + 10 + lineCount * 8;

            // Define grade marks range (original vertical format)
            const grades = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];
            const marks = ["91-100", "81-90", "71-80", "61-70", "51-60", "41-50", "33-40", "Below 33"];

            // Transpose data to make it horizontal
            const body = [["Grade", ...grades]]; // Header row
            const head = [["Marks % Range", ...marks]]; // Data row


            autoTable(doc, {
                head,
                body,
                startY: resultY,
                margin: { left: doc.internal.pageSize.width - 130, right: 18 }, // Shift to right
                theme: "grid",
                styles: {
                    fontSize: 8, // Small font size
                    cellPadding: 2,
                    lineWidth: 0.1, // Border thickness
                    lineColor: "#808080", // Black border,
                    halign: "center"
                },
                headStyles: {
                    fillColor: "#D5DEE5", // Light gray header background
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


            const footerText = "Report generated usign LoricEdu Software | " + new Date().toLocaleString().toString()
            doc.setTextColor("#000")
            doc.setFontSize(6)
            doc.text(footerText, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 2, { align: "center" });

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
