import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";
import { FacultyType } from "types/facuities";
import { query, where } from "firebase/firestore";
import { getFirestoreInstance } from "context/firebaseUtility";

interface FacultyState {
  teacherArray: FacultyType[];
  loading: boolean;
  error: string | null;
}

// FETCH
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
    const teachers: FacultyType[] = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      facultyId: doc.id,
    })) as FacultyType[];
    return teachers;
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
      });
  },
});

export default facultiesSlice.reducer;
