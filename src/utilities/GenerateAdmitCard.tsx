import jsPDF from "jspdf";
import { admitCardType } from "types/admitCard";

import { POPPINS_BOLD, POPPINS_REGULAR, POPPINS_SEMIBOLD, PROFILE_PLACEHOLDER_BASE64 } from "./Base64Url";

// import { examData } from "components/Exams/ExamScheduleTable";
import { getAppConfig } from "hooks/getAppConfig";
import { ExamData } from "components/Exams/ExamScheduleTable";
export const getScheduleForClassAndSession = (timeTable: ExamData[], className: string, sessionName: string) => {
  return timeTable
    .map((exam) => ({
      date: exam.date,
      sessions: exam.sessions
        .filter((session) => session.session === sessionName)
        .map((session) => ({
          session: session.session,
          subject: session.subjects[className] || "No Exam",
        }))
        .filter((session) => session.subject !== "No Exam"),
    }))
    .filter((exam) => exam.sessions.length > 0);
};

export const GenerateAdmitCard = async (
  data: admitCardType[]
): Promise<string> => {
  return new Promise(async (resolve, reject) => {

    const config = getAppConfig();
    if (!config) {
      console.error("Error: App config not found.");
      return;
    }
    const {
      schoolName: SCHOOL_NAME,
      schoolAddress: SCHOOL_ADDRESS,
      schoolWebsite: SCHOOL_WEBSITE,
      schoolPrincipalSignBase64: PRINCIPAL_SIGN
    } = config;


    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Load fonts
    doc.addFileToVFS("Poppins-Bold", POPPINS_BOLD);
    doc.addFont("Poppins-Bold", "Poppins", "bold");

    doc.addFileToVFS("Poppins-Regular", POPPINS_REGULAR);
    doc.addFont("Poppins-Regular", "Poppins", "normal");

    doc.addFileToVFS("Poppins-Semibold", POPPINS_SEMIBOLD);
    doc.addFont("Poppins-Semibold", "Poppins", "semibold");

    const cardHeight = (297 / 3) - 2;
    const margin = 5; // Margin around the admit card

    data.forEach((studentData, index) => {
      const positionY = (index % 3) * cardHeight + margin + 6;
      if (index > 0 && index % 3 === 0) {
        doc.addPage();
      }

      // Border around admit card
      doc.setDrawColor(0, 0, 0);
      doc.rect(margin, positionY - margin, 210 - 2 * margin, cardHeight - margin);

      // School Header

      doc.addImage(PROFILE_PLACEHOLDER_BASE64, "PNG", margin + 6, positionY + 30, 25, 30); // Adjust the position and size as needed

      doc.setFont("Poppins", "bold");
      doc.setFontSize(26);
      doc.setTextColor(0, 0, 139);
      doc.text(SCHOOL_NAME, 105, positionY + 4, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFont("Poppins", "normal");
      doc.setFontSize(9);
      doc.text(`${SCHOOL_ADDRESS}  |  ${SCHOOL_WEBSITE}`, 105, positionY + 11, {
        align: "center",
      });

      // Admit Card Title with Exam Title and Session
      doc.setFillColor(0, 0, 0);
      doc.rect(margin, positionY + 15, 210 - 2 * margin, 8, "F");
      doc.setFont("Poppins", "semibold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(
        `ADMIT CARD || ${studentData.examTitle} || Session: ${studentData.session}`,
        105,
        positionY + 21,
        { align: "center" }
      );
      doc.setTextColor(0, 0, 0);

      // Student Image
      const studentImg = new Image();
      studentImg.src = studentData.profile_url;
      // doc.addImage(studentImg, "PNG", margin + 6, positionY + 30, 25, 30); // Stamp size
      doc.rect(margin + 6, positionY + 30, 25, 30);

      // Student Details
      doc.setFont("Poppins", "normal");
      doc.setFontSize(10);
      let studentDetailsX = margin + 36;
      let timeTableX = 113; // Starting X position for the time table

      doc.setTextColor(0, 0, 139);
      doc.setFont("Poppins", "semibold");
      doc.text(`${studentData.studentName}`, studentDetailsX, positionY + 30);

      doc.setTextColor(0, 0, 0);
      doc.setFont("Poppins", "normal");
      doc.text(
        `Class: ${studentData.className}`,
        studentDetailsX,
        positionY + 35
      );
      doc.text(
        `Father: ${studentData.fatherName}`,
        studentDetailsX,
        positionY + 40
      );
      doc.text(
        `Mother: ${studentData.motherName}`,
        studentDetailsX,
        positionY + 45
      );
      doc.text(`DOB: ${studentData.studentDOB}`, studentDetailsX, positionY + 50);

      // Card Number and Roll Number
      doc.text(
        `Id: ${studentData.studentId}`,
        studentDetailsX,
        positionY + 55
      );
      doc.text(
        `Roll No: ${studentData.rollNumber}`,
        studentDetailsX,
        positionY + 60
      );

      // Exam Details Box
      doc.setDrawColor(0, 0, 0);
      doc.setFillColor("#ffffcc"); // Light yellow background for exam timing
      doc.rect(margin + 6, positionY + 62, timeTableX - margin - 5, 10, "F");
      doc.setFont("Poppins", "semibold");
      doc.setFontSize(10);
      doc.text(
        `Exam Timing: ${studentData.examTimings}`,
        margin + 10,
        positionY + 69,
        { align: "left" }
      );

      // --- Time Table Section ---
      doc.setFont("Poppins", "semibold");
      doc.setFontSize(10);
      let startY = positionY + 34;

      // Table Headers
      doc.setFillColor("#cccccc"); // Light grey background for headers
      doc.rect(timeTableX - 4, startY - 6, 90, 8, "F");
      doc.text("Date", timeTableX + 7, startY - 2, { align: "center" });
      doc.text("1st Seating", timeTableX + 35, startY - 2, { align: "center" });
      doc.text("2nd Seating", timeTableX + 65, startY - 2, { align: "center" });

      // Fetch both sessions
      const firstSession = getScheduleForClassAndSession(
        studentData.timeTabel,
        studentData.className,
        "1st"
      );
      const secondSession = getScheduleForClassAndSession(
        studentData.timeTabel,
        studentData.className,
        "2nd"
      );

      // Merge both sessions by date
      const mergedSchedule = [] as {
        date: string;
        firstSubject: string;
        secondSubject: string;
      }[];

      const allDates = new Set([
        ...firstSession.map((x) => x.date),
        ...secondSession.map((x) => x.date),
      ]);

      allDates.forEach((date) => {
        const first = firstSession.find((x) => x.date === date);
        const second = secondSession.find((x) => x.date === date);
        mergedSchedule.push({
          date,
          firstSubject: first?.sessions[0]?.subject || "-",
          secondSubject: second?.sessions[0]?.subject || "-",
        });
      });

      // Sort dates (optional)
      mergedSchedule.sort((a, b) => a.date.localeCompare(b.date));

      // Draw table rows
      doc.setFont("Poppins", "normal");

      mergedSchedule.forEach((item, index) => {
        const rowY = startY + (index + 1) * 6;
        const fillColor = index % 2 === 0 ? "#ccffcc" : "#ffffcc"; // alternating row colors

        doc.setFillColor(fillColor);
        doc.rect(timeTableX - 4, rowY - 6, 90, 6, "F");
        doc.setDrawColor(0, 0, 0);
        doc.rect(timeTableX - 4, rowY - 6, 90, 6);

        const [year, month, day] = item.date.split("-");
        const formattedDate = `${day}/${month}/${year}`;

        doc.text(formattedDate, timeTableX + 7, rowY - 2, { align: "center" });
        doc.text(item.firstSubject, timeTableX + 35, rowY - 2, { align: "center" });
        doc.text(item.secondSubject, timeTableX + 65, rowY - 2, { align: "center" });
      });

      // Signatures
      const signatureY = positionY + cardHeight - 15;
      doc.setFont("Poppins", "normal");
      doc.setFontSize(8);

      doc.text("(Class Teacher)", margin + 20, signatureY + 4);


      // doc.addImage(PRINCIPAL_SIGN, "PNG", 80, signatureY - 10, 25, 13); // Placeholder for signature image
      // doc.text("(Principal)", 85, signatureY+4);

      doc.text("(Principal)", 150, signatureY + 4);
      doc.addImage(PRINCIPAL_SIGN, "PNG", 150, signatureY - 10, 20, 15); // Placeholder for signature image
    });
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    resolve(url);
  });
};
