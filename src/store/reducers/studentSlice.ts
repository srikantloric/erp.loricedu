import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { db, storageRef } from "../../firebase";


import FileResizer from "react-image-file-resizer";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { StudentDetailsType } from "types/student";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { getFirestoreInstance } from "context/firebaseUtility";

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
export const addstudent = createAsyncThunk<StudentDetailsType, { studentData: StudentDetailsType }, { rejectValue: string }>(
  "add-students/addstudent",
  async ({ studentData }, { rejectWithValue }) => {
    console.log("From Student Slice", studentData);
    try {
      // Fetch previous admission count from Firestore
      const prevAdmissionDoc = await getDoc(doc(db, "ADMISSION_TRACKER", "admission_number_tracker"));

      if (!prevAdmissionDoc.exists()) {
        throw new Error("Error fetching previous admission number.");
      }

      const prevAdmissionNumber = prevAdmissionDoc.data()?.total_count || 0;
      const formattedCountValue = String(prevAdmissionNumber + 1).padStart(5, "0");

      // Extract password from DOB and generate email
      const userPass = studentData.dob.split("-").reverse().join(""); // Assuming dob format is YYYY-MM-DD
      const userEmail = `apx2025${formattedCountValue}@gmail.com`;

      const docId = generateFirebaseUID();

      studentData = {
        ...studentData,
        student_id: userEmail,
        student_pass: userPass,
        id: docId,
        admission_no: `APX2025${formattedCountValue}`,
        created_at: serverTimestamp(),
      };

      const studentRef = doc(db, "STUDENTS", docId);
      const admissionTrackerRef = doc(db, "ADMISSION_TRACKER", "admission_number_tracker");

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
      return rejectWithValue(error.message || "An error occurred while adding the student.");
    }
  }
);


//FETCH STUDENT
export const fetchstudent = createAsyncThunk("student/fetchstudent", async () => {
  console.log("fetch data query triggered");
  const db = await getFirestoreInstance()
  // Create a reference to the STUDENTS collection
  const studentsRef = collection(db, "STUDENTS");

  // Create a query with orderBy
  const q = query(studentsRef, orderBy("created_at", "desc"));

  // Fetch the documents based on the query
  const snap = await getDocs(q);

  // Map over the snapshot and return the students data
  const students = snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  return students;
});

//DELETE STUDENT
export const deleteStudent = createAsyncThunk(
  "student/deleteStudent",
  async (id: string, { rejectWithValue }) => {
    console.log("deleting Student:", id);

    try {
      // Create a reference to the document
      const studentRef = doc(db, "STUDENTS", id);

      // Delete the document
      await deleteDoc(studentRef);
      return id;
    } catch (error: any) {
      console.error("Error removing document: ", error);
      return rejectWithValue(error.message || "Error deleting student");
    }
  }
);

//UPDATE STUDENT
export const updatedatastudent = createAsyncThunk(
  "student/updatestudent",
  async ({ studentdata, imageupdate }: { studentdata: StudentDetailsType, imageupdate: File | null }, { rejectWithValue }) => {
    let studentData = { ...studentdata };
    try {
      studentData["updated_at"] = serverTimestamp();
      if (imageupdate) {
        console.log("updating new image..");

        const fileRef = ref(storageRef, `profileImages/${studentData.id}/${studentData.email}`);

        const resizedImage = await resizeFile(imageupdate);
        const uploadTask = await uploadString(fileRef, "" + resizedImage, "data_url");

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
  }
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
      .addCase(addstudent.fulfilled, (state, action: PayloadAction<StudentDetailsType>) => {
        state.loading = false;
        console.log("addstudent payload : ", action.payload);
        state.studentarray.push(action.payload);
      })
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
      .addCase(deleteStudent.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.studentarray = state.studentarray.filter(
          (student) => student.id !== action.payload
        );
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete student";
      })

      // Update student
      .addCase(updatedatastudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatedatastudent.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const payload = action.payload;
        console.log(payload);
        const studentindex = state.studentarray.findIndex(
          (student) => student.id === payload.id
        );
        if (studentindex !== -1) {
          state.studentarray[studentindex] = payload;
          console.log("state updated");
        }
      })
      .addCase(updatedatastudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update student";
      });
  },
});

export default studentslice.reducer;
