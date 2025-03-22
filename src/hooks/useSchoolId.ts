import { useState, useEffect } from "react";

// Custom hook to manage schoolId
export const useSchoolId = () => {
  const [schoolId, setSchoolId] = useState<string | null>(null);

  useEffect(() => {
    const storedSchoolId = localStorage.getItem("schoolId");
    if (storedSchoolId) {
      setSchoolId(storedSchoolId);
    }
  }, []);

  const updateSchoolId = (id: string) => {
    localStorage.setItem("schoolId", id);
    setSchoolId(id);
  };

  return { schoolId, updateSchoolId };
};
