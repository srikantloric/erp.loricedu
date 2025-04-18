import { useContext } from "react";
import "./Sidebar.scss";
import { routesConfig } from "../Utils/RoutesConfig";
import SideBarContext from "../../context/SidebarContext";
import { motion } from "framer-motion";
import SIdebarMenuItem from "./SIdebarMenuItem";
import { getAppConfig } from "hooks/getAppConfig";

function Sidebar() {
  const status = useContext(SideBarContext);
  const appConfig = getAppConfig();

  const Sidebar_Animation = {
    open: {
      width: "16rem",
      transition: {
        damping: 50,
      },
    },
    closed: {
      width: "4.8rem",
      transition: {
        damping: 50,
      },
    },
  };

  return (
    <motion.div
      variants={Sidebar_Animation}
      animate={status.isActive ? "open" : "closed"}
      className={
        status.isActive
          ? "sidebar-container"
          : "sidebar-container sidebar-container-hide"
      }
    >
      <div
        className={status.isActive ? "sidebar" : "sidebar sidebar-a"}
        style={
          status.isActive
            ? {}
            : {
                paddingLeft: 1,
                paddingRight: 1,
              }
        }
      >
        <div className="sidebar-logo">
          <img
            src={
              status.isActive
                ? appConfig.schoolSidebarLogo
                : appConfig.schoolLogo
            }
            alt="school logo"
          />
        </div>
        <div
          className="sidebar-menu"
          style={
            status.isActive
              ? {}
              : {
                  padding: "10px",
                }
          }
        >
          {routesConfig.map((menus, index) => {
            if (menus.isHeader) {
              return (
                <p
                  style={
                    status.isActive
                      ? {}
                      : {
                          fontSize: "8px",
                          paddingLeft: "0px",
                          textAlign: "center",
                        }
                  }
                  key={index}
                >
                  {menus.title}
                </p>
              );
            } else {
              return <SIdebarMenuItem key={index} menus={menus} />;
            }
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default Sidebar;
