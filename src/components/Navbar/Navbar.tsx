import React, { useContext, useState, useEffect } from "react";
import "./Navbar.scss";
import {
  Avatar,
  Badge,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SideBarContext from "../../context/SidebarContext";
import {
  IconBell,
  IconMessage2,
  IconMoon,
  IconSearch,
} from "@tabler/icons-react";
import { Circle, Logout, Settings } from "@mui/icons-material";
import { auth } from "../../firebase";
import { useSearchDialog } from "context/SearchDialogContext";
import { Chip } from "@mui/joy";

function Navbar() {
  const [screenSize, setScreenSize] = useState(getCurrentDimension());
  const [anchorEl, setAnchorEl] = React.useState(null);
  const environment = process.env.REACT_APP_MODE || process.env.NODE_ENV;

  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  /////

  const { openDialog } = useSearchDialog();

  const notificationsLabel = (count: number) => {
    if (count === 0) {
      return "no notifications";
    }
    if (count > 99) {
      return "more than 99 notifications";
    }
    return `${count} notifications`;
  };

  const status = useContext(SideBarContext);
  const handleOnClick = () => {
    status.toggle();
  };

  function getCurrentDimension() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  const handleLogout = () => {
    console.log("called logout");
    auth.signOut();
  };

  useEffect(() => {
    const updateDimension = () => {
      setScreenSize(getCurrentDimension());
      if (getCurrentDimension().width < 1000) {
        status.setSidebarOpen(false);
      } else {
        status.setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", updateDimension);

    return () => {
      window.removeEventListener("resize", updateDimension);
    };
  }, [screenSize, status]);


  return (
    <div className="navbar-container">
      <div className="navbar-wrapper">
        <div className="navbar-leftsection">
          <Tooltip title="Collapse">
            <IconButton onClick={handleOnClick}>
              <MenuIcon />
            </IconButton>
          </Tooltip>
          {screenSize.width > 768 && (
            <div className="search-box" onClick={() => openDialog()}>
              <IconSearch className="search-iconn" size={28} />
              <span>Search..</span>
              <div>Ctrl+K</div>
            </div>
          )}
        </div>
        <div className="navbar-rightsection">
          {screenSize.width > 768 && (
            <Chip
              color="primary"
              sx={{ mr: 2, pl: "10px", pr: "10px" }}
              startDecorator={<Circle sx={{ fontSize: "12px" }} color="success" />}
            >
              {environment}
            </Chip>
          )}

          {screenSize.width > 768 && (
            <>
              <div className="rounded-bg">
                <Tooltip title="Night Mode">
                  <IconButton>
                    <IconMoon size={22} />
                  </IconButton>
                </Tooltip>
              </div>
              <div className="rounded-bg">
                <Tooltip title="Message">
                  <IconButton aria-label={notificationsLabel(100)}>
                    <Badge badgeContent={1} color="success">
                      <IconBell size={22} />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </div>
              <div className="rounded-bg">
                <Tooltip title="Message">
                  <IconButton aria-label={notificationsLabel(100)}>
                    <Badge badgeContent={0} color="primary">
                      <IconMessage2 size={22} />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </div>
            </>
          )}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2, backgroundColor: "var(--bs-gray-300)" }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: "var(--bs-orange)",
                }}
              >
                A
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleClose}>
              <Avatar /> admin@apxschool.org
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <IconButton onClick={handleLogout}>
                  <Logout fontSize="small" />
                </IconButton>
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
