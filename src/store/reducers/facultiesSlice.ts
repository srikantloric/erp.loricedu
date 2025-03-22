import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { FacultyType } from "types/facuities";

const db = getFirestore();

interface FacultyState {
  teacherArray: FacultyType[];
  loading: boolean;
  error: string | null;
}

// FETCH
export const fetchTeacher = createAsyncThunk<FacultyType[], void>(
  "teachers/fetchTeacher",
  async () => {
    const querySnapshot = await getDocs(collection(db, "FACULTIES"));
    const teachers: FacultyType[] = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as FacultyType[];

    sessionStorage.setItem("faculties_list", JSON.stringify(teachers));
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
