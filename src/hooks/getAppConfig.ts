export const getAppConfig = (): any | null => {
    const schoolId = localStorage.getItem("schoolId");
    if (!schoolId) return null;
  
    const storedConfig = localStorage.getItem(`app_config_${schoolId}`);
    if (storedConfig) {
      try {
        return JSON.parse(storedConfig);
      } catch (error) {
        console.error("Error parsing app config:", error);
      }
    }
  
    return null;
  };