import { Box } from "@mui/material";
import AttenzyLiveFeed from "components/Attenzy/AttenzyLiveFeed";
import PlanExpiredDialog from "components/Dialog/PlanExpiredDialog";
import SearchDialog from "components/Dialog/SearchDialog";
import Footer from "components/Footer/Footer";
import Navbar from "components/Navbar/Navbar";
import SidebarNew from "components/Sidebar/SidebarNew";
// import { useInitializeStudents } from "hooks/useInitializeStudents";
import { useState } from "react";
import { Outlet } from "react-router-dom";

function DashboardLayoutNew() {
    const [showAttenzyFeed, setShowAttenzyFeed] = useState(false);
    // useInitializeStudents();

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <AttenzyLiveFeed
                    isOpen={showAttenzyFeed}
                    onClose={() => setShowAttenzyFeed(false)}
                    maxEntries={100}
                    bounds="parent"
                />
                {/* Sidebar */}
                <SidebarNew />

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
                    <Navbar setAttenzyFeed={setShowAttenzyFeed} />

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
            <SearchDialog />
            <PlanExpiredDialog />
        </>
    );
}

export default DashboardLayoutNew;
