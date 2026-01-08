import { createContext, useContext, useState } from "react";

interface NavbarContextProps {
    session: string;
    setSession: (session: string) => void;
}

const NavbarContext = createContext<NavbarContextProps | undefined>(undefined);

const getAcademicSession = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Jan = 1

    // April (4) to December (12)
    if (month >= 4) {
        const nextYearShort = (year + 1).toString().slice(-2);
        return `${year}-${nextYearShort}`;
    }

    // January (1) to March (3)
    const prevYear = year - 1;
    const currentYearShort = year.toString().slice(-2);
    return `${prevYear}-${currentYearShort}`;
};

export const NavbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<string>("");


    if (!session) {
        setSession(getAcademicSession());
    }

    return (
        <NavbarContext.Provider value={{ session, setSession }}>
            {children}
        </NavbarContext.Provider>
    );
};

export const useNavbar = (): NavbarContextProps => {
    const context = useContext(NavbarContext);
    if (!context) {
        throw new Error("useNavbar must be used within a NavbarProvider");
    }
    return context;
}