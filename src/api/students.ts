import { getFirestoreInstance } from "context/firebaseUtility";
import { StudentDetailsType } from "types/student";

import { execute, field, variable } from "firebase/firestore/pipelines";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";

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

export const getStudentsByClass = async (
  classId: number,
  sessionId: string,
  section?: string,
): Promise<StudentDetailsType[]> => {
  const db = await getFirestoreInstance();

  try {
    const myPipeline = db
      .pipeline()
      .collection("STUDENTS_SESSIONS")
      .where(field("classId").equal(getClassNameByValue(classId)))
      .where(field("sessionId").equal(sessionId))
      .where(field("section").equal(section || ""))
      // expose outer field
      .define(field("studentId").as("studentIdVar"))
      // JOIN
      .addFields(
        db
          .pipeline()
          .collection("STUDENTS")
          .where(field("id").equal(variable("studentIdVar")))
          .toScalarExpression()
          .as("studentData"),
      );

    // EXECUTE
    const snap = await execute(myPipeline);
    const students: StudentDetailsType[] = snap.results.map((res) => {
      const row = res.data();
      const sessionDocId = res.id

      return {
        ...row.studentData,
        class: row.class || "",
        classId: row.classId || "",
        section: row.section || "",
        rollNumber: row.rollNumber || "",
        sessionId: row.sessionId || "",
        sessionDocId,
      };
    });

    return students;
  } catch (err) {
    console.error("Pipeline query failed:", err);
    return [];
  }
};
