import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { doc, getDoc, Timestamp } from "firebase/firestore";
// import { db } from "../../firebase"
import { getFirestoreInstance } from "context/firebaseUtility";



type DashboardAnalyticsType = {
  lastUpdated: Timestamp,
  totalFeeCollection: {
    thisMonth: number,
    thisYear: number,
    today: number
  }
  ,
  totalStudents: number,
  totalMaleStudent: number,
  totalFemaleStudent: number,
}

// Define the shape of the state
interface DashboardAnalyticsState {
  dashboardAnalytics: DashboardAnalyticsType;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Create an async thunk for fetching total students
export const fetchTotalStudents = createAsyncThunk<DashboardAnalyticsType, void, { rejectValue: string }>(
  "analytics/getDashboardAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      // Initialize Firebase for the school
      const db = await getFirestoreInstance();

      // Get a reference to the document
      const dashboardAnalyticsRef = doc(db, "ANALYTICS", "dashboardAnalytics");

      // Fetch the document
      const response = await getDoc(dashboardAnalyticsRef);

      if (response.exists()) {
        const dashboardAnalyticsData = response.data() as DashboardAnalyticsType;
        console.log("Dashboard Analytics:", dashboardAnalyticsData);
        return dashboardAnalyticsData;
      } else {
        throw new Error("No such document!");
      }
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

// Create the slice
const dashboardAnalyticsSlice = createSlice({
  name: "studentCount",
  initialState: {
    dashboardAnalytics: {},
    status: "idle",
    error: null,
  } as DashboardAnalyticsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTotalStudents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTotalStudents.fulfilled, (state, action: PayloadAction<DashboardAnalyticsType>) => {
        state.status = "succeeded";
        state.dashboardAnalytics = action.payload;
      })
      .addCase(fetchTotalStudents.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.status = "failed";
        state.error = action.payload || "Something went wrong";
      });
  },
});

// Export the reducer
export default dashboardAnalyticsSlice.reducer;
