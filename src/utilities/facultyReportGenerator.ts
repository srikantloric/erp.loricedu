import jsPDF from 'jspdf';
import { FacultyAttendanceShema } from 'types/facuities';
import autoTable from 'jspdf-autotable';
import {
    PHONE_ICON,
    POPPINS_BOLD,
    POPPINS_REGULAR,
    POPPINS_SEMIBOLD,
} from "utilities/Base64Url";
import { getAppConfig } from 'hooks/getAppConfig';

export const generateFacultyAttendanceReport = async (attendanceData: FacultyAttendanceShema[]) => {
    const config = getAppConfig();
    if (!config) {
        console.error("Error: App config not found.");
        return;
    }
    const {
        schoolName: SCHOOL_NAME,
        schoolAddress: SCHOOL_ADDRESS,
        schoolContact: SCHOOL_CONTACT,
        schoolLogoBase64: SCHOOL_LOGO,
    } = config;
    const doc = new jsPDF({ orientation: "l", unit: "mm", format: "a4" });
    const cardWidth = doc.internal.pageSize.getWidth() - 15;
    const cardHeight = doc.internal.pageSize.getHeight() - 15;
    const margin = 2;
    const x = 5 + margin;
    const y = 5 + margin;


    doc.setTextColor("#000");

    // Load fonts
    doc.addFileToVFS("Poppins-Bold", POPPINS_BOLD);
    doc.addFont("Poppins-Bold", "Poppins", "bold");
    doc.addFileToVFS("Poppins-Regular", POPPINS_REGULAR);
    doc.addFont("Poppins-Regular", "Poppins", "normal");
    doc.addFileToVFS("Poppins-Semibold", POPPINS_SEMIBOLD);
    doc.addFont("Poppins-Semibold", "Poppins", "semibold");

    doc.addImage(SCHOOL_LOGO, x + 45, y + 1, 30, 25);

    const schoolHeaderStartX = x + 75;
    const schoolHeaderStartY = y + 5;

    doc.setFontSize(15);
    doc.setFont("Poppins", "bold");
    doc.text(SCHOOL_NAME, schoolHeaderStartX + 10, schoolHeaderStartY);

    doc.setFontSize(8);
    doc.setFont("Poppins", "semibold");
    doc.text(
        "An English Medium School Based on CBSE Curriculum",
        schoolHeaderStartX + 7,
        schoolHeaderStartY + 5
    );

    const schoolContactDetailStartY = schoolHeaderStartY + 2;
    const cardXStartPoint = x;
    const cardXEndPoint = cardWidth;

    // School address section
    doc.setFillColor("#cbc9c9");
    doc.rect(
        schoolHeaderStartX + 5,
        schoolContactDetailStartY + 5,
        cardXEndPoint - 200,
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

    // School contact info
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

    // doc.addImage(
    //   EMAIL_ICON,
    //   schoolHeaderStartX + 34,
    //   schoolContactDetailStartY + 10,
    //   3,
    //   3
    // );
    // doc.text(
    //   SCHOOL_EMAIL,
    //   schoolHeaderStartX + 38,
    //   schoolContactDetailStartY + 12
    // );

    // Title section
    doc.setFillColor("#939393");
    doc.rect(cardXStartPoint, y + 26, cardXEndPoint, 6, "F");
    doc.setFont("Poppins", "semibold");
    doc.setFontSize(9);
    doc.setTextColor("#fff");

    let headerText = "Faculty Daily Attendance Report";

    // Center the text properly
    const textWidth = doc.getTextWidth(headerText);
    const centerX = (cardWidth - textWidth) / 2;
    doc.text(headerText, x + centerX, y + 30);

    let tableX = x + 5;
    let tableY = y + 25;


    // Table header and body
    const tableHeader = [
        "#",
        "Name",
        "Phone",
        "Mode",
        "Comment"
    ];
    const tableBody = attendanceData.map((record, index) => [
        (index + 1).toString(),
        record.facultyName,
        record.facultyPhone?.toString() || '-',
        record.isSmartAttendance ? 'Smart' : 'Manual',
        record.comment || '-'
    ]);

    autoTable(doc, {
        head: [tableHeader],
        body: tableBody,
        startY: tableY,
        theme: 'grid',
        styles: {
            textColor: '#000',
            fontSize: 8,
            minCellHeight: 4,
        },
        margin: { left: tableX + 2 },
        headStyles: {
            cellWidth: 20,
            fillColor: '#fff',
            textColor: '#000',
            minCellHeight: 3,
            fontSize: 7,
        },
        columnStyles: {
            1: { cellWidth: 40 }, // Name
            2: { cellWidth: 28 }, // Phone
            3: { cellWidth: 20 }, // Mode
            4: { cellWidth: 60 }, // Comment
        },
    });

    // Draw border around content
    doc.setDrawColor("#949494");
    doc.rect(x, y, cardWidth, cardHeight);

    return doc;
}

export const generateMonthlyFacultyAttendanceReport = async (attendanceData: { [date: string]: FacultyAttendanceShema[] }) => {
    const config = getAppConfig();
    if (!config) {
        console.error("Error: App config not found.");
        return;
    }
    const {
        schoolName: SCHOOL_NAME,
        schoolAddress: SCHOOL_ADDRESS,
        schoolContact: SCHOOL_CONTACT,
        schoolLogoBase64: SCHOOL_LOGO,
    } = config;
    const doc = new jsPDF({ orientation: "l", unit: "mm", format: "a4" });
    const cardWidth = doc.internal.pageSize.getWidth() - 15;
    const cardHeight = doc.internal.pageSize.getHeight() - 15;
    const margin = 2;
    const x = 5 + margin;
    const y = 5 + margin;


    doc.setTextColor("#000");

    // Load fonts
    doc.addFileToVFS("Poppins-Bold", POPPINS_BOLD);
    doc.addFont("Poppins-Bold", "Poppins", "bold");
    doc.addFileToVFS("Poppins-Regular", POPPINS_REGULAR);
    doc.addFont("Poppins-Regular", "Poppins", "normal");
    doc.addFileToVFS("Poppins-Semibold", POPPINS_SEMIBOLD);
    doc.addFont("Poppins-Semibold", "Poppins", "semibold");

    doc.addImage(SCHOOL_LOGO, x + 45, y + 1, 30, 25);

    const schoolHeaderStartX = x + 75;
    const schoolHeaderStartY = y + 5;

    doc.setFontSize(15);
    doc.setFont("Poppins", "bold");
    doc.text(SCHOOL_NAME, schoolHeaderStartX + 10, schoolHeaderStartY);

    doc.setFontSize(8);
    doc.setFont("Poppins", "semibold");
    doc.text(
        "An English Medium School Based on CBSE Curriculum",
        schoolHeaderStartX + 7,
        schoolHeaderStartY + 5
    );

    const schoolContactDetailStartY = schoolHeaderStartY + 2;
    const cardXStartPoint = x;
    const cardXEndPoint = cardWidth;

    // School address section
    doc.setFillColor("#cbc9c9");
    doc.rect(
        schoolHeaderStartX + 5,
        schoolContactDetailStartY + 5,
        cardXEndPoint - 200,
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

    // School contact info
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

    // doc.addImage(
    //   EMAIL_ICON,
    //   schoolHeaderStartX + 34,
    //   schoolContactDetailStartY + 10,
    //   3,
    //   3
    // );
    // doc.text(
    //   SCHOOL_EMAIL,
    //   schoolHeaderStartX + 38,
    //   schoolContactDetailStartY + 12
    // );

    // Title section
    doc.setFillColor("#939393");
    doc.rect(cardXStartPoint, y + 26, cardXEndPoint, 6, "F");
    doc.setFont("Poppins", "semibold");
    doc.setFontSize(9);
    doc.setTextColor("#fff");

    let headerText = "Faculty Daily Attendance Report";

    // Center the text properly
    const textWidth = doc.getTextWidth(headerText);
    const centerX = (cardWidth - textWidth) / 2;
    doc.text(headerText, x + centerX, y + 30);

    let tableX = x + 5;
    let tableY = y + 25;
    // Get all unique faculty members
    const facultyMap = new Map<string, { name: string; attendance: { [date: string]: string } }>();

    // Process attendance data
    Object.entries(attendanceData).forEach(([date, records]) => {
        records.forEach(record => {
            if (!facultyMap.has(record.id)) {
                facultyMap.set(record.id, {
                    name: record.facultyName,
                    attendance: {}
                });
            }
            facultyMap.get(record.id)!.attendance[date] = record.isSmartAttendance ? 'P' : 'M';
        });
    });

    // Create table data
    const dates = Object.keys(attendanceData).sort();
    const tableHeader = ["#", "Name", ...dates];
    const tableBody = Array.from(facultyMap.values()).map((faculty, index) => {
        return [
            (index + 1).toString(),
            faculty.name,
            ...dates.map(date => faculty.attendance[date] || 'A')
        ];
    });

    autoTable(doc, {
        head: [tableHeader],
        body: tableBody,
        startY: tableY,
        theme: 'grid',
        styles: {
            textColor: '#000',
            fontSize: 7,
            minCellHeight: 4,
        },
        margin: { left: tableX + 2 },
        headStyles: {
            cellWidth: 20,
            fillColor: '#fff',
            textColor: '#000',
            minCellHeight: 3,
            fontSize: 6,
        },
        columnStyles: {
            1: { cellWidth: 40 }, // Name
        },
    });

    // Draw border around content
    doc.setDrawColor("#949494");
    doc.rect(x, y, cardWidth, cardHeight);

    return doc;
}

