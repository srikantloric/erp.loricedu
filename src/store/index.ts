import { configureStore } from "@reduxjs/toolkit";
import reducers from "./reducers";
import { TypedUseSelectorHook,useDispatch as useAppDispatch,useSelector as useAppSelector } from "react-redux";
const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
const { dispatch } = store;
const useDispatch = () => useAppDispatch<AppDispatch>();
const useSelector: TypedUseSelectorHook<RootState> = useAppSelector;
export { store, dispatch, useSelector, useDispatch };