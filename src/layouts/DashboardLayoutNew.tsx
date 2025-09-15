import { Box } from "@mui/material";
import Footer from "components/Footer/Footer";
import Navbar from "components/Navbar/Navbar";
import SidebarNew from "components/Sidebar/SidebarNew";
import { useSidebar } from "context/SidebarContext";
import { Outlet } from "react-router-dom";

function DashboardLayoutNew() {
    const { isMini } = useSidebar();
    return (
        <Box sx={{ display: "flex" }}>
            {/* Sidebar */}
            <SidebarNew isMini={isMini} />

            {/* Main content area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Top Navbar */}
                <Navbar />

                {/* Page Content */}

                <Box sx={{ flexGrow: 1, p: 3 }}>
                    <Outlet />
                </Box>

                {/* Footer always at bottom */}
                <Box sx={{ mt: "auto" }}>
                    <Footer />
                </Box>
            </Box>
        </Box>
    );
}

export default DashboardLayoutNew;
