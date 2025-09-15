import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { useSearchDialog } from "context/SearchDialogContext";
import { useEffect } from "react";
import SearchDialog from "components/Dialog/SearchDialog";


function DashboardLayout() {

  const { openDialog } = useSearchDialog();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        openDialog();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDialog]);
  return (
    <>
      <SearchDialog />
      <Sidebar />
      <Outlet />
    </>
  );
}

export default DashboardLayout;
