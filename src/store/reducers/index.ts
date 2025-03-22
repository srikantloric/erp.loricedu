import { combineReducers } from "@reduxjs/toolkit";
import dashboardSlice from './dashboardSlice'
import facultiesSlice from './facultiesSlice'
import studentslice from './studentSlice'

const reducers = combineReducers({
    faculties: facultiesSlice,
    dashboard: dashboardSlice,
    students: studentslice
})

export default reducers;