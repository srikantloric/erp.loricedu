import { useContext, useEffect, useState } from "react";
import "./Sidebar.scss";
import { routesConfig } from "../Utils/RoutesConfig";
import SideBarContext from "../../context/SidebarContext";
import { motion } from "framer-motion";
import SIdebarMenuItem from "./SIdebarMenuItem";
import { useFirebase } from "context/firebaseContext";
import { doc, getDoc } from "firebase/firestore";



function Sidebar() {
  const status = useContext(SideBarContext);
  const { db } = useFirebase()
  const [sidebarLogo, setSidebarLogo] = useState("");

  useEffect(() => {

    const fetchData = async () => {
      const docRef = doc(db, "CONFIG", "APP_CONFIG");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data()
        console.log(data)
        setSidebarLogo(data.sidebarLogo);

      }
    }
    fetchData()
  })



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
          <img src={sidebarLogo} alt="school logo" />
        </div>
        <div className="sidebar-menu">
          {routesConfig.map((menus, index) => {
            if (menus.isHeader) {
              return <p key={index}>{menus.title}</p>;
            } else {
              return (
                <>
                  <SIdebarMenuItem key={index} menus={menus} />
                </>
              );
            }
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default Sidebar;
