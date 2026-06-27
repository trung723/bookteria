import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Badge,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import MessageIcon from "@mui/icons-material/Message";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import { Link, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 200;

const menuItems = [
  { key: "dashboard", label: "Dashboard",  icon: <DashboardIcon fontSize="small" />, path: "/admin" },
  { key: "analytics", label: "Analytics",  icon: <BarChartIcon fontSize="small" />,  path: "/admin/analytics" },
  { key: "users",     label: "Users",       icon: <PeopleIcon fontSize="small" />,    path: "/admin/users" },
  { key: "posts",     label: "Posts",       icon: <ArticleIcon fontSize="small" />,   path: "/admin/posts" },
  { key: "messages",  label: "Messages",   icon: <MessageIcon fontSize="small" />,   path: "/admin/messages", badge: 2 },
  { key: "reports",   label: "Reports",    icon: <AssessmentIcon fontSize="small" />, path: "/admin/reports" },
  { key: "settings",  label: "Settings",   icon: <SettingsIcon fontSize="small" />,  path: "/admin/settings" },
];

export default function AdminLayout({ children }) {
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "#1a1a2e",
            color: "#fff",
            borderRight: "none",
          },
        }}
      >
        {/* Brand */}
        <Box sx={{ px: 2.5, py: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#fff" }}>
            Devteria Admin
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            Administration Panel
          </Typography>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <List sx={{ px: 1, pt: 1 }}>
          {menuItems.map(({ key, label, icon, path, badge }) => {
            const active = location.pathname === path ||
              (path !== "/admin" && location.pathname.startsWith(path));
            return (
              <ListItem key={key} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={path}
                  sx={{
                    borderRadius: 1.5,
                    py: 1,
                    bgcolor: active ? "#3b5bdb" : "transparent",
                    "&:hover": { bgcolor: active ? "#3b5bdb" : "rgba(255,255,255,0.07)" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34, color: active ? "#fff" : "rgba(255,255,255,0.5)" }}>
                    {badge ? (
                      <Badge badgeContent={badge} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 9, minWidth: 15, height: 15 } }}>
                        {icon}
                      </Badge>
                    ) : icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: active ? "#fff" : "rgba(255,255,255,0.6)",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f8f9fa", minHeight: "100vh", overflow: "auto" }}>
        {children}
      </Box>
    </Box>
  );
}
