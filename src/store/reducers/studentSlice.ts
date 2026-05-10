import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import FileResizer from "react-image-file-resizer";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { StudentDetailsType } from "types/student";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import {
  getFirestoreInstance,
  getStorageInstance,
} from "context/firebaseUtility";

import { execute, field, variable } from "firebase/firestore/pipelines";

const resizeFile = (file: any) =>
  new Promise((resolve) => {
    FileResizer.imageFileResizer(file, 500, 500, "WEBP", 100, 0, (uri) => {
      resolve(uri);
    });
  });

const generateFirebaseUID = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uid = "";
  for (let i = 0; i < 28; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return uid;
};

//ADD STUDENT
export const addstudent = createAsyncThunk<
  StudentDetailsType,
  { studentData: StudentDetailsType },
  { rejectValue: string }
>("add-students/addstudent", async ({ studentData }, { rejectWithValue }) => {
  // get Firestore instance
  const db = await getFirestoreInstance();

  try {
    // Fetch previous admission count from Firestore
    const prevAdmissionDoc = await getDoc(
      doc(db, "ADMISSION_TRACKER", "admission_number_tracker"),
    );

    if (!prevAdmissionDoc.exists()) {
      throw new Error("Error fetching previous admission number.");
    }

    const prevAdmissionNumber = prevAdmissionDoc.data()?.total_count || 0;
    const formattedCountValue = String(prevAdmissionNumber + 1).padStart(
      5,
      "0",
    );

    // Extract password from DOB and generate email
    const userPass = studentData.dob.split("-").reverse().join("");

    //fetch school id from local storage
    const schoolId = localStorage
      .getItem("schoolId")
      ?.split("_")[1]
      .substring(0, 3)
      .concat(new Date().getFullYear().toString())
      .toUpperCase();

    if (!schoolId) {
      throw new Error("Unable to construct email. School ID not found.");
    }
    const userEmail = `apx2025${formattedCountValue}@gmail.com`;

    const docId = generateFirebaseUID();
    const admissionNo = `${schoolId}${formattedCountValue}`;

    studentData = {
      ...studentData,
      student_id: userEmail,
      student_pass: userPass,
      id: docId,
      admission_no: admissionNo,
      created_at: serverTimestamp(),
    };

    const studentRef = doc(db, "STUDENTS", docId);
    const admissionTrackerRef = doc(
      db,
      "ADMISSION_TRACKER",
      "admission_number_tracker",
    );

    // Firestore Transaction to update admission tracker and save student data
    await runTransaction(db, async (trx) => {
      const countDoc = await trx.get(admissionTrackerRef);
      if (!countDoc.exists()) throw new Error("Document does not exist.");

      const newSerialNumber = countDoc.data()?.total_count + 1 || 1;
      trx.update(admissionTrackerRef, {
        total_count: newSerialNumber,
        updatedAt: new Date(),
      });
      trx.set(studentRef, studentData);
    });

    return studentData;
  } catch (error: any) {
    console.error(error);
    return rejectWithValue(
      error.message || "An error occurred while adding the student.",
    );
  }
});

//FETCH STUDENT
// export const fetchstudent = createAsyncThunk("student/fetchstudent", async () => {
//   console.log("fetch data query triggered");
//   const db = await getFirestoreInstance();
//   // Create a reference to the STUDENTS collection
//   const studentsRef = collection(db, "STUDENTS");

//   // Create a query with orderBy and filter where is_active is true
//   const q = query(studentsRef, orderBy("created_at", "desc"), where("is_active", "==", true));

//   // Fetch the documents based on the query
//   const snap = await getDocs(q);

//   // Map over the snapshot to return the student data
//   const students = snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

//   return students;
// });
// export const fetchstudent = createAsyncThunk(
//   "student/fetchstudent",
//   async (sessionId: string) => {
//     const db = await getFirestoreInstance();

//     if (!sessionId) {
//       return [];
//     }

//     // 🔹 Step 1: Get studentSessions for session
//     const sessionQuery = query(
//       collection(db, "STUDENTS_SESSIONS"),
//       where("sessionId", "==", sessionId),
//     );

//     const sessionSnap = await getDocs(sessionQuery);

//     if (sessionSnap.empty) {
//       console.log("No students found for session");
//       return [];
//     }

//     const sessions = sessionSnap.docs.map((sessionDoc) => ({
//       sessionDocId: sessionDoc.id,
//       ...(sessionDoc.data() as StudentSessionDoc),
//     }));

//     // 🔹 Step 2: Extract studentIds
//     const studentIds = Array.from(
//       new Set(sessions.map((session) => session.studentId).filter(Boolean)),
//     );

//     if (studentIds.length === 0) {
//       console.log("No student IDs found for session:", sessionId);
//       return [];
//     }

//     // 🔹 Step 3: Chunk (Firestore "in" limit = 10)
//     const chunks: string[][] = [];
//     for (let i = 0; i < studentIds.length; i += 10) {
//       chunks.push(studentIds.slice(i, i + 10));
//     }

//     const studentsById = new Map<string, StudentDetailsType>();

//     // 🔹 Step 4: Fetch only required students
//     for (const chunk of chunks) {
//       const studentQuery = query(
//         collection(db, "STUDENTS"),
//         where("__name__", "in", chunk),
//         where("is_active", "==", true),
//       );

//       const snap = await getDocs(studentQuery);

//       snap.docs.forEach((studentDoc) => {
//         studentsById.set(studentDoc.id, {
//           ...(studentDoc.data() as StudentDetailsType),
//           id: studentDoc.id,
//         });
//       });
//     }

