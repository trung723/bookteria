import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Avatar, Button, TextField, InputAdornment,
  Card, CardContent, CircularProgress, Tabs, Tab, Divider, Chip, Snackbar, Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import Scene from "./Scene";
import { search, followUser, unfollowUser, getFollowing, getFollowers } from "../services/userService";
import { getMyInfo } from "../services/userService";
import { isAuthenticated } from "../services/authenticationService";

function UserCard({ user, onToggleFollow }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try { await onToggleFollow(user); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
      <Avatar src={user.avatar} sx={{ width: 44, height: 44 }}>
        {user.username?.[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography fontWeight={600} fontSize={14}>{user.username}</Typography>
        <Typography fontSize={12} color="text.secondary">
          {user.firstName} {user.lastName}{user.city ? ` • ${user.city}` : ""}
        </Typography>
        <Typography fontSize={11} color="text.secondary">
          {user.followerCount || 0} followers
        </Typography>
      </Box>
      <Button
        size="small"
        variant={user.followedByMe ? "outlined" : "contained"}
        color={user.followedByMe ? "error" : "primary"}
        startIcon={user.followedByMe ? <PersonRemoveIcon /> : <PersonAddIcon />}
        onClick={handleClick}
        disabled={loading}
      >
        {user.followedByMe ? "Unfollow" : "Follow"}
      </Button>
    </Box>
  );
}

export default function Friends() {
  const [tab, setTab] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [myUserId, setMyUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    getMyInfo().then(res => {
      const uid = res.data.result.userId;
      setMyUserId(uid);
      loadFollowing(uid);
      loadFollowers(uid);
    });
  }, [navigate]);

  const loadFollowing = async (uid) => {
    try {
      const res = await getFollowing(uid);
      setFollowing(res.data.result || []);
    } catch {}
  };

  const loadFollowers = async (uid) => {
    try {
      const res = await getFollowers(uid);
      setFollowers(res.data.result || []);
    } catch {}
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const res = await search(keyword);
      setSearchResults(res.data.result || []);
      setTab(2);
    } catch {}
    finally { setLoading(false); }
  };

  const handleToggleFollow = async (user) => {
    try {
      if (user.followedByMe) {
        await unfollowUser(user.userId);
        setSnack({ open: true, message: `Unfollowed ${user.username}`, severity: "info" });
      } else {
        await followUser(user.userId);
        setSnack({ open: true, message: `Followed ${user.username}`, severity: "success" });
      }
      // Refresh data
      if (myUserId) { loadFollowing(myUserId); loadFollowers(myUserId); }
      // Update in place
      const toggle = list => list.map(u => u.userId === user.userId
        ? { ...u, isFollowedByMe: !u.isFollowedByMe, followerCount: u.followerCount + (u.isFollowedByMe ? -1 : 1) }
        : u);
      setFollowing(toggle);
      setFollowers(toggle);
      setSearchResults(toggle);
    } catch {
      setSnack({ open: true, message: "Action failed!", severity: "error" });
    }
  };

  const renderList = (list) => {
    if (!list.length) return (
      <Typography color="text.secondary" textAlign="center" py={4}>No one here.</Typography>
    );
    return list.map((u, i) => (
      <Box key={u.userId}>
        <UserCard user={u} onToggleFollow={handleToggleFollow} />
        {i < list.length - 1 && <Divider />}
      </Box>
    ));
  };

  return (
    <Scene>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} sx={{ mt: "64px" }}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>

      <Card sx={{ minWidth: 500, maxWidth: 640, mt: "20px", boxShadow: 2, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>Friends & Followers</Typography>

          {/* Search bar */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              fullWidth size="small" placeholder="Search users..."
              value={keyword} onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
            <Button variant="contained" onClick={handleSearch} disabled={loading}>Search</Button>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
            <Tab label={<Box>Following <Chip label={following.length} size="small" sx={{ ml: 0.5 }} /></Box>} />
            <Tab label={<Box>Followers <Chip label={followers.length} size="small" sx={{ ml: 0.5 }} /></Box>} />
            {searchResults.length > 0 && <Tab label="Search Results" />}
          </Tabs>

          {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}><CircularProgress size={28} /></Box>}

          {!loading && tab === 0 && renderList(following)}
          {!loading && tab === 1 && renderList(followers)}
          {!loading && tab === 2 && renderList(searchResults)}
        </CardContent>
      </Card>
    </Scene>
  );
}
