import { IconChevronDown, IconPoint } from "@tabler/icons-react";
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import "./Sidebar.scss";

function SIdebarMenuItem({ menus }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <NavLink
        to={menus.to}
        className={
          open ? "menu-items open-mainmenu" : "menu-items close-mainmenu"
        }
        onClick={()=>setOpen(!open)}
      >
        <div className="icon-plus-title" >
          <menus.icon fontSize="small" />
          <p>{menus.title}</p>
        </div>
        <div className="dropdown">
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
