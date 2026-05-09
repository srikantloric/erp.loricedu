import { getFirestoreInstance } from "context/firebaseUtility";
import { collection, getDocs, query, where } from "firebase/firestore";
import { StudentDetailsType } from "types/student";

export const getStudentById = async (
  studentId: string,
  sessionId: string,
): Promise<StudentDetailsType | null> => {
  if (!studentId) {
    throw new Error("Student ID is required");
  }

  const db = await getFirestoreInstance();

  const studentsRef = collection(db, "STUDENTS");
  const studentSessionRef = collection(db, "STUDENTS_SESSIONS");

  // Query to get the student session data for the given studentId and sessionId
  const sessionQuery = query(
    studentSessionRef,
    where("studentId", "==", studentId),
    where("sessionId", "==", sessionId),
  );
  const sessionSnapshot = await getDocs(sessionQuery);
  if (sessionSnapshot.empty) {
    console.warn(
      `No session data found for student ID ${studentId} and session ID ${sessionId}`,
    );
    return null;
  }

  // Assuming there's only one session document per student per session
  const sessionDoc = sessionSnapshot.docs[0];
  const sessionData = sessionDoc.data();
  if (!sessionData) {
    console.warn(
      `Session data is empty for student ID ${studentId} and session ID ${sessionId}`,
    );
    return null;
  }
  // Query to get the student data for the given studentId
  const studentQuery = query(studentsRef, where("id", "==", studentId));
  const studentSnapshot = await getDocs(studentQuery);
  if (studentSnapshot.empty) {
    console.warn(`No student data found for student ID ${studentId}`);
    return null;
  }
  const studentDoc = studentSnapshot.docs[0];
  const studentData = studentDoc.data() as StudentDetailsType;
  if (!studentData) {
    console.warn(`Student data is empty for student ID ${studentId}`);
    return null;
  }

  return {
    ...studentData,
    class: sessionData.class,
    classId: sessionData.classId,
    section: sessionData.section,
    rollNumber: sessionData.rollNumber,
    sessionDocId: sessionDoc.id,
    sessionId: sessionData.sessionId,
  };
};
