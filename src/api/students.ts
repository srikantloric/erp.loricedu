import { getFirestoreInstance } from "context/firebaseUtility";
import { StudentDetailsType } from "types/student";

import { execute, field, variable } from "firebase/firestore/pipelines";

export const getStudentById = async (
  studentId: string,
  sessionId: string,
): Promise<StudentDetailsType | null> => {
  if (!studentId) {
    throw new Error("Student ID is required");
  }

  const db = await getFirestoreInstance();

  try {
    const myPipeline = db
      .pipeline()

      .collection("STUDENTS")

      .where(field("id").equal(studentId.toString()))
      // expose outer field
      .define(field("id").as("studentIdVar"))

      // JOIN
      .addFields(
        db
          .pipeline()
          .collection("STUDENTS_SESSIONS")
          .where(field("studentId").equal(variable("studentIdVar")))
          .where(field("sessionId").equal(sessionId))
          .toScalarExpression()
          .as("studentSessionData"),
      );

    // EXECUTE
    const snap = await execute(myPipeline);
    const result = snap.results[0]?.data();

    const row = result;

    const studentData = row;
    const studentSessionData = row.studentSessionData;
    console.log("Pipeline result:", row);

    if (!studentData) {
      return null;
    }

    // FINAL MERGE
    return {
      ...studentData,

      class: studentSessionData?.class || "",
      classId: studentSessionData?.classId || "",
      section: studentSessionData?.section || "",
      rollNumber: studentSessionData?.rollNumber || "",
      sessionId: studentSessionData?.sessionId || "",

      sessionDocId: studentSessionData?.__name__?.id || undefined,
    } as StudentDetailsType;
  } catch (err) {
    console.error("Pipeline query failed:", err);
    return null;
  }
};