//     // 🔹 Step 6: Merge base student details with academic session details
//     const finalData: StudentDetailsType[] = sessions.flatMap((session) => {
//       const student = studentsById.get(session.studentId);

//       if (!student) {
//         return [];
//       }

//       return [
//         {
//           ...student,
//           sessionDocId: session.sessionDocId!,
//           sessionId: session.sessionId!,
//           classId: session.classId!,
//           class: session.class!,
//           section: session.section!,
//           rollNumber: session.rollNumber!,
//         },
//       ];
//     });
//     return finalData;
//   },
// );

export const fetchstudent = createAsyncThunk(
  "student/fetchstudent",

  async (sessionId: string): Promise<StudentDetailsType[]> => {
    if (!sessionId) {
      return [];
    }

    console.log("Fetching students for session:", sessionId);

    const db = await getFirestoreInstance();

    try {
      const pipeline = db
        .pipeline()

        // MAIN COLLECTION
        .collection("STUDENTS_SESSIONS")

        // FILTER SESSION
        .where(field("sessionId").equal(sessionId))

        // expose session studentId
        .define(field("studentId").as("sId"))

        // JOIN STUDENTS
        .addFields(
          db
            .pipeline()
            .collection("STUDENTS")
            .where(field("id").equal(variable("sId")))
            .where(field("is_active").equal(true))
            .limit(1)
            .toScalarExpression()
            .as("student"),
        );

      // EXECUTE
      const snapshot = await execute(pipeline);
      if (snapshot.results.length === 0) {
        console.log("No students found for session:", sessionId);

        return [];
      }

      const finalData: StudentDetailsType[] = [];

      for (const result of snapshot.results) {
        const row = result.data();

        if (!row.student) {
          continue;
        }

        finalData.push({
          ...row.student,

          sessionDocId: row.__name__?.referencePath || row.id,

          sessionId: row.sessionId,

          classId: row.classId,

          class: row.class,

          section: row.section,

          rollNumber: row.rollNumber,
        });
      }
      return finalData;
    } catch (error) {
      console.error("Pipeline fetch failed:", error);

      return [];
    }
  },
);

//SET STUDENT INACTIVE
export const deleteStudent = createAsyncThunk(
  "student/deleteStudent",
  async (id: string, { rejectWithValue }) => {
    const db = await getFirestoreInstance();
    try {
      // Create a reference to the document
      const studentRef = doc(db, "STUDENTS", id);
      // Update the is_active field to false
      await setDoc(studentRef, { is_active: false }, { merge: true });
      return id;
    } catch (error: any) {
      console.error("Error updating document: ", error);
      return rejectWithValue(error.message || "Error setting student inactive");
    }
  },
);

//UPDATE STUDENT
export const updatedatastudent = createAsyncThunk(
  "student/updatestudent",
  async (
    {
      studentdata,
      imageupdate,
    }: { studentdata: StudentDetailsType; imageupdate: File | null },
    { rejectWithValue },
  ) => {
    let studentData = { ...studentdata };

    const db = await getFirestoreInstance();
    const storageRef = await getStorageInstance();

    try {
      studentData["updated_at"] = serverTimestamp();
      if (imageupdate) {
        console.log("updating new image..");

        const fileRef = ref(
          storageRef,
          `profileImages/${studentData.id}/${studentData.email}`,
        );

        const resizedImage = await resizeFile(imageupdate);
        const uploadTask = await uploadString(
          fileRef,
          "" + resizedImage,
          "data_url",
        );

        console.log(uploadTask);

        if (uploadTask) {
          const url = await getDownloadURL(fileRef);
          console.log(url);
          studentData["profil_url"] = url;

          // Update the student's data in Firestore
          await setDoc(doc(db, "STUDENTS", studentData.id), studentData);

          console.log("Student data updated with new image URL", studentData);
          return studentData;
        } else {
          console.log("Something went wrong while uploading the image.");
        }
      } else {
        // No image update, just update student data
        await setDoc(doc(db, "STUDENTS", studentData.id), studentData);
        return studentData;
      }
    } catch (e: any) {
      console.error("Error updating student data:", e);
      return rejectWithValue(e.message || "Something went wrong");
    }
  },
);

interface StudentState {
  studentarray: StudentDetailsType[]; // Array of student details
  loading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  studentarray: [],
  loading: true,
  error: null,
};

const studentslice = createSlice({
  name: "student",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add student
      .addCase(addstudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        addstudent.fulfilled,
        (state, action: PayloadAction<StudentDetailsType>) => {
          state.loading = false;
          state.studentarray.push(action.payload);
        },
      )
      .addCase(addstudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add student";
      })

      // Fetch students
      .addCase(fetchstudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchstudent.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.studentarray = action.payload;
      })
      .addCase(fetchstudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch students";
      })

      // Delete student
      .addCase(deleteStudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        deleteStudent.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.studentarray = state.studentarray.filter(
            (student) => student.id !== action.payload,
          );
        },
      )
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete student";
      })

      // Update student
      .addCase(updatedatastudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        updatedatastudent.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          const payload = action.payload;
          console.log(payload);
          const studentindex = state.studentarray.findIndex(
            (student) => student.id === payload.id,
          );
          if (studentindex !== -1) {
            state.studentarray[studentindex] = payload;
          }
        },
      )
      .addCase(updatedatastudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update student";
      });
  },
});

export default studentslice.reducer;
