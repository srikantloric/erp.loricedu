import { useContext } from "react";
import { motion } from "framer-motion";
import SideBarContext from "../../context/SidebarContext";
import { useMediaQuery, useTheme } from "@mui/material";

function PageContainer({ children }) {
  const status = useContext(SideBarContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const Sidebar_Animation = {
    open: {
      marginLeft: `${!isMobile ? "80px" : "0px"}`,
      width: "100%",
      transition: {
        damping: 50,
      },
    },
    closed: {
      marginLeft: "260px",
      width: "100%",
      transition: {
        damping: 50,
      },
    },
  };
  return (
    <motion.div
      variants={Sidebar_Animation}
      initial={false}
      animate={status.isActive ? "closed" : "open"}
      className="page-container"
    >
      {children}
    </motion.div>
  );
}

export default PageContainer;
