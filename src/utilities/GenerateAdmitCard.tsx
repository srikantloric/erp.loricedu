import jsPDF from "jspdf";
import { admitCardType } from "types/admitCard";

import { POPPINS_BOLD, POPPINS_REGULAR, POPPINS_SEMIBOLD, PROFILE_PLACEHOLDER_BASE64 } from "./Base64Url";

import { examData } from "components/Exams/ExamPlannerTable";
import { getAppConfig } from "hooks/getAppConfig";
export const getScheduleForClassAndSession = (className: string, sessionName: string) => {
  return examData
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
      schoolWebsite: SCHOOL_WEBSITE
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
      doc.rect(margin + 6, positionY + 62, timeTableX - margin - 12, 10, "F");
      doc.setFont("Poppins", "semibold");
      doc.setFontSize(10);
      doc.text(
        `Exam Timing: ${studentData.startTime} to ${studentData.endTime}`,
        (margin + 6 + timeTableX - margin - 12) / 2,
        positionY + 69,
        { align: "center" }
      );

      // Time Table
      doc.setFont("Poppins", "semibold");
      doc.setFontSize(10);
      let startY = positionY + 34;

      // Table Headers
      doc.setFillColor("#cccccc"); // Light grey background for headers
      doc.rect(timeTableX - 4, startY - 6, 90, 8, "F");
      doc.text("Date", timeTableX + 7, startY - 2, { align: "center" });
      doc.text("1st Seating", timeTableX + 35, startY - 2, { align: "center" });
      // doc.text("2nd Meeting", timeTableX + 70, startY - 2, { align: "center" });

      // Table Rows
      doc.setFont("Poppins", "normal");
      const classSessionSchedule = getScheduleForClassAndSession(studentData.className, "1st");
      console.log(classSessionSchedule);

      classSessionSchedule.forEach((item, index) => {
        const rowY = startY + (index + 1) * 6;
        const fillColor = index % 2 === 0 ? "#ccffcc" : "#ffffcc"; // Light green and light yellow
        doc.setFillColor(fillColor);
        doc.rect(timeTableX - 4, rowY - 6, 90, 6, "F");
        doc.setDrawColor(0, 0, 0);
        doc.rect(timeTableX - 4, rowY - 6, 90, 6);
        doc.text(item.date, timeTableX + 7, rowY - 2, {
          align: "center",
        });
        doc.text(item.sessions[0].subject, timeTableX + 35, rowY - 2, {
          align: "center",
        });

      });

      // Signatures
      const signatureY = positionY + cardHeight - 15;
      doc.setFont("Poppins", "normal");
      doc.setFontSize(10);
      // doc.text("(Exam Controller)", margin + 20, signatureY);
      doc.text("(Exam Controller)", 150, signatureY);
      // doc.text("(Class Teacher)", 85, signatureY);
      // doc.text("(Director)", 150, signatureY);
    });
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    resolve(url);
  });
};
