import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { IconButton, Popper, Paper, List, ListItemButton, ListItemIcon, ListItemText, Box, Collapse, Drawer, ListSubheader, styled, useMediaQuery, useTheme, Tooltip } from "@mui/material";
import { menuItems } from "config/menuConfig";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarHeader from "./SidebarHeader";
import { useAuth } from "context/AuthContext";

const drawerWidth = 240;
const miniWidth = 87;

const StyledDrawer = styled(Drawer)<{ isMini: boolean }>(({ theme, isMini }) => ({
    width: isMini ? miniWidth : drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    "& .MuiDrawer-paper": {
        width: isMini ? miniWidth : drawerWidth,
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
        }),
    },
}));

interface SidebarProps {
    isMini: boolean;
}

const NavbarNew: React.FC<SidebarProps> = ({ isMini }) => {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();


    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);


    const [mobileOpen, setMobileOpen] = useState(false);
    const [hoveredMenu, setHoveredMenu] = useState<null | string>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const { permissions } = useAuth();

    const handleToggleSubMenu = (label: string) => {
        setOpenSubmenu(prev => (prev === label ? null : label));
    };

    // 🔑 Filter menu items based on permission object
    const filteredMenu = menuItems
        .filter((item) => {
            if (item.isHeader) return true; // keep headers
            if (item.permission && !permissions?.[item.permission]) {
                return false;
            }
            return true;
        })
        .map((item) => {
            if (item.subMenu) {
                const filteredSubMenu = item.subMenu.filter(
                    (sub) => !sub.permission || permissions?.[sub.permission]
                );
                return { ...item, subMenu: filteredSubMenu };
            }
            return item;
        })
        // hide parent if all submenus filtered out
        .filter((item) => !(item.subMenu && item.subMenu.length === 0));

    // 🔑 Hide headers with no children left
    const finalMenu = filteredMenu.filter(item => {
        if (!item.isHeader) return true;
        // keep only if some non-header has same group
        return filteredMenu.some(m => !m.isHeader && m.group === item.group);
    });

    const drawerContent = (
        <List
        >
            {finalMenu.map(item => {
                const hasActiveSubmenu = item.subMenu?.some(sub => location.pathname === sub.path);
                const isActive = location.pathname === item.path || hasActiveSubmenu;
                // usage in render
                const isSubMenuOpen = openSubmenu === item.label;
                if (item.isHeader) {
                    return (
                        <ListSubheader
                            key={item.label}
                            disableSticky
                            sx={{
                                typography: "overline",
                                color: "text.secondary",
                                fontWeight: 800,
                                pl: 2,
                                pt: 2,
                                pb: 1,
                                textAlign: isMini ? "center" : "left",
                                fontSize: isMini ? "0.5rem" : "0.75rem", // smaller in mini mode
                            }}
                        >
                            {item.label}
                        </ListSubheader>
                    );
                }

                return (
                    <div key={item.label}>
                        <Tooltip title={item.subMenu ? "" : item.label} placement="right">

                            <ListItemButton
                                sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    my: 0.8,
                                    display: "flex",
                                    justifyContent: "center",
                                    "&.Mui-selected": {
                                        backgroundColor: "#5D87FF",
                                        color: theme.palette.primary.contrastText,
                                        "& .MuiListItemIcon-root": {
                                            color: theme.palette.primary.contrastText,
                                        },
                                        "&:hover": { backgroundColor: "#466FE0" },
                                    },
                                    "& .MuiListItemIcon-root": { minWidth: 28 },
                                    "& .MuiSvgIcon-root": { fontSize: "18px" },
                                    "& .MuiListItemText-primary": { fontSize: "0.8125rem" },
                                }}
                                onClick={(e) => {
                                    if (item.subMenu) {
                                        if (isMini) {
                                            setHoveredMenu(item.label);
                                            setAnchorEl(e.currentTarget);
                                        } else {
                                            handleToggleSubMenu(item.label);
                                        }
                                    } else if (item.path) navigate(item.path);
                                }}
                                selected={isActive}
                                onMouseEnter={(e) => {
                                    if (isMini && item.subMenu) {
                                        setHoveredMenu(item.label);
                                        setAnchorEl(e.currentTarget);
                                    }
                                }}
                                onMouseLeave={() => {
                                    if (isMini) setHoveredMenu(null);
                                }}
                            >
                                {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                                {!isMini && <ListItemText primary={item.label} />}
                                {item.subMenu && !isMini && (isSubMenuOpen ? <ExpandLess /> : <ExpandMore />)}
                            </ListItemButton>
                        </Tooltip>

                        {/* Submenu for expanded mode */}
                        {!isMini && item.subMenu && (
                            <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {item.subMenu.map(sub => (
                                        <ListItemButton
                                            key={sub.label}
                                            sx={{
                                                pl: 4,
                                                mx: 1,
                                                my: 0.5,

                                                "&.Mui-selected": {
                                                    backgroundColor: "transparent",
                                                    color: theme.palette.primary.main,
                                                    "& .MuiListItemIcon-root": {
                                                        color: theme.palette.primary.main,
                                                    },
                                                    "&:hover": {
                                                        backgroundColor: theme.palette.action.hover,
                                                    },
                                                },
                                                "& .MuiListItemIcon-root": { minWidth: 28 },
                                                "& .MuiSvgIcon-root": { fontSize: "18px" },
                                                "& .MuiListItemText-primary": { fontSize: "0.8125rem" },
                                            }}
                                            selected={location.pathname === sub.path}
                                            onClick={() => navigate(sub.path)}
                                        >
                                            {sub.icon && <ListItemIcon>{sub.icon}</ListItemIcon>}
                                            <ListItemText primary={sub.label} />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        )}

                        {/* Submenu popper for mini mode */}
                        {isMini && item.subMenu && (
                            <Popper
                                open={hoveredMenu === item.label}
                                anchorEl={anchorEl}
                                placement="right-start"
                                sx={{ zIndex: 1300 }} // ensure above drawer
                                modifiers={[
                                    {
                                        name: "offset",
                                        options: { offset: [0, 0] },
                                    },
                                ]}
                            >
                                <Box
                                    onMouseEnter={() => setHoveredMenu(item.label)}
                                    onMouseLeave={() => setHoveredMenu(null)}
                                >
                                    <Paper elevation={1} sx={{ minWidth: 180 }}>
                                        <List dense>
                                            {item.subMenu.map((sub) => (
                                                <ListItemButton
                                                    key={sub.label}
                                                    sx={{
                                                        "&.Mui-selected": {
                                                            backgroundColor: theme.palette.action.selected,
                                                        },
                                                        "& .MuiListItemText-primary": { fontSize: "0.75rem" },
                                                        pl: 2,
                                                    }}
                                                    selected={location.pathname === sub.path}
                                                    onClick={() => {
                                                        navigate(sub.path);
                                                        setHoveredMenu(null);
                                                    }}
                                                >
                                                    {sub.icon && <ListItemIcon>{sub.icon}</ListItemIcon>}
                                                    <ListItemText primary={sub.label} />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Paper>
                                </Box>
                            </Popper>
                        )}


                    </div>
                );
            })}
        </List>
    );

    if (isMobile) {
        return (
            <>
                <IconButton onClick={() => setMobileOpen(true)} sx={{ position: 'absolute', top: 10, left: 10 }}>kk</IconButton>
                <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}>
                    {drawerContent}
                </Drawer>
            </>
        );
    }

    return (
        <StyledDrawer variant="permanent" isMini={isMini}>
            <Box sx={{ flexShrink: 0, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                <SidebarHeader isMini={isMini} />
            </Box>
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: "auto",

                    // scrollbar base
                    "&::-webkit-scrollbar": {
                        width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "transparent",
                        borderRadius: "6px",
                        opacity: 0,
                        transition: "opacity 0.3s ease-in-out, background-color 0.3s ease-in-out",
                    },
                    "&:hover::-webkit-scrollbar-thumb": {
                        opacity: 1,
                        backgroundColor: (theme) => theme.palette.divider,
                    },
                    "&:hover::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: (theme) => theme.palette.text.secondary,
                    },

                    // Firefox
                    scrollbarWidth: "thin",
                    scrollbarColor: "transparent transparent",
                    "&:hover": {
                        scrollbarColor: (theme) => `${theme.palette.divider} transparent`,
                        transition: "scrollbar-color 0.3s ease-in-out",
                    },
                }}
            >
                {drawerContent}
            </Box>
        </StyledDrawer>
    );
};

export default NavbarNew;
