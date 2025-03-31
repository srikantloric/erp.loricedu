import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { rankType } from "types/results";
import { POPPINS_BOLD, POPPINS_REGULAR, POPPINS_SEMIBOLD } from "utilities/Base64Url";
type ExtendedRankType = rankType & {
    studentName: string;
    rollNumber: number;
    subjectMarks: { subject: string; marks: number }[];
    percentage: number;
};
export const RankListDesign2 = {
    generatePDF: async (config: any

        ,
        rankList: ExtendedRankType[],
        examName: string,
        session: string,
        className: string,
        fullMarks: { [subject: string]: number },
    ): Promise<string> => {

        const {
            schoolName: SCHOOL_NAME,
            schoolAddress: SCHOOL_ADDRESS,
            schoolLogoBase64: SCHOOL_LOGO_BASE64,
        } = config;


        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        });

        const pageMargin = 10;
        const effectiveWidth =
            doc.internal.pageSize.getWidth() - (2 * pageMargin + 1);

        // Load fonts
        doc.addFileToVFS("Poppins-Bold", POPPINS_BOLD);
        doc.addFont("Poppins-Bold", "Poppins", "bold");

        doc.addFileToVFS("Poppins-Regular", POPPINS_REGULAR);
        doc.addFont("Poppins-Regular", "Poppins", "normal");

        doc.addFileToVFS("Poppins-Semibold", POPPINS_SEMIBOLD);
        doc.addFont("Poppins-Semibold", "Poppins", "semibold");

        const addHeaderAndBorder = () => {
            // Add page border
            doc.setDrawColor(0, 0, 0); // Black color
            doc.setLineWidth(0.2);
            doc.rect(
                pageMargin / 2,
                pageMargin / 2,
                doc.internal.pageSize.getWidth() - pageMargin,
                doc.internal.pageSize.getHeight() - pageMargin
            );

            // School logos on both sides
            doc.addImage(SCHOOL_LOGO_BASE64, pageMargin + 5, pageMargin + 3, 25, 22); // Left logo
            doc.addImage(
                SCHOOL_LOGO_BASE64,
                doc.internal.pageSize.getWidth() - pageMargin - 30,
                pageMargin + 3,
                25,
                22
            ); // Right logo

            // School header
            doc.setFont("Poppins", "bold");
            doc.setFontSize(28);
            doc.setTextColor("#15497c");
            doc.text(
                SCHOOL_NAME.toUpperCase(),
                pageMargin + effectiveWidth / 2,
                pageMargin + 8,
                {
                    align: "center",
                }
            );

            doc.setFont("Poppins", "semibold");
            doc.setFontSize(10);
            doc.text(
                "An English Medium School Based on CBSE Syllabus",
                pageMargin + effectiveWidth / 2,
                pageMargin + 13,
                {
                    align: "center",
                }
            );

            doc.setFont("Poppins", "normal");
            doc.setFontSize(9);
            doc.text(SCHOOL_ADDRESS, pageMargin + effectiveWidth / 2, pageMargin + 18, {
                align: "center",
            });

            doc.setFont("Poppins", "semibold");
            doc.setFontSize(18);

            // Draw rectangle box around "Rank List" text
            const rankListTextY = pageMargin + 30;
            const rankListTextWidth = 50; // Approximate width of the text
            const rankListTextHeight = 10; // Approximate height of the text
            const rankListTextX = pageMargin + effectiveWidth / 2 - rankListTextWidth / 2;

            doc.setDrawColor(255, 0, 0); // Red color for the rectangle
            doc.setLineWidth(0.2);
            doc.rect(rankListTextX, rankListTextY - rankListTextHeight + 2, rankListTextWidth, rankListTextHeight);
            doc.setTextColor(255, 0, 0); // Red color for text
            doc.text("Rank List", pageMargin + effectiveWidth / 2, rankListTextY - 1, {
                align: "center",
            });

            doc.setTextColor(0, 0, 0);

            // Exam details with highlighted heading
            doc.setFillColor("#f0f0f0"); // Light gray background
            doc.rect(pageMargin, pageMargin + 35, effectiveWidth, 10, "F");

            doc.setFont("Poppins", "bold");
            doc.setFontSize(12);
            doc.text(
                `Exam: ${examName} | Session: ${session} | Class: ${className}`,
                pageMargin + effectiveWidth / 2,
                pageMargin + 42,
                { align: "center" }
            );
        };

        addHeaderAndBorder();

        rankList.sort((a, b) => a.rollNumber - b.rollNumber);

        const allSubjects = Array.from(
            new Set(rankList.flatMap((rank) => rank.subjectMarks.map((s) => s.subject)))
        );

        const totalUnits = 100;
        const subjectUnits = Math.floor((totalUnits * 0.5) / allSubjects.length); // 50% for all subjects
        const columnWidths = {
            roll: effectiveWidth * 0.05, // 5%
            name: effectiveWidth * 0.2, // 20%
            subject: effectiveWidth * (subjectUnits / totalUnits),
            total: effectiveWidth * 0.1, // 10%
            percentage: effectiveWidth * 0.08, // 8%
            rank: effectiveWidth * 0.07, // 7%
        };

        const headerHeight = 45 + 3;
        const firstPageOffset = pageMargin + headerHeight;
        const subsequentPageOffset = pageMargin + 5;

        autoTable(doc, {
            startY: firstPageOffset,
            margin: { left: pageMargin, right: pageMargin },
            head: [["Roll", "Name", ...allSubjects, "Total", "Percentage", "Rank"]],
            body: [
                [
                    "",
                    "",
                    ...allSubjects.map((subject) => fullMarks[subject] || "-"),
                    Object.keys(fullMarks)
                        .filter((subject) => allSubjects.includes(subject))
                        .reduce((sum, subject) => sum + (fullMarks[subject] || 0), 0),
                    "100%",
                    "",
                ],
                ...rankList.map((rank) => [
                    rank.rollNumber,
                    rank.studentName,
                    ...allSubjects.map(
                        (subject) =>
                            rank.subjectMarks.find((s) => s.subject === subject)?.marks || "-"
                    ),
                    rank.marksObtained,
                    `${rank.percentage.toFixed(2)}%`,
                    rank.rankObtained,
                ]),
            ],
            theme: "grid",
            styles: {
                fontSize: 9,
                halign: "center",
            },
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
            },
            columnStyles: {
                0: { cellWidth: columnWidths.roll }, // Roll
                1: { cellWidth: columnWidths.name }, // Name
                ...allSubjects.reduce(
                    (acc, _, index) => ({
                        ...acc,
                        [index + 2]: { cellWidth: columnWidths.subject },
                    }),
                    {}
                ), // Subjects
                [allSubjects.length + 2]: { cellWidth: columnWidths.total }, // Total
                [allSubjects.length + 3]: { cellWidth: columnWidths.percentage }, // Percentage
                [allSubjects.length + 4]: { cellWidth: columnWidths.rank }, // Rank
            },
            tableWidth: effectiveWidth,
            didDrawPage: (data) => {
                if (data.pageNumber === 1) {
                    addHeaderAndBorder();
                    if (data.cursor) {
                        data.cursor.y = firstPageOffset;
                    }
                } else {
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.5);
                    doc.rect(
                        pageMargin / 2,
                        pageMargin / 2,
                        doc.internal.pageSize.getWidth() - pageMargin,
                        doc.internal.pageSize.getHeight() - pageMargin
                    );
                    if (data.cursor) {
                        data.cursor.y = subsequentPageOffset;
                    }
                }
            },
        });

        const blob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(blob);
        return pdfUrl
    }
}