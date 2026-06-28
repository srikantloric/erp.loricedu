import { configureStore } from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useDispatch as useAppDispatch,
  useSelector as useAppSelector,
} from "react-redux";
import {
  persistStore,
  // persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
// import storage from "redux-persist/lib/storage";

// Persist config for only students slice
import { combineReducers } from "@reduxjs/toolkit";
import studentslice from "./reducers/studentSlice";
// Recreate root reducer to allow persistReducer to work
import dashboardSlice from "./reducers/dashboardSlice";
import facultiesSlice from "./reducers/facultiesSlice";

// const persistConfig = {
//   key: "root",
//   storage,
//   whitelist: ["students"], // only persist students slice
// };


const rootReducer = combineReducers({
  faculties: facultiesSlice,
  dashboard: dashboardSlice,
  students: studentslice,
});

// const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
const { dispatch } = store;
const useDispatch = () => useAppDispatch<AppDispatch>();
const useSelector: TypedUseSelectorHook<RootState> = useAppSelector;
export { store, persistor, dispatch, useSelector, useDispatch };
