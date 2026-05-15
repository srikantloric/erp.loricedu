import { useEffect, useRef } from "react";

import { useNavbar } from "context/NavbarContext";
import { useSnackbar } from "notistack";
import { invalidateStudentCache, fetchstudent } from "store/reducers/studentSlice";
import { RootState, useDispatch, useSelector } from "store";

export const useInitializeStudents = () => {
  const dispatch = useDispatch();
  const { session } = useNavbar();
  const { enqueueSnackbar } = useSnackbar();
  const lastCacheToastSession = useRef<string | null>(null);
  const lastServerToastSession = useRef<string | null>(null);
  const inFlightFetchSession = useRef<string | null>(null);

  const studentarray = useSelector(
    (state: RootState) => state.students.studentarray,
  );
  const loading = useSelector((state: RootState) => state.students.loading);
  const error = useSelector((state: RootState) => state.students.error);
  const loadedSessionId = useSelector(
    (state: RootState) => state.students.loadedSessionId,
  );

  useEffect(() => {
    if (!session) {
      return;
    }

    const cacheSessionMatches = loadedSessionId === session;
    const hasCachedStudents = studentarray.length > 0;

    if (cacheSessionMatches && hasCachedStudents) {
      if (lastCacheToastSession.current !== session) {
        enqueueSnackbar(`Students loaded from cache for ${session}`, {
          variant: "info",
        });
        lastCacheToastSession.current = session;
      }
      return;
    }

    if (!cacheSessionMatches && loading) {
      return;
    }

    if (!cacheSessionMatches && (hasCachedStudents || error)) {
      dispatch(invalidateStudentCache());
    }

    if (loading) {
      return;
    }

    if (error && cacheSessionMatches) {
      return;
    }

    if (inFlightFetchSession.current === session) {
      return;
    }

    inFlightFetchSession.current = session;

    dispatch(fetchstudent(session))
      .unwrap()
      .then(() => {
        if (lastServerToastSession.current !== session) {
          enqueueSnackbar(`Students loaded from server for ${session}`, {
            variant: "success",
          });
          lastServerToastSession.current = session;
        }
      })
      .catch((fetchError) => {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load students from server";

        enqueueSnackbar(message, { variant: "error" });
      })
      .finally(() => {
        inFlightFetchSession.current = null;
      });
  }, [
    dispatch,
    enqueueSnackbar,
    error,
    loadedSessionId,
    loading,
    session,
    studentarray.length,
  ]);

  return {
    loading,
    hasLoaded: loadedSessionId === session && studentarray.length > 0,
  };
};