import { useEffect } from "react";

import { useNavbar } from "context/NavbarContext";
import { invalidateStudentCache, fetchstudent } from "store/reducers/studentSlice";
import { RootState, useDispatch, useSelector } from "store";

export const useInitializeStudents = () => {
  const dispatch = useDispatch();
  const { session } = useNavbar();

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

    dispatch(fetchstudent(session));
  }, [dispatch, error, loadedSessionId, loading, session, studentarray.length]);

  return {
    loading,
    hasLoaded: loadedSessionId === session && studentarray.length > 0,
  };
};