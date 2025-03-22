import { useContext } from "react";
import { motion } from "framer-motion";
import SideBarContext from "../../context/SidebarContext";

function PageContainer({ children }) {
  const status = useContext(SideBarContext);
  const Sidebar_Animation = {
    open: {
      marginLeft: "0px",
      width:"100%",
      transition: {
        damping: 50,
      },
    },
    closed: {
      marginLeft: "260px",
      width:"100%",
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
