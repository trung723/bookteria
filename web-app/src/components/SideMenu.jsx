import * as React from "react";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import ChatIcon from "@mui/icons-material/Chat";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { key: "home", label: "Home", icon: <HomeIcon />, path: "/" },
  { key: "friends", label: "Friends", icon: <PeopleIcon />, path: "/friends" },
  { key: "groups", label: "Groups", icon: <GroupsIcon />, path: "/groups" },
  { key: "chat", label: "Chat", icon: <ChatIcon />, path: "/chat" },
];

function SideMenu() {
  const location = useLocation();

  return (
    <>
      <Toolbar />
      <List>
        {menuItems.map(({ key, label, icon, path }) => {
          const active = location.pathname === path;
          return (
            <ListItem key={key} disablePadding>
              <ListItemButton
                component={Link}
                to={path}
                selected={active}
                sx={{
                  borderRadius: 2,
                  mx: 0.5,
                  "&.Mui-selected": { bgcolor: "primary.light", color: "primary.contrastText" },
                }}
              >
                <ListItemIcon sx={{ color: active ? "primary.main" : "inherit" }}>{icon}</ListItemIcon>
                <ListItemText primary={label} primaryTypographyProps={{ fontWeight: active ? 700 : 500 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
    </>
  );
}

export default SideMenu;
