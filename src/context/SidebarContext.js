import { createContext } from "react";

const SideBarContext = createContext({ isActive: null, toggle: () => { },setSidebarOpen:(status)=>{} })
export default SideBarContext;