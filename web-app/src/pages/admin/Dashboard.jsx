import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Paper, Avatar, Chip, CircularProgress, Divider,
} from "@mui/material";
import PeopleIcon      from "@mui/icons-material/People";
import TrendingUpIcon  from "@mui/icons-material/TrendingUp";
import ArticleIcon     from "@mui/icons-material/Article";
import VerifiedIcon    from "@mui/icons-material/Verified";
import { getDashboardData } from "../../services/adminService";

function StatCard({ label, value, icon, iconBg, loading }) {
  return (
    <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
        {loading
          ? <CircularProgress size={20} sx={{ mt: 1 }} />
          : <Typography variant="h4" fontWeight={700} mt={0.5} mb={0.5}>{value}</Typography>
        }
      </Box>
      <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const [data,    setData]    = useState({ users: [], profiles: [], posts: [], totalPosts: 0 });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  // Merge user identity + profile for display
  const enrichedUsers = data.users.map(u => {
    const profile = data.profiles.find(p => p.userId === u.id) ?? {};
    return { ...u, ...profile };
  });

  const verifiedUsers = data.users.filter(u => u.emailVerified).length;
  const adminUsers    = data.users.filter(u => u.roles?.some(r => r.name === "ADMIN")).length;
  const recentUsers   = enrichedUsers.slice(0, 5);
  const recentPosts   = data.posts.slice(0, 5);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Overview of system activity
      </Typography>

      {error && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "#fff5f5", border: "1px solid #ffe0e0", borderRadius: 2 }}>
          <Typography color="error" variant="body2">{error}</Typography>
        </Paper>
      )}

      {/* Stat cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Users" value={data.users.length} loading={loading}
            iconBg="#e8eaf6" icon={<PeopleIcon sx={{ color: "#3949ab", fontSize: 22 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Verified Emails" value={verifiedUsers} loading={loading}
            iconBg="#e8f5e9" icon={<VerifiedIcon sx={{ color: "#2e7d32", fontSize: 22 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Posts (Feed)" value={data.posts.length} loading={loading}
            iconBg="#fce4ec" icon={<ArticleIcon sx={{ color: "#c2185b", fontSize: 22 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Admin Accounts" value={adminUsers} loading={loading}
            iconBg="#fff3e0" icon={<PeopleIcon sx={{ color: "#e65100", fontSize: 22 }} />} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Recent users */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <PeopleIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="subtitle2" fontWeight={600}>Recent Users</Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={24} /></Box>
            ) : recentUsers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No data available.</Typography>
            ) : recentUsers.map((u, i) => {
              const isAdmin   = u.roles?.some(r => r.name === "ADMIN");
              const initials  = [u.firstName, u.lastName].filter(Boolean).map(s => s[0]).join("").toUpperCase()
                             || u.username?.[0]?.toUpperCase() || "?";
              return (
                <Box key={u.id || i}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar src={u.avatar} sx={{ width: 32, height: 32, fontSize: 12 }}>{initials}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500} fontSize={13}>{u.username}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={isAdmin ? "admin" : "user"}
                      size="small"
                      sx={{ bgcolor: isAdmin ? "#1a1a2e" : "#f1f3f5", color: isAdmin ? "#fff" : "#495057", fontSize: 11, height: 22, fontWeight: 600 }}
                    />
                  </Box>
                  {i < recentUsers.length - 1 && <Divider sx={{ borderColor: "#f8f9fa" }} />}
                </Box>
              );
            })}
          </Paper>
        </Grid>

        {/* Recent posts */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <ArticleIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="subtitle2" fontWeight={600}>Recent Posts</Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={24} /></Box>
            ) : recentPosts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No data available.</Typography>
            ) : recentPosts.map((post, i) => (
              <Box key={post.id || i}>
                <Box sx={{ py: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Avatar src={post.userAvatar} sx={{ width: 26, height: 26, fontSize: 11 }}>
                      {post.username?.[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600} fontSize={13}>{post.username}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {post.createdDate ? new Date(post.createdDate).toISOString().slice(0, 10) : post.created || "—"}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontSize={13} sx={{ pl: 4.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {post.content}
                  </Typography>
                </Box>
                {i < recentPosts.length - 1 && <Divider sx={{ borderColor: "#f8f9fa" }} />}
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}