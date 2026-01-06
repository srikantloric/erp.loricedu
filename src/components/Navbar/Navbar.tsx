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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  IconAccessPoint,
  IconBell,
  IconSearch,
} from "@tabler/icons-react";
import { Circle, Fullscreen, Logout, Settings } from "@mui/icons-material";
import { auth } from "../../firebase";
import { useSearchDialog } from "context/SearchDialogContext";
import { Chip, Option, Select, Stack, Typography } from "@mui/joy";
import { useNavbar } from "context/NavbarContext";
import { useAuth } from "context/AuthContext";
import { useState } from "react";
import { useSidebar } from "context/SidebarContext";
import { toggleFullScreen } from "pages/fullscreen";

type NavbarProps = {
  setAttenzyFeed: (open: boolean) => void;
};

const Navbar: React.FC<NavbarProps> = ({ setAttenzyFeed }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = useState(null);
  const environment = process.env.REACT_APP_MODE || process.env.NODE_ENV;
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();

  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  /////

  const { openDialog } = useSearchDialog();

  const { session, setSession } = useNavbar();

  const notificationsLabel = (count: number) => {
    if (count === 0) {
      return "no notifications";
    }
    if (count > 99) {
      return "more than 99 notifications";
    }
    return `${count} notifications`;
  };

  //auth context
  const { currentUser, displayName, profile } = useAuth()

  const handleLogout = () => {
    console.log("called logout");
    auth.signOut();
  };


  return (
    <div className="navbar-container">
      <div className="navbar-wrapper">
        <div className="navbar-leftsection">
          <Tooltip title="Collapse">
            <IconButton onClick={isMobile ? toggleMobileSidebar : toggleSidebar}>
              <MenuIcon />
            </IconButton>
          </Tooltip>
          {!isMobile && (
            <div className="search-box" onClick={() => openDialog()}>
              <IconSearch className="search-iconn" size={28} />
              <span>Search..</span>
              <div>Ctrl+K</div>
            </div>
          )}
        </div>

        <div className="navbar-rightsection">
          {!isMobile && (
            <Chip
              color="primary"
              sx={{ mr: 2, pl: "10px", pr: "10px" }}
              startDecorator={<Circle sx={{ fontSize: "12px" }} color="success" />}
            >
              {environment}
            </Chip>
          )}

          <Select sx={{ mr: 2 }} size="sm" value={session} onChange={(e, val) => setSession(val!)} variant="soft">
            <Option value="2025-26">2025-26</Option>
            <Option value="2024-25">2024-25</Option>
          </Select>

          {!isMobile && (
            <>
              <div className="rounded-bg">
                <Tooltip title="Attenzy Device">
                  <IconButton onClick={() => setAttenzyFeed(true)}>
                    <IconAccessPoint size={22} />
                  </IconButton>
                </Tooltip>
              </div>
              <div className="rounded-bg">
                <Tooltip title="Notifications">
                  <IconButton aria-label={notificationsLabel(100)}>
                    <Badge badgeContent={1} color="success">
                      <IconBell size={22} />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </div>
              <div className="rounded-bg">
                <Tooltip title="FullScreen">
                  <IconButton onClick={toggleFullScreen}>
                    <Badge badgeContent={0} color="primary">
                      <Fullscreen  />
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
                src={profile!}
                alt={displayName ? displayName.charAt(0).toUpperCase() : "U"}
              >

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
              <Avatar src={profile!} alt={displayName ? displayName.charAt(0).toUpperCase() : "U"} />
              <Stack display={"flex"} direction={"column"}>
                <Typography level="title-md">
                  {displayName}
                </Typography>
                <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                  {currentUser?.email}
                </Typography>
              </Stack>

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
