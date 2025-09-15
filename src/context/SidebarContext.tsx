// context/SidebarContext.tsx
import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
  isMini: boolean;
  toggleSidebar: () => void;
  setMini: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMini, setIsMini] = useState(false);

  const toggleSidebar = () => setIsMini((prev) => !prev);
  const setMini = (value: boolean) => setIsMini(value);

  return (
    <SidebarContext.Provider value={{ isMini, toggleSidebar, setMini }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
};
