import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import {
  Box, IconButton, InputBase, Badge, MenuItem, Menu,
  Typography, Divider, List, ListItem, ListItemText,
  Popover, Button, Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { logOut } from "../services/authenticationService";
import { getMyNotifications, getUnreadCount, markAllRead, markRead }
  from "../services/notificationService";
import { useNavigate } from "react-router-dom";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: { marginLeft: theme.spacing(3), width: "auto" },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: { width: "20ch" },
  },
}));

export default function Header() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [notifAnchor, setNotifAnchor] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isNotifOpen = Boolean(notifAnchor);

  // Load unread count on mount + every 30s
  React.useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.result || 0);
    } catch {}
  };

  const handleOpenNotif = async (e) => {
    setNotifAnchor(e.currentTarget);
    try {
      const res = await getMyNotifications();
      setNotifications(res.data.result || []);
    } catch {}
  };

  const handleCloseNotif = () => setNotifAnchor(null);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(n => n.map(x => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => { setAnchorEl(null); setMobileMoreAnchorEl(null); };
  const handleLogout = () => { handleMenuClose(); logOut(); window.location.href = "/login"; };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu anchorEl={anchorEl} id={menuId} keepMounted open={isMenuOpen} onClose={handleMenuClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}>
      <MenuItem onClick={() => { handleMenuClose(); navigate("/profile"); }}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>Log Out</MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu anchorEl={mobileMoreAnchorEl} id={mobileMenuId} keepMounted
      open={isMobileMenuOpen} onClose={() => setMobileMoreAnchorEl(null)}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}>
      <MenuItem onClick={() => { setMobileMoreAnchorEl(null); navigate("/chat"); }}>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={0} color="error"><MailIcon /></Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem onClick={handleOpenNotif}>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={unreadCount} color="error"><NotificationsIcon /></Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton size="large" color="inherit"><AccountCircle /></IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  // Notification Popover
  const renderNotifPopover = (
    <Popover open={isNotifOpen} anchorEl={notifAnchor} onClose={handleCloseNotif}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{ sx: { width: 360, maxHeight: 480, display: "flex", flexDirection: "column" } }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography fontWeight={700}>Notifications</Typography>
        {unreadCount > 0 && (
          <Tooltip title="Mark all as read">
            <Button size="small" startIcon={<DoneAllIcon />} onClick={handleMarkAllRead}>
              Read all
            </Button>
          </Tooltip>
        )}
      </Box>
      {/* List */}
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        {notifications.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4} fontSize={13}>
            No notifications
          </Typography>
        ) : (
          <List disablePadding>
            {notifications.map((n, i) => (
              <React.Fragment key={n.id}>
                <ListItem alignItems="flex-start"
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  sx={{
                    cursor: n.read ? "default" : "pointer",
                    bgcolor: n.read ? "transparent" : "action.hover",
                    "&:hover": { bgcolor: "action.selected" },
                    py: 1.5,
                  }}>
                  {/* Unread dot */}
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: n.read ? "transparent" : "primary.main", mt: 1, mr: 1.5, flexShrink: 0 }} />
                  <ListItemText
                    primary={<Typography fontSize={13} fontWeight={n.read ? 400 : 600}>{n.subject}</Typography>}
                    secondary={
                      <Typography fontSize={12} color="text.secondary"
                        sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {n.body}
                      </Typography>
                    }
                  />
                </ListItem>
                {i < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Popover>
  );

  return (
    <>
      <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }}
        onClick={() => navigate("/")}>
        <Box component="img" src="/logo/devteria-logo.png"
          sx={{ width: 35, height: 35, borderRadius: 1.5 }} />
      </IconButton>

      <Search>
        <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
        <StyledInputBase placeholder="Search…" inputProps={{ "aria-label": "search" }} />
      </Search>

      <Box sx={{ flexGrow: 1 }} />

      {/* Desktop icons */}
      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
        <IconButton size="large" color="inherit" onClick={() => navigate("/chat")}>
          <Badge badgeContent={0} color="error"><MailIcon /></Badge>
        </IconButton>
        <IconButton size="large" color="inherit" onClick={handleOpenNotif}>
          <Badge badgeContent={unreadCount || null} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <IconButton size="large" edge="end" color="inherit"
          aria-controls={menuId} aria-haspopup="true" onClick={handleProfileMenuOpen}>
          <AccountCircle />
        </IconButton>
      </Box>

      {/* Mobile icon */}
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <IconButton size="large" color="inherit"
          aria-controls={mobileMenuId} aria-haspopup="true"
          onClick={(e) => setMobileMoreAnchorEl(e.currentTarget)}>
          <MoreIcon />
        </IconButton>
      </Box>

      {renderMobileMenu}
      {renderMenu}
      {renderNotifPopover}
    </>
  );
}
