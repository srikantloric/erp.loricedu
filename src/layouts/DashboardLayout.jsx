// import { Outlet } from "react-router-dom";
// import Sidebar from "../components/Sidebar/Sidebar";
// import { useSearchDialog } from "context/SearchDialogContext";
// import { useEffect } from "react";
// import SearchDialog from "components/Dialog/SearchDialog";
// import PlanExpiredDialog from "components/Dialog/PlanExpiredDialog";
// import { useInitializeStudents } from "hooks/useInitializeStudents";


// function DashboardLayout() {

//   const { openDialog } = useSearchDialog();

//   // Initialize student data once when dashboard loads
//   // useInitializeStudents();

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.ctrlKey && event.key === "k") {
//         event.preventDefault();
//         openDialog();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [openDialog]);
//   return (
//     <>
//       <SearchDialog />
      
//       <Sidebar />
//       <PlanExpiredDialog/>
//       <Outlet />
//     </>
//   );
// }

// export default DashboardLayout;

import React from 'react'

function DashboardLayout() {
  return (
    <div>DashboardLayout</div>
  )
}

export default DashboardLayout