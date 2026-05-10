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

      .collection("STUDENTS_SESSIONS")

      .where(field("studentId").equal(studentId.toString()))

      .where(field("sessionId").equal(sessionId))

      // expose outer field
      .define(field("studentId").as("studentIdVar"))

      // JOIN
      .addFields(
        db
          .pipeline()

          .collection("STUDENTS")

          .where(field("id").equal(variable("studentIdVar")))

          .toScalarExpression()

          .as("student"),
      );

    // EXECUTE
    const result = (await execute(myPipeline)).results[0].data();
    console.log(result);

    const row = result;

    const studentData = row.student;

    if (!studentData) {
      return null;
    }

    // FINAL MERGE
    return {
      ...studentData,

      class: row.class,
      classId: row.classId,
      section: row.section,
      rollNumber: row.rollNumber,
      sessionId: row.sessionId,

      sessionDocId: row.__name__ || row.id || undefined,
    } as StudentDetailsType;
  } catch (err) {
    console.error("Pipeline query failed:", err);
    return null;
  }
};
