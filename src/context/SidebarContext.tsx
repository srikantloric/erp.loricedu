import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
  isMini: boolean; // desktop collapsed state
  isMobileOpen: boolean; // mobile sidebar visibility
  toggleSidebar: () => void; // toggles mini sidebar for desktop
  toggleMobileSidebar: () => void; // toggles mobile sidebar
  setMini: (value: boolean) => void;
  setMobileOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMini, setIsMini] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // toggle desktop sidebar collapse
  const toggleSidebar = () => setIsMini((prev) => !prev);

  // toggle mobile sidebar visibility
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        isMini,
        isMobileOpen,
        toggleSidebar,
        toggleMobileSidebar,
        setMini: setIsMini,
        setMobileOpen: setIsMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
};
