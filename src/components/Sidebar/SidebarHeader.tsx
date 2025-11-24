import { motion } from "framer-motion";
import { getAppConfig } from "hooks/getAppConfig";
import { Box } from "@mui/material";

interface SidebarHeaderProps {
  isMini: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isMini }) => {
  const config = getAppConfig() || {};

  const { schoolLogo, schoolSidebarLogo } = config;


  return (
    <Box display="flex" justifyContent="center" alignItems="center" overflow="hidden">
      <motion.img
        key="sidebar-logo"
        src={isMini ? schoolLogo : schoolSidebarLogo}
        alt="school logo"
        style={{
          width: "90%",
          padding: "5px 10px",
          // borderBottom: "1px solid var(--bs-gray-400)",
        }}
        initial={false} // prevent animation on first load
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        whileHover={{ scale: 1.05 }}
      />
    </Box>
  );
};

export default SidebarHeader;
