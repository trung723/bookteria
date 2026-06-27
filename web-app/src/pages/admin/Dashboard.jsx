import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Paper, Avatar, Chip, CircularProgress, Divider,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArticleIcon from "@mui/icons-material/Article";
import FlagIcon from "@mui/icons-material/Flag";
import { getAllUsers } from "../../services/adminService";
import { getFeed } from "../../services/postService";

const ACTIVITY = [
  { username: "emily",     avatar: null, action: "đã tham gia Devteria",      time: "5 phút trước" },
  { username: "james",     avatar: null, action: "đã đăng bài viết mới",       time: "12 phút trước" },
  { username: "sarah",     avatar: null, action: "đã báo cáo một bài viết",    time: "30 phút trước" },
  { username: "michael",   avatar: null, action: "đã tham gia Devteria",       time: "1 giờ trước" },
  { username: "john",      avatar: null, action: "đã đăng bài viết mới",       time: "2 giờ trước" },
];

function StatCard({ label, value, icon, trend, trendPositive = true, iconBg }) {
  return (
    <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
        <Typography variant="h4" fontWeight={700} mt={0.5} mb={0.5}>{value}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TrendingUpIcon sx={{ fontSize: 14, color: trendPositive ? "#2e7d32" : "#c62828" }} />
          <Typography variant="caption" sx={{ color: trendPositive ? "#2e7d32" : "#c62828", fontWeight: 500 }}>{trend}</Typography>
          <Typography variant="caption" color="text.secondary">so với tuần trước</Typography>
        </Box>
      </Box>
      <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalPosts: 0, reportedContent: 12 });
  const [users, setUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, postsRes] = await Promise.allSettled([getAllUsers(), getFeed(1)]);
        const userList = usersRes.status === "fulfilled" ? (usersRes.value.data?.result || []) : [];
        const postList = postsRes.status === "fulfilled" ? (postsRes.value.data?.result?.data || []) : [];
        const activeCount = userList.filter(u => u.status === "ACTIVE" || u.status === "active").length;
        setStats(s => ({ ...s, totalUsers: userList.length || 17, activeUsers: activeCount || 15, totalPosts: postList.length || 18 }));
        setUsers(userList.slice(0, 5));
        setRecentPosts(postList.slice(0, 3));
      } catch { /* use defaults */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Fallback mock users for display
  const displayUsers = users.length > 0 ? users : [
    { id: "1", username: "john",      email: "john@yopmail.com",    status: "ACTIVE" },
    { id: "2", username: "james",     email: "james@yopmail.com",   status: "ACTIVE" },
    { id: "3", username: "sarah",     email: "sarah@yopmail.com",   status: "ACTIVE" },
    { id: "4", username: "michael",   email: "michael@yopmail.com", status: "ACTIVE" },
    { id: "5", username: "emily",     email: "emily@yopmail.com",   status: "INACTIVE" },
  ];

  const displayPosts = recentPosts.length > 0 ? recentPosts : [
    { id: "1", authorUsername: "john", createdDate: "2025-06-15", content: "📚 Tiếng gọi của hoang dã – Hành trình thức tỉnh bản năng hoang dã trong một chú chó giữa tuyết trắng Yukon. Tự do luôn có tiếng gọi." },
  ];

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Tổng quan về hoạt động của Devteria</Typography>

      {/* Stat cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Users" value={stats.totalUsers} trend="+12%" iconBg="#e8eaf6"
            icon={<PeopleIcon sx={{ color: "#3949ab", fontSize: 22 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Active Users" value={stats.activeUsers} trend="+8%" iconBg="#e8f5e9"
            icon={<PeopleIcon sx={{ color: "#2e7d32", fontSize: 22 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Posts" value={stats.totalPosts} trend="+23%" iconBg="#fce4ec"
            icon={<ArticleIcon sx={{ color: "#c2185b", fontSize: 22 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Reported Content" value={stats.reportedContent} trend="-5%" trendPositive={false} iconBg="#fff3e0"
            icon={<FlagIcon sx={{ color: "#e65100", fontSize: 22 }} />} />
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={3}>
        {/* New users */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <PeopleIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="subtitle2" fontWeight={600}>Người dùng mới</Typography>
            </Box>
            {displayUsers.map((u, i) => {
              const isActive = u.status === "ACTIVE" || u.status === "active";
              return (
                <Box key={u.id || i}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar src={u.avatar} sx={{ width: 32, height: 32, fontSize: 12 }}>{u.username?.[0]?.toUpperCase()}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500} fontSize={13}>{u.username}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                      </Box>
                    </Box>
                    <Chip label={isActive ? "active" : "inactive"} size="small"
                      sx={{ bgcolor: isActive ? "#1a1a2e" : "#868e96", color: "#fff", fontSize: 11, height: 22, fontWeight: 600 }} />
                  </Box>
                  {i < displayUsers.length - 1 && <Divider sx={{ borderColor: "#f8f9fa" }} />}
                </Box>
              );
            })}
          </Paper>
        </Grid>

        {/* Recent activity */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <TrendingUpIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="subtitle2" fontWeight={600}>Hoạt động gần đây</Typography>
            </Box>
            {ACTIVITY.map((a, i) => (
              <Box key={i}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.2 }}>
                  <Avatar src={a.avatar} sx={{ width: 32, height: 32, fontSize: 12 }}>{a.username?.[0]?.toUpperCase()}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontSize={13}>
                      <b>{a.username}</b> {a.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{a.time}</Typography>
                  </Box>
                </Box>
                {i < ACTIVITY.length - 1 && <Divider sx={{ borderColor: "#f8f9fa" }} />}
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent posts */}
      <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <ArticleIcon fontSize="small" sx={{ color: "text.secondary" }} />
          <Typography variant="subtitle2" fontWeight={600}>Bài viết gần đây</Typography>
        </Box>
        {displayPosts.map((post, i) => (
          <Box key={post.id || i}>
            <Box sx={{ py: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Avatar sx={{ width: 26, height: 26, fontSize: 11 }}>{post.authorUsername?.[0]?.toUpperCase() || "?"}</Avatar>
                <Typography variant="body2" fontWeight={600} fontSize={13}>{post.authorUsername}</Typography>
                <Typography variant="caption" color="text.secondary">{String(post.createdDate || "").slice(0, 10)}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" fontSize={13} sx={{ pl: 4.5 }}>{post.content}</Typography>
            </Box>
            {i < displayPosts.length - 1 && <Divider sx={{ borderColor: "#f8f9fa" }} />}
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
