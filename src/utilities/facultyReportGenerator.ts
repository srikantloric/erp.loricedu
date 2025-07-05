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

export const generateFacultyAttendanceReport = async (attendanceData: FacultyAttendanceShema[], selectedDate?: string) => {
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
        schoolWebsite: SCHOOL_WEBSITE
    } = config;
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

    const cardWidth = doc.internal.pageSize.getWidth() - 18;
    const cardHeight = doc.internal.pageSize.getHeight() - 18;
    const margin = 4;
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




    const schoolHeaderStartX = x + 5;
    const schoolHeaderStartY = y + 10;

    ///Start of PDF Design

    //right logo
    doc.addImage(SCHOOL_LOGO, cardWidth - 25, y + 2, 27, 25);


    doc.setFontSize(22);
    doc.setFont("Poppins", "bold");
    doc.setTextColor("#0000");

    doc.text(
        SCHOOL_NAME.toUpperCase(),
        schoolHeaderStartX,
        schoolHeaderStartY,
        { align: "left" }
    );

    doc.setFontSize(8);
    doc.setFont("Poppins", "semibold");
    const tagline = "An English Medium School Based on CBSE Curriculum";
    doc.text(
        tagline,
        schoolHeaderStartX,
        schoolHeaderStartY + 5,
        { align: "left" }
    );

    const schoolContactDetailStartY = schoolHeaderStartY + 5;
    doc.setFontSize(8);
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

    const websiteName = "" + SCHOOL_WEBSITE;
    doc.text(
        websiteName,
        schoolHeaderStartX,
        schoolContactDetailStartY + 13
    );

    const cardXStartPoint = x;
    const cardXEndPoint = cardWidth;

    // Title section
    doc.setFillColor("#939393");
    doc.rect(cardXStartPoint, y + 35, cardXEndPoint, 6, "F");
    doc.setFont("Poppins", "semibold");
    doc.setFontSize(9);
    doc.setTextColor("#fff");

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    let headerText = selectedDate
        ? `Faculty Daily Attendance Report - ${formatDate(selectedDate)}`
        : "Faculty Daily Attendance Report";

    const textWidth = doc.getTextWidth(headerText);
    const centerX = (cardWidth - textWidth) / 2;
    doc.text(headerText, x + centerX, y + 39);

    const footerText = "Report generated usign LoricEdu Software" + " | " + new Date().toLocaleString()
    doc.setTextColor("#000")
    doc.setFontSize(6)
    doc.text(footerText, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 4, { align: "center" });

    let tableX = x + 2;
    let tableY = y + 45;

    const tableHeader = [
        "#",
        "ID",
        "Name",
        "Phone",
        "Mode",
        "Status",
        "Comment"
    ];
    const tableBody = attendanceData.map((record, index) => [
        (index + 1).toString(),
        record.id || '-',
        record.facultyName,
        record.facultyPhone?.toString() || '-',
        record.isSmartAttendance ? 'Smart' : 'Manual',
        record.attendanceStatus || '-',
        record.comment || '-'
    ]);

    // Calculate available width for table
    const availableWidth = cardWidth - 4;

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
        margin: { left: tableX, right: tableX },
        headStyles: {
            fillColor: '#fff',
            textColor: '#000',
            minCellHeight: 3,
            fontSize: 6,
        },
        columnStyles: {
            0: { cellWidth: 8 },  // #
            1: { cellWidth: 25 }, // ID
            2: { cellWidth: 40 }, // Name
            3: { cellWidth: 25 }, // Phone
            4: { cellWidth: 20 }, // Mode
            5: { cellWidth: 20 }, // Status
            6: { cellWidth: availableWidth - 138 }, // Comment - takes remaining width
        },
    });

    // Draw border around content
    doc.setDrawColor("#949494");
    doc.rect(x, y, cardWidth, cardHeight);

    const pdfBlob = doc.output('blob');
    return URL.createObjectURL(pdfBlob);
}

