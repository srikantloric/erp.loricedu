import React, { createContext, useContext, useState, ReactNode } from "react";

interface SearchDialogContextProps {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

const SearchDialogContext = createContext<SearchDialogContextProps | undefined>(
  undefined
);

export const SearchDialogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);



  return (
    <SearchDialogContext.Provider value={{ isOpen, openDialog, closeDialog }}>
      {children}
    </SearchDialogContext.Provider>
  );
};

export const useSearchDialog = () => {
  const context = useContext(SearchDialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};
