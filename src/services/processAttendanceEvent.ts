// services/processAttendanceEvent.ts

import { getFirestoreInstance } from "context/firebaseUtility";
import {
  doc,
  FieldValue,
  increment,
  runTransaction,
  Timestamp,
} from "firebase/firestore";

import { AttendanceStatus } from "types/AttendanceType";

export interface AttendanceEvent {
  studentId: string;
  classId: number;
  date: string;           // YYYY-MM-DD
  status: AttendanceStatus;
  timestamp: Timestamp | FieldValue;   // Firestore timestamp
  comment?: string;
  source: "MANUAL";
}

export async function processAttendanceEvent(event: AttendanceEvent) {
  const db = await getFirestoreInstance();

  const { studentId, classId, date, status, timestamp } = event;

  const dailyRef = doc(
    db,
    "ATTENDANCE_DAILY",
    date,
    "CLASSES",
    classId.toString(),
    "STUDENTS",
    studentId
  );

  const classSummaryRef = doc(
    db,
    "ATTENDANCE_SUMMARY_DAILY",
    date,
    "CLASSES",
    classId.toString()
  );

  const schoolSummaryRef = doc(db, "ATTENDANCE_SUMMARY_DAILY", date);

  const monthlyRef = doc(
    db,
    "ATTENDANCE_MONTHLY",
    studentId,
    "MONTHS",
    date.slice(0, 7)
  );

  await runTransaction(db, async (tx) => {
    const dailySnap = await tx.get(dailyRef);
    const monthlySnap = await tx.get(monthlyRef);

    let oldStatus: AttendanceStatus | null = null;

    if (dailySnap.exists()) {
      oldStatus = dailySnap.data().status as AttendanceStatus;
    }

    const isUpdate = !!oldStatus;

    // ----------------------------------------
    // 1️⃣ DAILY ATTENDANCE
    // ----------------------------------------
    if (status !== "PRESENT") {
      tx.set(
        dailyRef,
        {
          studentId,
          date,
          classId,
          status,
          present: false,
          firstIn: null,
          lastOut: null,
        },
        { merge: true }
      );
    } else {
      if (!dailySnap.exists()) {
        tx.set(dailyRef, {
          studentId,
          date,
          classId,
          status: "PRESENT",
          present: true,
          firstIn: timestamp,
          lastOut: timestamp,
        });
      } else {
        tx.update(dailyRef, { lastOut: timestamp });
      }
    }

    // ----------------------------------------
    // 2️⃣ MONTHLY ATTENDANCE
    // ----------------------------------------
    const monthData = monthlySnap.exists()
      ? monthlySnap.data()
      : {
        present: 0,
        absent: 0,
        leave: 0,
        half_day: 0,
        holiday: 0,
        total: 0,
        days: {},
      };

    const currentMonthStatus = monthData.days?.[date] || null;

    if (currentMonthStatus !== status) {
      // decrement old
      if (currentMonthStatus) {
        const oldKey = currentMonthStatus.toLowerCase();
        monthData[oldKey] = Math.max(0, monthData[oldKey] - 1);
      }

      // increment new
      const newKey = status.toLowerCase();
      monthData[newKey] = (monthData[newKey] || 0) + 1;

      // update day
      monthData.days[date] = status;

      monthData.total =
        monthData.present +
        monthData.absent +
        monthData.leave +
        monthData.half_day +
        monthData.holiday;

      tx.set(monthlyRef, monthData, { merge: true });
    }

    // ----------------------------------------
    // 3️⃣ CLASS SUMMARY
    // ----------------------------------------
    if (!isUpdate) {
      // New entry → total +1
      tx.set(
        classSummaryRef,
        {
          total: increment(1),
          [status.toLowerCase()]: increment(1),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } else if (oldStatus && oldStatus !== status) {
      // Status changed → decrement old, increment new
      tx.set(
        classSummaryRef,
        {
          [oldStatus.toLowerCase()]: increment(-1),
          [status.toLowerCase()]: increment(1),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }

    // ----------------------------------------
    // 4️⃣ SCHOOL SUMMARY
    // ----------------------------------------
    if (!isUpdate) {
      tx.set(
        schoolSummaryRef,
        {
          total: increment(1),
          [status.toLowerCase()]: increment(1),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } else if (oldStatus && oldStatus !== status) {
      tx.set(
        schoolSummaryRef,
        {
          [oldStatus.toLowerCase()]: increment(-1),
          [status.toLowerCase()]: increment(1),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  });
}
