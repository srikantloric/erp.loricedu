import jsPDF from "jspdf";
import { admitCardType } from "types/admitCard";
import {
  POPPINS_BOLD,
  POPPINS_REGULAR,
  POPPINS_SEMIBOLD,
  PROFILE_PLACEHOLDER_BASE64,
} from "./Base64Url";

import { getAppConfig } from "hooks/getAppConfig";
import { ExamData } from "components/Exams/ExamScheduleTable";
import { getDownloadURL, ref } from "firebase/storage";
import { getStorageInstance } from "context/firebaseUtility";

/* ---------------------------------------------
   Helpers
--------------------------------------------- */

export const getScheduleForClassAndSession = (
  timeTable: ExamData[],
  className: string,
  sessionName: string
) => {
  return timeTable
    .map((exam) => ({
      date: exam.date,
      sessions: exam.sessions
        .filter((s) => s.session === sessionName)
        .map((s) => ({
          session: s.session,
          subject: s.subjects[className] || "No Exam",
        }))
        .filter((s) => s.subject !== "No Exam"),
    }))
    .filter((exam) => exam.sessions.length > 0);
};

/* ---------------------------------------------
   Image Loader (Base64)
--------------------------------------------- */

async function imagePathToBase64(path: string): Promise<string> {
  const storage = await getStorageInstance();
  const imageRef = ref(storage, path);
  const downloadUrl = await getDownloadURL(imageRef);

  const res = await fetch(downloadUrl);
  const blob = await res.blob();

  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/* ---------------------------------------------
   MAIN PDF GENERATOR
--------------------------------------------- */

export const GenerateAdmitCard = async (
  data: admitCardType[]
): Promise<string> => {
  /* ---------- App Config ---------- */
  const config = getAppConfig();
  if (!config) throw new Error("App config not found");

  const {
    schoolName,
    schoolAddress,
    schoolWebsite,
    schoolPrincipalSignBase64,
  } = config;

  /* ---------- jsPDF ---------- */
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  /* ---------- Fonts ---------- */
  doc.addFileToVFS("Poppins-Bold", POPPINS_BOLD);
  doc.addFont("Poppins-Bold", "Poppins", "bold");

  doc.addFileToVFS("Poppins-Regular", POPPINS_REGULAR);
  doc.addFont("Poppins-Regular", "Poppins", "normal");

  doc.addFileToVFS("Poppins-Semibold", POPPINS_SEMIBOLD);
  doc.addFont("Poppins-Semibold", "Poppins", "semibold");

  /* ---------- Layout ---------- */
  const cardHeight = 297 / 3 - 2;
  const margin = 5;

  /* ---------- IMAGE PREFETCH (FAST PART) ---------- */

  const imageCache = new Map<string, string>();

  const imagePaths = Array.from(
    new Set(
      data
        .map((s) => s.profile_url)
        .filter(Boolean)
        .map((url) => decodeURIComponent(url!.split(".app/")[1]))
    )
  );

  await Promise.all(
    imagePaths.map(async (path) => {
      try {
        const base64 = await imagePathToBase64(path);
        imageCache.set(path, base64);
      } catch {
        imageCache.set(path, PROFILE_PLACEHOLDER_BASE64);
      }
    })
  );

  /* ---------- PDF CONTENT ---------- */

  for (let index = 0; index < data.length; index++) {
    const student = data[index];

    if (index > 0 && index % 3 === 0) {
      doc.addPage();
    }

    const positionY = (index % 3) * cardHeight + margin + 6;

    /* Border */
    doc.setDrawColor(0);
    doc.rect(margin, positionY - margin, 210 - 2 * margin, cardHeight - margin);

    /* Header */
    doc.setFont("Poppins", "bold");
    doc.setFontSize(26);
    doc.setTextColor(0, 0, 139);
    doc.text(schoolName, 105, positionY + 4, { align: "center" });

    doc.setFont("Poppins", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(
      `${schoolAddress} | ${schoolWebsite}`,
      105,
      positionY + 11,
      { align: "center" }
    );

    /* Title */
    doc.setFillColor("#000");
    doc.rect(margin, positionY + 15, 210 - 2 * margin, 8, "F");
    doc.setFont("Poppins", "semibold");
    doc.setFontSize(14);
    doc.setTextColor(255);
    doc.text(
      `ADMIT CARD || ${student.examTitle} || Session: ${student.session}`,
      105,
      positionY + 21,
      { align: "center" }
    );
    doc.setTextColor(0);

    /* Student Photo */
    const imagePath = student.profile_url
      ? decodeURIComponent(student.profile_url.split(".app/")[1])
      : "";

    const photo =
      imageCache.get(imagePath) || PROFILE_PLACEHOLDER_BASE64;

    doc.addImage(photo, margin + 6, positionY + 30, 25, 30);
    doc.rect(margin + 6, positionY + 30, 25, 30);

    /* Student Info */
    const x = margin + 36;
    doc.setFont("Poppins", "semibold");
    doc.setTextColor(0, 0, 139);
    doc.text(student.studentName, x, positionY + 30);

    doc.setFont("Poppins", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Class: ${student.className}`, x, positionY + 35);
    doc.text(`Father: ${student.fatherName}`, x, positionY + 40);
    doc.text(`Mother: ${student.motherName}`, x, positionY + 45);
    doc.text(`DOB: ${student.studentDOB}`, x, positionY + 50);
    doc.text(`ID: ${student.studentId}`, x, positionY + 55);
    doc.text(`Roll No: ${student.rollNumber}`, x, positionY + 60);

    /* Exam Timing */
    doc.setFillColor("#ffffcc");
    doc.rect(margin + 6, positionY + 62, 90, 10, "F");
    doc.setFont("Poppins", "semibold");
    doc.text(
      `Exam Timing: ${student.examTimings}`,
      margin + 10,
      positionY + 69
    );

    /* Time Table */
    const startY = positionY + 34;
    const tableX = 113;

    doc.setFillColor("#cccccc");
    doc.rect(tableX - 4, startY - 6, 90, 8, "F");
    doc.text("Date", tableX + 7, startY - 2, { align: "center" });
    doc.text("1st Seating", tableX + 35, startY - 2, { align: "center" });
    doc.text("2nd Seating", tableX + 65, startY - 2, { align: "center" });

    const first = getScheduleForClassAndSession(
      student.timeTabel,
      student.className,
      "1st"
    );
    const second = getScheduleForClassAndSession(
      student.timeTabel,
      student.className,
      "2nd"
    );

    const dates = new Set([...first, ...second].map((x) => x.date));

    Array.from(dates)
      .sort()
      .forEach((date, i) => {
        const y = startY + (i + 1) * 6;
        doc.setFillColor(i % 2 === 0 ? "#ccffcc" : "#ffffcc");
        doc.rect(tableX - 4, y - 6, 90, 6, "F");
        doc.rect(tableX - 4, y - 6, 90, 6);

        const f = first.find((x) => x.date === date)?.sessions[0]?.subject || "-";
        const s = second.find((x) => x.date === date)?.sessions[0]?.subject || "-";

        const [yy, mm, dd] = date.split("-");
        doc.text(`${dd}/${mm}/${yy}`, tableX + 7, y - 2, { align: "center" });
        doc.text(f, tableX + 35, y - 2, { align: "center" });
        doc.text(s, tableX + 65, y - 2, { align: "center" });
      });

    /* Signatures */
    const signY = positionY + cardHeight - 15;
    doc.setFontSize(8);
    doc.text("(Class Teacher)", margin + 20, signY + 4);
    doc.text("(Principal)", 150, signY + 4);
    doc.addImage(schoolPrincipalSignBase64, "PNG", 150, signY - 10, 20, 15);
  }

  /* ---------- OUTPUT ---------- */
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
};
