import { IconChevronDown, IconPoint } from "@tabler/icons-react";
import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import "./Sidebar.scss";
import SideBarContext from "context/SidebarContext";
import { Tooltip } from "@mui/material";

function SIdebarMenuItem({ menus }) {
  const [open, setOpen] = useState(false);
  const status = useContext(SideBarContext);

  useEffect(() => {
    // Close dropdown when sidebar is collapsed
    if (!status.isActive) {
      setOpen(false);
    }
  }, [status.isActive]);

  const handleClick = () => {
    setOpen(!open);
    if (menus.childrens && !status.isActive) {
      status.toggle();
    }
  };

  return (
    <>
      <Tooltip title={menus.title} placement="right" arrow>
        <NavLink
          to={menus.to}
          className={
            open ? "menu-items open-mainmenu" : "menu-items close-mainmenu"
          }
          onClick={handleClick}
        >
          <div className="icon-plus-title">
            <menus.icon fontSize="small" />
            {status.isActive ? <p>{menus.title}</p> : <p> </p>}
          </div>
          <div
            className="dropdown"
            style={status.isActive ? {} : { display: "none" }}
          >
            {menus.childrens ? (
              <IconChevronDown
                className="toggle-btn"
                onClick={() => setOpen(!open)}
                size={20}
              />
            ) : (
              ""
            )}
          </div>
        </NavLink>
      </Tooltip>
      <motion.div
        className={open ? "sub-menu open-submenu" : "sub-menu close-submenu"}
      >
        {menus.childrens &&
          menus.childrens.map((item, index) => {
            return (
              <Link key={index} to={item.to} className={`menu-items-submenu`}>
                <div className="icon-plus-title">
                  <IconPoint className="icon-menu" fontSize="small" />
                  <p>{item.title}</p>
                </div>
              </Link>
            );
          })}
      </motion.div>
    </>
  );
}

export default SIdebarMenuItem;