export const generateMonthlyFacultyAttendanceReport = async (
    attendanceData: { [date: string]: FacultyAttendanceShema[] },
    monthName?: string,
    year?: string
) => {
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

    // Title section
    doc.setFillColor("#939393");
    doc.rect(cardXStartPoint, y + 26, cardXEndPoint, 6, "F");
    doc.setFont("Poppins", "semibold");
    doc.setFontSize(8);
    doc.setTextColor("#fff");

    let headerText = monthName && year
        ? `Faculty Monthly Attendance Report - ${monthName} ${year}`
        : "Faculty Monthly Attendance Report";

    const textWidth = doc.getTextWidth(headerText);
    const centerX = (cardWidth - textWidth) / 2;
    doc.text(headerText, x + centerX, y + 30);

    doc.setTextColor("#000")
    doc.text(headerText, x + centerX, y + 50);


    let tableX = x + 2;
    let tableY = y + 35;

    const facultyMap = new Map<string, {
        name: string;
        phone: string;
        attendance: { [date: string]: { status: string; mode: string } }
    }>();

    // Process attendance data
    Object.entries(attendanceData).forEach(([date, records]) => {
        records.forEach(record => {
            if (!facultyMap.has(record.id)) {
                facultyMap.set(record.id, {
                    name: record.facultyName,
                    phone: record.facultyPhone?.toString() || '-',
                    attendance: {}
                });
            }

            const attendanceStatus = record.attendanceStatus || (record.isSmartAttendance ? 'P' : 'M');
            const mode = record.isSmartAttendance ? 'S' : 'M';
            facultyMap.get(record.id)!.attendance[date] = { status: attendanceStatus, mode: mode };
        });
    });

    // Create table data with only date numbers in headers
    const dates = Object.keys(attendanceData).sort();
    const dateHeaders = dates.map(date => {
        // Extract only the day from the date (e.g., "2024-01-15" -> "15")
        const day = date.split('-')[2];
        return day;
    });

    const tableHeader = ["#", "ID", "Name", "Phone", "Mode", ...dateHeaders];
    const tableBody = Array.from(facultyMap.entries()).map(([id, faculty], index) => {
        const modes = Object.values(faculty.attendance).map(att => att.mode);
        const mostCommonMode = modes.length > 0 ? modes.reduce((a, b, i, arr) =>
            arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        ) : 'M';

        return [
            (index + 1).toString(),
            id,
            faculty.name,
            faculty.phone,
            mostCommonMode,
            ...dates.map(date => faculty.attendance[date]?.status || 'A')
        ];
    });

    // Calculate available width for table
    const availableWidth = cardWidth - 4; // Leave small margin on both sides
    const fixedColumnsWidth = 6 + 12 + 20 + 15 + 8; // Sum of fixed columns
    const dateColumnsCount = dates.length;
    const dateColumnWidth = Math.max(6, (availableWidth - fixedColumnsWidth) / dateColumnsCount);

    autoTable(doc, {
        head: [tableHeader],
        body: tableBody,
        startY: tableY,
        theme: 'grid',
        styles: {
            textColor: '#000',
            fontSize: 5,
            minCellHeight: 3,
        },
        margin: { left: tableX, right: tableX },
        headStyles: {
            fillColor: '#fff',
            textColor: '#000',
            minCellHeight: 3,
            fontSize: 5,
        },
        columnStyles: {
            0: { cellWidth: 6 },  // #
            1: { cellWidth: 12 }, // ID
            2: { cellWidth: 20 }, // Name
            3: { cellWidth: 15 }, // Phone
            4: { cellWidth: 8 },  // Mode
        },
        // Set individual date column widths to use full width
        didParseCell: function (data) {
            if (data.column.index >= 5) {
                // Date columns - use calculated width
                data.cell.styles.cellWidth = dateColumnWidth;
            }
        }
    });

    // Draw border around content
    doc.setDrawColor("#949494");
    doc.rect(x, y, cardWidth, cardHeight);



    const pdfBlob = doc.output('blob');
    return URL.createObjectURL(pdfBlob);
}