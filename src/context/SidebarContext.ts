import { createContext } from "react";

interface SidebarContextType {
    isActive: boolean | null;
    toggle: () => void;
    setSidebarOpen: (status: boolean) => void;
}

const SideBarContext = createContext<SidebarContextType>({
    isActive: null,
    toggle: () => { },
    setSidebarOpen: (status: boolean) => { }
});

export default SideBarContext;