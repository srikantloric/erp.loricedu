import { createContext, useContext, useState } from "react";

interface NavbarContextProps {
    session: string;
    setSession: (session: string) => void;
}

const NavbarContext = createContext<NavbarContextProps | undefined>(undefined);


export const NavbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<string>("");

const currentYear = new Date().getFullYear();
const nextYearShort = (currentYear + 1).toString().slice(-2);
const defaultSession = `${currentYear}-${nextYearShort}`;
if (!session) {
    setSession(defaultSession);
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