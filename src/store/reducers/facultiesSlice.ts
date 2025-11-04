import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addDoc, collection, getDocs, Timestamp } from "firebase/firestore";
import { FacultyType } from "types/facuities";
import { query, where } from "firebase/firestore";
import { getFirestoreInstance } from "context/firebaseUtility";
import { enqueueSnackbar } from "notistack";

interface FacultyState {
  teacherArray: FacultyType[];
  loading: boolean;
  error: string | null;
}

// fetching faculty
export const fetchTeacher = createAsyncThunk<FacultyType[], void>(
  "teachers/fetchTeacher",
  async () => {

    const db = await getFirestoreInstance()
    console.log("Fetching teachers...");
    const facultyQuery = query(
      collection(db, "STUDENTS"),
      where("isFaculty", "==", true),
      where("isActive", "==", true)
    );
    const querySnapshot = await getDocs(facultyQuery);
    const teachers: FacultyType[] = querySnapshot.docs.map((doc: any) => ({
      ...doc.data(),
      id: doc.id
    })) as FacultyType[];
    return teachers;
  }
);

//  adding faculty
export const addFaculty = createAsyncThunk<FacultyType, Partial<FacultyType>>(
  "teachers/addFaculty",
  async (facultyData) => {
    const db = await getFirestoreInstance();
    console.log("Adding new faculty...");

    const facultyToAdd = {
      ...facultyData,
      isFaculty: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    try {

      const docRef = await addDoc(collection(db, "STUDENTS"), facultyToAdd);
      console.log("Faculty added with ID: ", docRef.id);
      enqueueSnackbar("Faculty added successfully", { variant: "success" });
      return {
        ...facultyData,
        facultyId: docRef.id,
      } as FacultyType;
      
    } catch (error) {
      console.error("Error adding faculty: ", error);
      throw error;
    }

  }
);

const initialState: FacultyState = {
  teacherArray: [],
  loading: false,
  error: null,
};

const facultiesSlice = createSlice({
  name: "teachers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacher.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeacher.fulfilled, (state, action: PayloadAction<FacultyType[]>) => {
        state.loading = false;
        state.teacherArray = action.payload;
      })
      .addCase(fetchTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(addFaculty.pending, (state) => {
        state.loading = true;
      }).addCase(addFaculty.fulfilled, (state, action: PayloadAction<FacultyType>) => {
        state.loading = false;
        state.teacherArray.push(action.payload);
      }).addCase(addFaculty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
  },
});

export default facultiesSlice.reducer;
