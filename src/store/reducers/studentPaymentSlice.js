import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { db } from "../firebase";
export const fetchstudentPayement = createAsyncThunk(
  "student/fetchPayement",
  (userDocId) => {
    return db
      .collection("STUDENTS")
      .doc(userDocId)
      .collection("PAYMENTS")
      .onSnapshot((snapshot) => {
        if (snapshot.size) {
          var feeArr = [];
          snapshot.forEach((doc) => {
            // const dataMod = {
            //   id: doc.data().payement_id,
            // };
            feeArr.push(doc.data());
          });
        }
      });
  }
);
const studentPaymentslice = createSlice({
  name: "studentPayment",
  initialState: {
    studentPaymentArray: [],
    loading: true,
    error: null,
  },
  extraReducers: {
    [fetchstudentPayement.pending]: (state) => {
      state.loading = true;
    },
    [fetchstudentPayement.fulfilled]: (state, action) => {
      state.loading = false;
      state.studentPaymentArray = action.payload;
    },
    [fetchstudentPayement.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
  },
});
export default studentPaymentslice.reducer;
