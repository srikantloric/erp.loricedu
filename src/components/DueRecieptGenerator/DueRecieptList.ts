import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    LOGO_BASE_64,
    PHONE_ICON,
    POPPINS_BOLD,
    POPPINS_REGULAR,
    POPPINS_SEMIBOLD,
} from "utilities/Base64Url";
import {
    SCHOOL_ADDRESS,
    SCHOOL_CONTACT,
    SCHOOL_NAME,
} from "config/schoolConfig";

import { DueReportType } from "types/reports";


export const DueRecieptList = async (
    recieptData: DueReportType[]
): Promise<string> => {

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
            const y = 8 + margin;
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

            doc.addImage(LOGO_BASE_64, x + 45, y + 4, 20, 18);

            const schoolHeaderStartX = x + 65;
            const schoolHeaderStartY = y + 8;

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
                cardXEndPoint - 120,
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



            doc.setFillColor("#939393");

            doc.rect(cardXStartPoint, y + 26, cardXEndPoint, 6, "F");

            doc.setFont("Poppins", "semibold");
            doc.setFontSize(9);
            doc.setTextColor("#fff");
            doc.text("Due Reciept List", cardWidth / 2 - 8, y + 30);


            doc.setFontSize(7);
            doc.setTextColor("#000");
            let tableX = x - 7;
            let tableY = y + 38.5;
            doc.text("Session : 2024-25", x + 3, tableY);

            tableX = x - 7;
            tableY = y + 42.5;

            const tableColumn = [
                "SL", "Due Month", "Student Name", "Student ID", "Class",
                "Father's Name", "Contact", "Due Amount", "Remark"
            ];
            const tableRows = recieptData.map((item, index) => [
                index + 1,
                item.dueMonth,
                item.studentName,
                item.studentId,
                item.class,
                item.fatherName,
                item.contact,
                item.dueAmount,
                item.remark,
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: tableY,
                theme: "grid",
                styles: {
                    textColor: "#000",
                    fontSize: 6.5,

                },
                margin: { left: tableX + 10 },
                headStyles: {
                    fillColor: "#fff",
                    textColor: "#000",
                    minCellHeight: 4,
                },

            });


            ///End Of PDF DESIGN
            // Draw border around content
            doc.setDrawColor("#949494");
            doc.rect(x, y, cardWidth, cardHeight);

            recieptData.forEach((data, index) => {
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
