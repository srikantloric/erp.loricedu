import { useContext, } from "react";
import "./Sidebar.scss";
import { routesConfig } from "../Utils/RoutesConfig";
import SideBarContext from "../../context/SidebarContext";
import { motion } from "framer-motion";
import SIdebarMenuItem from "./SIdebarMenuItem";
import { getAppConfig } from "hooks/getAppConfig";




function Sidebar() {
  const status = useContext(SideBarContext);
  const appConfig = getAppConfig()


  const Sidebar_Animation = {
    open: {
      width: "16rem",
      transition: {
        damping: 50,
      },
    },
    closed: {
      width: "0rem",
      transition: {
        damping: 50,
      },
    },
  };


  return (

    <motion.div
      variants={Sidebar_Animation}
      animate={status.isActive ? "open" : "closed"}
      className="sidebar-container"
    >
      <div className="sidebar">
        <div className="sidebar-logo">
          <img src={appConfig.schoolSidebarLogo} alt="school logo" />
        </div>
        <div className="sidebar-menu">
          {routesConfig.map((menus, index) => {
            if (menus.isHeader) {
              return <p key={index}>{menus.title}</p>;
            } else {
              return (

                <SIdebarMenuItem key={index} menus={menus} />

              );
            }
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default Sidebar;
