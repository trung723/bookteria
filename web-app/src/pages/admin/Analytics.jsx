import { useState } from "react";
import {
  Box, Typography, Paper, Grid, Button, ButtonGroup, Tab, Tabs,
} from "@mui/material";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const GROWTH_DATA = {
  "7":  [
    { label: "Mon", total: 15, new: 1 }, { label: "Tue", total: 18, new: 3 },
    { label: "Wed", total: 20, new: 2 }, { label: "Thu", total: 22, new: 2 },
    { label: "Fri", total: 25, new: 3 }, { label: "Sat", total: 28, new: 3 },
    { label: "Sun", total: 32, new: 4 },
  ],
  "30": [
    { label: "W1", total: 5, new: 1 },  { label: "W2", total: 8, new: 2 },
    { label: "W3", total: 12, new: 4 }, { label: "W4", total: 18, new: 6 },
    { label: "W5", total: 24, new: 6 }, { label: "W6", total: 30, new: 6 },
  ],
  "90": [
    { label: "M1", total: 5, new: 1 },  { label: "M2", total: 10, new: 5 },
    { label: "M3", total: 18, new: 8 }, { label: "M4", total: 25, new: 7 },
    { label: "M5", total: 32, new: 7 },{ label: "M6", total: 40, new: 8 },
  ],
};

const TRAFFIC_DATA = [
  { time: "00:00", visits: 2 }, { time: "04:00", visits: 1 },
  { time: "08:00", visits: 8 }, { time: "12:00", visits: 15 },
  { time: "14:00", visits: 12 }, { time: "16:00", visits: 10 },
  { time: "18:00", visits: 14 }, { time: "20:00", visits: 18 },
  { time: "23:59", visits: 5 },
];

const WEEKLY = [
  { day: "Mon", views: 12, users: 4, posts: 2 },
  { day: "Tue", views: 18, users: 6, posts: 3 },
  { day: "Wed", views: 15, users: 5, posts: 2 },
  { day: "Thu", views: 22, users: 7, posts: 4 },
  { day: "Fri", views: 28, users: 9, posts: 5 },
  { day: "Sat", views: 32, users: 11, posts: 6 },
  { day: "Sun", views: 21, users: 8, posts: 4 },
];

function StatCard({ label, value, icon, trend, iconBg }) {
  return (
    <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
        <Typography variant="h4" fontWeight={700} mt={0.5} mb={0.5}>{value}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TrendingUpIcon sx={{ fontSize: 14, color: "#2e7d32" }} />
          <Typography variant="caption" sx={{ color: "#2e7d32", fontWeight: 500 }}>{trend}</Typography>
          <Typography variant="caption" color="text.secondary">vs last period</Typography>
        </Box>
      </Box>
      <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </Box>
    </Paper>
  );
}

export default function Analytics() {
  const [range, setRange] = useState("7");
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} mb={0.5}>Analytics & Reports</Typography>
          <Typography variant="body2" color="text.secondary">Monitor and analyze system activities</Typography>
        </Box>
        <ButtonGroup size="small" variant="outlined">
          {["7", "30", "90"].map(r => (
            <Button key={r} onClick={() => setRange(r)}
              variant={range === r ? "contained" : "outlined"}
              sx={{ fontSize: 12, px: 2, ...(range === r ? { bgcolor: "#1a1a2e", borderColor: "#1a1a2e", "&:hover": { bgcolor: "#2d2d4e" } } : {}) }}>
              {r} days
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Visits" value="350" trend="+15%" iconBg="#e3f2fd"
            icon={<RemoveRedEyeIcon sx={{ color: "#1565c0", fontSize: 22 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Active Users" value="24" trend="+8%" iconBg="#e8f5e9"
            icon={<PeopleIcon sx={{ color: "#2e7d32", fontSize: 22 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="New Posts" value="48" trend="+12%" iconBg="#fce4ec"
            icon={<ArticleIcon sx={{ color: "#c2185b", fontSize: 22 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Average Session Time" value="2m 15s" trend="+5%" iconBg="#fff3e0"
            icon={<AccessTimeIcon sx={{ color: "#e65100", fontSize: 22 }} />} />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, "& .MuiTab-root": { fontSize: 13, textTransform: "none", minWidth: 80 } }}>
        <Tab label="Overview" />
        <Tab label="Users" />
        <Tab label="Content" />
        <Tab label="Engagement" />
      </Tabs>

      {/* Charts */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>User Growth</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>Number of users over time</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={GROWTH_DATA[range]}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b5bdb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b5bdb" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0ca678" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0ca678" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={v => v === "total" ? "Total Users" : "New Users"} />
                <Area type="monotone" dataKey="total" stroke="#3b5bdb" fill="url(#totalGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="new"   stroke="#0ca678" fill="url(#newGrad)"   strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>Traffic Overview</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>Visits count by hour of the day</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={TRAFFIC_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="visits" stroke="#7048e8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Weekly stats */}
      <Paper elevation={0} sx={{ border: "1px solid #f1f3f5", borderRadius: 2, p: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={2}>Weekly Statistics</Typography>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={WEEKLY}>
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b5bdb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b5bdb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} formatter={v => ({ views: "Views", users: "Users", posts: "Posts" })[v] || v} />
            <Area type="monotone" dataKey="views" stroke="#3b5bdb" fill="url(#viewsGrad)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="users" stroke="#0ca678" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="posts" stroke="#e64980" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
