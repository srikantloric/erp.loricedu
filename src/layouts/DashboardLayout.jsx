import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import LSContainer from "../components/Utils/LSContainer";
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
    <LSContainer>
      <SearchDialog/>
      <Sidebar />
      <Outlet/>
    </LSContainer>
  );
}

export default DashboardLayout;
